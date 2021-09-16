import { DataStore, SortDirection } from 'aws-amplify';
import { Reelay, Like, Comment } from '../src/models';
import Constants from 'expo-constants';

import { fetchAnnotatedTitle } from './TMDbApi';

const CLOUDFRONT_BASE_URL = 'https://di92fpd9s7eko.cloudfront.net';
const COMMENT_VISIBILITY = Constants.manifest.extra.feedVisibility; // this should be its own variable
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const addComment = async (reelay, comment, user) => {
    // todo: check on the ID relationships here
    const commentObj = new Comment({
        userID: user.attributes.sub,
        reelayID: reelay.id,
        creatorID: reelay.creator.id,
        content: comment,
        postedAt: new Date().toISOString(),
        visibility: COMMENT_VISIBILITY,
    });
    const uploadStatusDataStore = await DataStore.save(commentObj);
}

export const addLike = async (reelay, user) => {
    // todo: check on the ID relationships here
    const likeObj = new Like({
        userID: user.attributes.sub,
        reelayID: reelay.id,
        creatorID: reelay.creator.id,
        postedAt: new Date().toISOString(),
    });
    const uploadStatusDataStore = await DataStore.save(likeObj);
}

export const deleteComment = async (reelay, commentID) => {
    // todo: check on the ID relationships here
    const queryConstraints = comment => comment.visibility('eq', FEED_VISIBILITY).id('eq', String(commentID));
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
}

export const deleteLike = async (reelay, user) => {
    // todo: check on the ID relationships here
    const queryConstraints = like => like.reelayID('eq', String(reelay.id)).userID('eq', String(user.attributes.sub));
    const queryResponse = await DataStore.query(Comment, queryConstraints);

    if (!queryResponse || !queryResponse.length) {
        console.log('No query response');
        return false; // failure
    }

    const fetchedLike = queryResponse[0];
    await DataStore.delete(fetchedLike);
    return true; // success
}

export const deleteReelay = async (reelay) => {
    const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).id('eq', String(reelay.id));
    const queryResponse = await DataStore.query(Reelay, queryConstraints);

    if (!queryResponse || !queryResponse.length) {
        console.log('No query response');
        return false; // failure
    }

    const fetchedReelay = queryResponse[0];
    await DataStore.save(Reelay.copyOf(fetchedReelay, updated => {
        updated.visibility = 'hidden';
    }));
    return true; // success
}

export const fetchFeedNextPage = async ({ batchSize, page, reelayList, refresh }) => {
    if (page > 20) return;
    const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY);
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

    const preparedReelays = await prepareReelayBatch(fetchedReelays);
    let filteredReelays = preparedReelays.filter(notDuplicateInBatch);
    if (!refresh) {
        filteredReelays = filteredReelays.filter(reelay => notDuplicateInFeed(reelay, reelayList));
    }
    
    console.log('prepared reelays');
    preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
    console.log('filtered reelays');
    filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
    return filteredReelays;
}

export const fetchReelaysForStack = async ({ stack, page, batchSize }) => {
    const titleID = stack[0].titleID;
    const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).tmdbTitleID('eq', String(titleID));

    const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
        sort: r => r.uploadedAt(SortDirection.DESCENDING),
        page: page,
        limit: batchSize,
    });

    if (!fetchedReelays || !fetchedReelays.length) {
        console.log('No query response');
        return;
    }

    const preparedReelays = await prepareReelayBatch(fetchedReelays);
    const notDuplicate = (element) => stack.findIndex(el => el.id == element.id) == -1;
    const filteredReelays = preparedReelays.filter(notDuplicate);
    return filteredReelays;
}

export const getComments = async (fetchedReelay) => {
    const queryConstraints = r => r.visibility('eq', COMMENT_VISIBILITY).reelayID('eq', String(fetchedReelay.id));
    const fetchedComments = await DataStore.query(Comment, queryConstraints, {
        sort: comment => comment.postedAt(SortDirection.DESCENDING),
    });

    if (!fetchedComments?.length) {
        console.log('No comments for this reelay');
        return;
    }
    console.log('fetched comments: ', fetchedComments);
}

export const getLikes = async (fetchedReelay) => {
    const queryConstraints = r => r.visibility('eq', COMMENT_VISIBILITY).reelayID('eq', String(fetchedReelay.id));
    const fetchedComments = await DataStore.query(Comment, queryConstraints, {
        sort: comment => comment.postedAt(SortDirection.DESCENDING),
    });

    if (!fetchedComments?.length) {
        console.log('No comments for this reelay');
        return;
    }
    console.log('fetched comments: ', fetchedComments);
}

const getVideoURI = async (fetchedReelay) => {
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

const prepareReelay = (fetchedReelay, titleObject, videoURI) => {
    const releaseYear = (titleObject?.release_date?.length >= 4)
        ? (titleObject.release_date.slice(0,4)) : '';	

    return {
        id: fetchedReelay.id,
        titleID: titleObject.id,
        title: titleObject.title,
        releaseDate: titleObject.release_date,
        releaseYear: releaseYear,
        creator: {
            avatar: '../../assets/images/icon.png',
            id: fetchedReelay.creatorID,
            username: String(fetchedReelay.owner),
        },
        overlayInfo: {
            director: titleObject.director,
            displayActors: titleObject.displayActors,
            overview: titleObject.overview,
            tagline: titleObject.tagline,
            trailerURI: titleObject.trailerURI,
        },
        venue: fetchedReelay.venue ? fetchedReelay.venue : null,
        videoURI: videoURI,
        posterURI: titleObject ? titleObject.poster_path : null,
        postedDateTime: fetchedReelay.uploadedAt,
    };
}

const prepareReelayBatch = async (fetchedReelays) => {
    const titleObjectPromises = fetchedReelays.map(async reelay => {
        return await fetchAnnotatedTitle(reelay.tmdbTitleID, reelay.isSeries);
    });
    const videoURIPromises = fetchedReelays.map(async reelay => {
        return await getVideoURI(reelay);
    });

    const titles = await Promise.all(titleObjectPromises);
    const videoUris = await Promise.all(videoURIPromises);

    const preparedReelays = fetchedReelays.map(reelay => {
        const titleIndex = titles.findIndex(title => {
            return Number(title.id) === Number(reelay.tmdbTitleID);
        });
        const titleObject = titles[titleIndex];
        if (!titleObject) {
            console.log('IN PREPARE REELAY, TITLE OBJECT IS NULL');
            console.log('reelay: ', reelay);
            console.log('titleIndex: ', titleIndex);
            console.log('titles: ', titles);
        }
        const uriObject = videoUris.find((obj) => {
            return obj.id === reelay.id;
        });
        const preparedReelay = prepareReelay(reelay, titleObject, uriObject.videoURI);
        return preparedReelay;
    });
    return preparedReelays;
}