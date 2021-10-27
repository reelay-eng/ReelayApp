import { DataStore } from 'aws-amplify';
import { Reelay, Like, Comment } from '../src/models';
import Constants from 'expo-constants';

import { showErrorToast, showMessageToast } from '../components/utils/toasts';

const COMMENT_VISIBILITY = Constants.manifest.extra.feedVisibility; // this should be its own variable
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

export const addComment = async (reelay, comment, user) => {
    const commentObjAmplify = {
        userID: user.username,
        reelayID: reelay.sub,
        creatorID: reelay.creator.username,
        content: comment,
        postedAt: new Date().toISOString(),
        visibility: COMMENT_VISIBILITY,
    };

    // commentObjDisplay follows the ReelayDB format, not the Amplify format
    const commentObjDisplay = {
        authorName: user.username,
        reelaySub: reelay.sub,
        creatorName: reelay.creator.username,
        content: comment,
        postedAt: new Date().toISOString(),
        visibility: COMMENT_VISIBILITY,
    };
    reelay.comments.push(commentObjDisplay);

    try {
        await DataStore.save(new Comment(commentObjAmplify));
        showMessageToast('Comment posted!');
        return commentObjDisplay;    
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');   
    }
}

export const addLike = async (reelay, user) => {
    const likeObjAmplify = {
        userID: user.username,
        reelayID: reelay.sub,
        creatorID: reelay.creator.username,
        postedAt: new Date().toISOString(),
    };

    // likeObjDisplay follows the ReelayDB format, not the Amplify format
    const likeObjDisplay = {
        username: user.username,
        creatorName: reelay.creator.username,
        reelaySub: reelay.sub,
        postedAt: new Date().toISOString(),
    }
    reelay.likes.push(likeObjDisplay);

    try {
        await DataStore.save(new Like(likeObjAmplify));
        return likeObjDisplay;    
    } catch (e) {
        console.log(e);
        showErrorToast('Something went wrong');
    }
}

export const deleteLike = async (reelay, user) => {
    reelay.likes = reelay.likes.filter(
        likes => likes.username !== user.username
    );

    try {
        const queryConstraints = like => {
            return like.reelayID('eq', String(reelay.sub)).userID('eq', String(user.username));
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
            return r.visibility('eq', FEED_VISIBILITY).id('eq', String(reelay.sub));
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