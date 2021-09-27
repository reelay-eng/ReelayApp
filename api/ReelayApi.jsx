import { DataStore, SortDirection } from 'aws-amplify';
import { Reelay, Like, Comment } from '../src/models';
import Constants from 'expo-constants';

import { fetchAnnotatedTitle } from './TMDbApi';
import { showErrorToast, showMessageToast } from '../components/utils/toasts';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const COMMENT_VISIBILITY = Constants.manifest.extra.feedVisibility; // this should be its own variable
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

// note that we're storing the username in the user ID field
// in ReelayDB, we want to store the user's sub until migration is complete
export const addComment = async (reelay, comment, user) => {
    const commentObj = {
        userID: user.username,
        reelayID: reelay.id,
        creatorID: reelay.creator.username,
        content: comment,
        postedAt: new Date().toISOString(),
        visibility: COMMENT_VISIBILITY,
    };
    reelay.comments.push(commentObj);

    try {
        await DataStore.save(new Comment(commentObj));
        showMessageToast('Comment posted!');
        return commentObj;    
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');   
    }
}

export const addLike = async (reelay, user) => {
    const likeObj = {
        userID: user.username,
        reelayID: reelay.id,
        creatorID: reelay.creator.username,
        postedAt: new Date().toISOString(),
    };
    reelay.likes.push(likeObj);

    try {
        await DataStore.save(new Like(likeObj));
        return likeObj;    
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');
    }
}

export const deleteComment = async (reelay, commentID) => {
    reelay.comments = reelay.comments.filter(
        comment => comment.id !== commentID
    );

    try {
        const queryConstraints = comment => {
            return comment.visibility('eq', FEED_VISIBILITY).id('eq', String(commentID));
        }    
        const queryResponse = await DataStore.query(Comment, queryConstraints);
        if (!queryResponse || !queryResponse.length) {
            console.log('No query response');
            return false; // failure
        }
        const fetchedComment = queryResponse[0];
        await DataStore.save(Comment.copyOf(fetchedComment, updated => {
            updated.visibility = 'hidden';
        }));
        return true; // success
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');
        return false;
    }
}

export const deleteLike = async (reelay, user) => {
    reelay.likes = reelay.likes.filter(
        likes => likes.userID !== user.username
    );

    try {
        const queryConstraints = like => {
            return like.reelayID('eq', String(reelay.id)).userID('eq', String(user.username));
        }
        const queryResponse = await DataStore.query(Like, queryConstraints);
        queryResponse.forEach(async fetchedLike => await DataStore.delete(fetchedLike));
        return true; // success    
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');
        return false;
    }
}

export const deleteReelay = async (reelay) => {
    try {
        const queryConstraints = r => {
            return r.visibility('eq', FEED_VISIBILITY).id('eq', String(reelay.id));
        }
        const queryResponse = await DataStore.query(Reelay, queryConstraints);
    
        if (!queryResponse || !queryResponse.length) {
            console.log('No query response');
            return false; // failure
        }
    
        const fetchedReelay = queryResponse[0];
        // todo: try catch
        await DataStore.save(Reelay.copyOf(fetchedReelay, updated => {
            updated.visibility = 'hidden';
        }));
        return true; // success
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');
        return false;
    }
}

export const fetchFeedNextPage = async ({ batchSize, page, reelayList, refresh }) => {
    const queryConstraints = r => {
        return r.visibility('eq', FEED_VISIBILITY);
    }
    console.log('query initiated, page: ', page / batchSize);
    const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
        sort: r => r.uploadedAt(SortDirection.DESCENDING),
        page: page / batchSize,
        limit: batchSize,
    });
    console.log('query finished');

    if (!fetchedReelays || !fetchedReelays.length) {
        console.log('No query response');
        return [];
    }

    const preparedReelays = await Promise.all(fetchedReelays.map(prepareReelay));
    let filteredReelays = preparedReelays.filter(notDuplicateInBatch);
    if (!refresh) {
        filteredReelays = filteredReelays.filter(reelay => notDuplicateInFeed(reelay, reelayList));
    }
    
    console.log('prepared reelays');
    preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username, reelay.id));
    console.log('filtered reelays');
    filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
    return filteredReelays;
}

export const fetchReelaysForStack = async ({ stack, page, batchSize }) => {
    const titleID = stack[0].titleID;
    const queryConstraints = r => {
        return r.visibility('eq', FEED_VISIBILITY).tmdbTitleID('eq', String(titleID));
    }

    const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
        sort: r => r.uploadedAt(SortDirection.DESCENDING),
        page: page,
        limit: batchSize,
    });

    if (!fetchedReelays || !fetchedReelays.length) {
        console.log('No query response');
        return [];
    }

    const preparedReelays = await Promise.all(fetchedReelays.map(prepareReelay));
    const notDuplicate = (element) => stack.findIndex(el => el.id == element.id) == -1;
    const filteredReelays = preparedReelays.filter(notDuplicate);
    filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username, reelay.titleID));
    return filteredReelays;
}

export const getComments = async (fetchedReelay) => {
    const queryConstraints = r => {
        return r.visibility('eq', COMMENT_VISIBILITY).reelayID('eq', String(fetchedReelay.id));
    }
    const fetchedComments = await DataStore.query(Comment, queryConstraints, {
        sort: comment => comment.postedAt(SortDirection.ASCENDING),
    });

    if (!fetchedComments?.length) {
        // console.log('No comments for this reelay');
        return [];
    }
    return fetchedComments;
}

export const getLikes = async (fetchedReelay) => {
    const queryConstraints = r => r.reelayID('eq', String(fetchedReelay.id));
    const fetchedLikes = await DataStore.query(Like, queryConstraints, {
        sort: like => like.postedAt(SortDirection.DESCENDING),
    });

    if (!fetchedLikes?.length) {
        // console.log('No likes for this reelay');
        return [];
    }
    return fetchedLikes;
}

const getVideoURIObject = async (fetchedReelay) => {
    const videoS3Key = (fetchedReelay.videoS3Key.endsWith('.mp4')) 
            ? fetchedReelay.videoS3Key : (fetchedReelay.videoS3Key + '.mp4');
    const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
    return { id: fetchedReelay.id, videoURI: cloudfrontVideoURI };
}

const notDuplicateInBatch = (reelay, index, preparedReelays) => {
    const alreadyInBatch = (preparedReelays.findIndex((batchEl, ii) => {
        return (batchEl.titleID === reelay.titleID) && (ii < index);
    }) >= 0);
    return !alreadyInBatch;
}

const notDuplicateInFeed = (reelay, reelayList) => {
    const alreadyInFeed = (reelayList.findIndex(listReelay => {
        return listReelay.titleID === reelay.titleID;
    }) >= 0);
    return !alreadyInFeed;
}

const prepareReelay = async (fetchedReelay) => {
    const comments = await getComments(fetchedReelay);
    const likes = await getLikes(fetchedReelay);
    const titleObject = await fetchAnnotatedTitle(
        fetchedReelay.tmdbTitleID, 
        fetchedReelay.isSeries
    );
    const videoURIObject = await getVideoURIObject(fetchedReelay);
    const releaseYear = (titleObject?.release_date?.length >= 4)
        ? (titleObject.release_date.slice(0,4)) : '';	

    return {
        id: fetchedReelay.id,
        comments: comments,
        creator: {
            avatar: '../../assets/images/icon.png',
            id: fetchedReelay.creatorID,
            username: String(fetchedReelay.owner),
        },
        likes: likes,
        overlayInfo: {
            director: titleObject.director,
            displayActors: titleObject.displayActors,
            overview: titleObject.overview,
            tagline: titleObject.tagline,
            trailerURI: titleObject.trailerURI,
        },
        postedDateTime: fetchedReelay.uploadedAt,
        posterURI: titleObject ? titleObject.poster_path : null,
        releaseDate: titleObject.release_date,
        releaseYear: releaseYear,
        title: titleObject.title,
        titleID: titleObject.id,
        venue: fetchedReelay.venue ? fetchedReelay.venue : null,
        videoURI: videoURIObject.videoURI,
    };
}