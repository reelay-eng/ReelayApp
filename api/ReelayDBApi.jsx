import Constants from 'expo-constants';
import { fetchResults, fetchResults2 } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

export const followCreator = async (creatorSub, followerSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeGet);
    const follow = await fetchResults(routeGet, {
        method: "POST",
        headers: REELAY_API_HEADERS,
    });

    if (!follow) {
        console.log("Could not follow user")
    }
    return follow;
}

export const acceptFollowRequest = async (creatorSub, followerSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/accept?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeGet);
    const follow = await fetchResults(routeGet, {
      method: "POST",
      headers: REELAY_API_HEADERS,
    });
    if (!follow) {
      console.log("Could not accept user follow request");
    }
}

export const rejectFollowRequest = async (creatorSub, followerSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/reject?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeGet);
    const follow = await fetchResults(routeGet, {
        method: "DELETE",
        headers: REELAY_API_HEADERS,
    });
    if (!follow) {
        console.log("Could not reject user follow request");
    }
};

export const unfollowCreator = async (creatorSub, followerSub) => {
    const routeRemove = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeRemove);
    const unfollow = await fetchResults(routeRemove, {
        method: "DELETE",
        headers: REELAY_API_HEADERS,
    });
    console.log(unfollow)
    if (!unfollow) {
        console.log("Could not unfollow user");
    }
}

export const getFollowing = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/follower/sub/${creatorSub}`;
    console.log(routeGet);
    const following = await fetchResults(routeGet, {
        method: "GET",
        headers: REELAY_API_HEADERS,
    });
    if (!following) {
        console.log("Could not get following for this creator");
        return null;
    }
    return following;
};

export const getFollowers = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/creator/sub/${creatorSub}`;
    console.log(routeGet);
    const followers = await fetchResults(routeGet, {
        method: "GET",
        headers: REELAY_API_HEADERS,
    });
    if (!followers) {
        console.log("Could not get followers for this creator");
        return null;
    }
    return followers;
};

export const getFollowRequests = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/creator/sub/${creatorSub}/requests`;
    console.log(routeGet);
    const requests = await fetchResults(routeGet, {
        method: "GET",
        headers: REELAY_API_HEADERS,
    });
    if (!requests) {
        console.log("Could not get follow requests for this creator");
        return null;
    }
    return requests;
};
export const getReelay = async (reelaySub) => {
    const routeGet = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}?visibility=${FEED_VISIBILITY}`;
    console.log('ROUTE GET: ', routeGet);
    const fetchedReelay = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    if (!fetchedReelay) {
        console.log('Could not get reelays for this creator');
        return null;
    }

    console.log(fetchedReelay);

    return fetchedReelay;
}

export const getReelaysByCreator = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/sub/${creatorSub}/reelays?visibility=${FEED_VISIBILITY}`;
    const fetchedReelays = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    if (!fetchedReelays) {
        console.log('Could not get reelays for this creator');
        return null;
    }
    return fetchedReelays;
}

export const getStacksByCreator = async (creatorSub) => {
    console.log('Getting stacks by creator');
    const creatorReelays = await getReelaysByCreator(creatorSub);
    if (!creatorReelays) return [];

    const  preparedReelays = await Promise.all(creatorReelays.map(prepareReelay));

    const indexInStacks = (stacks, reelay) => {
        if (stacks.length === 0) return -1;
        const forSameTitle = (stack) => (stack[0].title.id === reelay.title.id);
        return stacks.findIndex(forSameTitle);
    }

    let stacksByCreator = [];
    preparedReelays.forEach(reelay => {
        const index = indexInStacks(stacksByCreator, reelay);
        if (index >= 0) {
            stacksByCreator[index].push(reelay);
        } else {
            stacksByCreator.push([reelay]);
        }
    });

    return stacksByCreator;
}

export const getMostRecentStacks = async (page = 0) => {
    console.log('Getting most recent reelays...');
    const routeGet = `${REELAY_API_BASE_URL}/reelays?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedStacks = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS, 
    });
    if (!fetchedStacks) {
        console.log('Found no reelays in feed');
        return null;
    }

    // call prepareReelay on every reelay in every stack
    const preparedStacks = await Promise.all(fetchedStacks.map(async fetchedReelaysForStack => {
        const preparedStack = await Promise.all(fetchedReelaysForStack.map(prepareReelay));
        return preparedStack;
    }));
    return preparedStacks;
}

export const getMostRecentReelaysByTitle = async (tmdbTitleID, page = 0) => {
    const routeGet = `${REELAY_API_BASE_URL}/reelays/${tmdbTitleID}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedReelays = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    if (!fetchedReelays) {
        console.log('Found no reelays in feed');
        return null;
    }
    const preparedReelays = await Promise.all(fetchedReelays.map(prepareReelay));
    return preparedReelays;

}

export const getRegisteredUser = async (userSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/sub/${userSub}`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    if (!resultGet || resultGet.error) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const getUserByEmail = async (address) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/byemail/${address}`;
    const userResult = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    console.log('Get user by email result: ', userResult);
    return userResult;
}

export const getUserByUsername = async (username) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/byusername/${username}`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS, 
    });

    if (!resultGet || resultGet.error) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const getVideoURIObject = async (fetchedReelay) => {    
    const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${fetchedReelay.videoS3Key}`;
    return { 
        id: fetchedReelay.id, 
        videoURI: cloudfrontVideoURI,
    };
}

export const postReelayToDB = async (reelayBody) => {
    const routePost = `${REELAY_API_BASE_URL}/reelays/sub`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(reelayBody),
        headers: REELAY_API_HEADERS,
    });
    return resultPost;
}

export const postCommentToDB = async (commentBody, reelaySub) => {
    const routePost = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}/comments`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(commentBody),
        headers: REELAY_API_HEADERS,
    });
    return resultPost;
}

export const postLikeToDB = async (likeBody, reelaySub) => {
    
    const routePost = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}/likes`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(likeBody),
        headers: REELAY_API_HEADERS,
    });
    return resultPost;
}

export const prepareReelay = async (fetchedReelay) => {
    const titleObj = await fetchAnnotatedTitle(
        fetchedReelay.tmdbTitleID, 
        fetchedReelay.isSeries
    );
    const videoURIObject = await getVideoURIObject(fetchedReelay);
    const sortCommentsByPostedDate = (comment1, comment2) => {
        try {
            const diff = Date.parse(comment1.postedAt) - Date.parse(comment2.postedAt);
            return diff;
        } catch (error) {
            console.log(error);
        }
    }
    const sortedComments = fetchedReelay.comments.sort(sortCommentsByPostedDate);

    return {
        id: fetchedReelay.id,
        creator: {
            avatar: '../../assets/images/icon.png',
            sub: fetchedReelay.creatorSub,
            username: fetchedReelay.creatorName,
        },
        content: {
            venue: fetchedReelay.venue ? fetchedReelay.venue : null,
            videoURI: videoURIObject.videoURI,    
        },
        comments: sortedComments,
        likes: fetchedReelay.likes,
        sub: fetchedReelay.datastoreSub,
        title: titleObj,
        postedDateTime: fetchedReelay.postedAt ?? fetchedReelay.maxPostedAt,
    };
}

export const registerUser = async (user) => {
    const { attributes, username } = user;
    const { email, sub } = attributes;
    const routeGet = REELAY_API_BASE_URL + '/users/sub/' + sub;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    const encEmail = encodeURIComponent(email);
    const encUsername = encodeURI(username);

    if (resultGet.error) {
        // user is not registered
        console.log('Registering user...');
        // todo: sanity check emails and usernames
        const routePost = `${REELAY_API_BASE_URL}/users/sub?email=${encEmail}&username=${encUsername}&sub=${sub}`;
        const resultPost = await fetchResults(routePost, { 
            method: 'POST',
            headers: REELAY_API_HEADERS,
        });
        console.log('User registry entry created: ', resultPost);
        return resultPost;
    } else {
        return resultGet;
    }
}

export const registerPushTokenForUser = async (user, pushToken) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${user.sub}?pushToken=${pushToken}`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    console.log('Patched user registry entry: ', resultPatch);
    return resultPatch;
}

// note that we do not yet have a remove comment function

export const removeLike = async (like) => {

    const removeBody = {
        username: like.username,
        reelaySub: like.reelaySub,
    }

    const routeRemove = `${REELAY_API_BASE_URL}/likes`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const removeReelay = async (reelay) => {
    const routeRemove = `${REELAY_API_BASE_URL}/reelays/sub/${reelay.sub}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
    });
    return resultRemove;
}

export const searchTitles = async (searchText, isSeries) => {
    const routeGet = `${REELAY_API_BASE_URL}/search/titles?searchText=${searchText}&isSeries=${isSeries}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    const annotatedResults = await Promise.all(
        resultGet.map(async (tmdbTitleObject) => {
            return await fetchAnnotatedTitle(tmdbTitleObject.id, isSeries);
        })
    );
    return annotatedResults;
}

export const searchUsers = async (searchText) => {
    const routeGet = `${REELAY_API_BASE_URL}/search/users?searchText=${searchText}`;
    const resultGet = await fetchResults(routeGet, {
        method: "GET",
        headers: REELAY_API_HEADERS,
    });

    if (!resultGet) {
        console.log("User not registered");
        return null;
    }
    return resultGet;
};
