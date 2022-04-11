import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;
const WELCOME_REELAY_SUB = Constants.manifest.extra.welcomeReelaySub;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

export const followCreator = async (creatorSub, followerSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeGet);
    const followResult = await fetchResults(routeGet, {
        method: "POST",
        headers: REELAY_API_HEADERS,
    });
    return followResult;
}

export const acceptFollowRequest = async (creatorSub, followerSub) => {
    const routePost = `${REELAY_API_BASE_URL}/follows/accept?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routePost);
    const acceptRequestResult = await fetchResults(routePost, {
      method: "POST",
      headers: REELAY_API_HEADERS,
    });
    return acceptRequestResult;
}

export const rejectFollowRequest = async (creatorSub, followerSub) => {
    const routeDelete = `${REELAY_API_BASE_URL}/follows/reject?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeDelete);
    const rejectRequestResult = await fetchResults(routeDelete, {
        method: "DELETE",
        headers: REELAY_API_HEADERS,
    });
    return rejectRequestResult;
};

export const unfollowCreator = async (creatorSub, followerSub) => {
    const routeRemove = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeRemove);
    const unfollowResult = await fetchResults(routeRemove, {
        method: "DELETE",
        headers: REELAY_API_HEADERS,
    });
    return unfollowResult;
}

export const unblockCreator = async (creatorSub, blockingUserSub) => {
    const routePatch = `${REELAY_API_BASE_URL}/blockUsers/unblockUser?blockedUserSub=${creatorSub}&blockingUserSub=${blockingUserSub}`;
    console.log(routePost);
    const unblockCreatorResult = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });

    return unblockCreatorResult;
}

export const blockCreator = async (creatorSub, blockingUserSub) => {
    const routePost = `${REELAY_API_BASE_URL}/blockUsers/blockUser?blockedUserSub=${creatorSub}&blockingUserSub=${blockingUserSub}`;
    console.log(routePost);
    const blockCreatorResult = await fetchResults(routePost, {
        method: 'POST',
        headers: REELAY_API_HEADERS,
    });

    return blockCreatorResult;
}

export const reportReelay = async (reportingUserSub, reportReq) => {
    const routePost = `${REELAY_API_BASE_URL}/reported-content/reelay`;
    const reportReelayResult = await fetchResults(routePost, {
        body: JSON.stringify(reportReq),
        method: 'POST',
        headers: { ...REELAY_API_HEADERS, requsersub: reportingUserSub },
    });

    console.log(reportReelayResult);
    return reportReelayResult;
}

export const getReportedReelayStacks = async () => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/feed?visibility=${FEED_VISIBILITY}`;
    const fetchedReportedStacks = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    const preparedReportedStacks = await prepareStacks(fetchedReportedStacks);
    console.log('REPORTED REELAYS: ', preparedReportedStacks);
    return preparedReportedStacks;
}

export const getAllDonateLinks = async () => {
    const routeGet = `${REELAY_API_BASE_URL}/donateLinks/all`;
    const resultGet = await fetchResults(routeGet, {
        method: "GET",
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
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

export const getReelay = async (reelaySub, visibility=FEED_VISIBILITY) => {
    const routeGet = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}?visibility=${visibility}`;
    const fetchedReelay = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    if (!fetchedReelay) {
        console.log('Could not get reelays for this creator');
        return null;
    }
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

export const getReelaysByVenue = async ( venues, page = 0 ) => {
    const routeGet = `${REELAY_API_BASE_URL}/reelays?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedReelays = await fetchResults(routeGet, { 
        method: 'GET',
        headers: { ...REELAY_API_HEADERS, 'venue': JSON.stringify(venues) },
    });
    if (!fetchedReelays) {
        console.log('Found no reelays with that venue.');
        return null;
    }
    return fetchedReelays;
}

export const getStreamingSubscriptions = async (userSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/streamingSubscriptions/${userSub}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    if (!resultGet) {
        console.log('Error fetching streaming subscriptions');
        return [];
    }
    return resultGet;
}

export const getStacksByVenue = async ( venues, page = 0) => {
    const venueReelays = await getReelaysByVenue(venues, page);
    if (!venueReelays) return [];

    const preparedStacks = await prepareStacks(venueReelays);
    return preparedStacks;
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

// call prepareReelay on every reelay in every stack
const prepareStacks = async (fetchedStacks) => {
    const prepareReelaysForStack = async (fetchedReelaysForStack) => {
        return await Promise.all(fetchedReelaysForStack.map(prepareReelay));
    }
    return await Promise.all(fetchedStacks.map(prepareReelaysForStack));
}

export const getCommentLikesForReelay = async (reelaySub, reqUserSub) => {
    const reelaySubsJSON = JSON.stringify([reelaySub]);
    const routeGet = `${REELAY_API_BASE_URL}/comments/likes/all?reelaySubs=${reelaySubsJSON}&userSub=${reqUserSub}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    console.log('Getting comment likes: ', resultGet);
    return resultGet;
}

export const getFeed = async ({ reqUserSub, feedSource, page = 0 }) => {
    console.log(`Getting most recent ${feedSource} reelays...`);
    const routeGet = `${REELAY_API_BASE_URL}/feed/${feedSource}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedStacks = await fetchResults(routeGet, { 
        method: 'GET',
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: reqUserSub,
        }, 
    });
    const routeGetNextPage = `${REELAY_API_BASE_URL}/feed/${feedSource}?page=${page+1}&visibility=${FEED_VISIBILITY}`;
    const fetchedStacksNextPage = await fetchResults(routeGetNextPage, { 
        method: 'GET',
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: reqUserSub,
        }, 
    });
    if (!fetchedStacks && !fetchedStacksNextPage) {
        console.log('Found no reelays in feed');
        return null;
    }
    return await prepareStacks(fetchedStacks.concat(fetchedStacksNextPage));
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

export const postCommentLikeToDB = async (commentUUID, commentAuthorSub, commentLikerSub) => {
    const reqBody = { commentUUID, commentAuthorSub, commentLikerSub };
    const routePost = `${REELAY_API_BASE_URL}/comments/like`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: REELAY_API_HEADERS,
    });
    console.log('Posted comment like: ', resultPost);
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

export const postStreamingSubscriptionToDB = async (userSub, streamingSubscriptionBody) => {
    const routePost = `${REELAY_API_BASE_URL}/streamingSubscriptions/${userSub}`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(streamingSubscriptionBody),
        headers: REELAY_API_HEADERS,
    });
    return resultPost;
}

export const prepareReelay = async (fetchedReelay) => {

    const isWelcomeReelay = (fetchedReelay.datastoreSub === WELCOME_REELAY_SUB);
    const titleObj = await fetchAnnotatedTitle(
        fetchedReelay.tmdbTitleID, 
        fetchedReelay.isSeries,
        isWelcomeReelay
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
    if (!fetchedReelay.comments) fetchedReelay.comments = [];
    const sortedComments = fetchedReelay.comments.sort(sortCommentsByPostedDate);

    const reportedContent = (fetchedReelay.reviewStatus) ? {
        firstReportedAt: fetchedReelay.firstReportedAt,
        lastReportedAt: fetchedReelay.lastReportedAt,
        reportCount: fetchedReelay.reportCount,
        reviewStatus: fetchedReelay.reviewStatus,
        reviewerSub: fetchedReelay.reviewerSub,
        userReportsJSON: fetchedReelay.userReportsJSON,
    } : {};

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
        description: fetchedReelay.description,
        likes: fetchedReelay.likes,
        starRating: fetchedReelay.starRating,
        starRatingAddHalf: fetchedReelay.starRatingAddHalf,
        sub: fetchedReelay.datastoreSub,
        title: titleObj,
        postedDateTime: fetchedReelay.postedAt ?? fetchedReelay.maxPostedAt,
        reportedContent,
    };
}

export const registerUser = async ({ email, username, sub }) => {
    const encEmail = encodeURIComponent(email);
    const encUsername = encodeURI(username);

    try {
        console.log('Registering user...');
        // todo: sanity check emails and usernames
        const routePost = `${REELAY_API_BASE_URL}/users/sub?email=${encEmail}&username=${encUsername}&sub=${sub}`;
        const resultPost = await fetchResults(routePost, { 
            method: 'POST',
            headers: REELAY_API_HEADERS,
        });
        console.log('User registry entry created: ', resultPost);
        return resultPost;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const registerPushTokenForUser = async (userSub, pushToken) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${userSub}?pushToken=${pushToken}`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    console.log('Patched user registry entry: ', resultPatch);
    return resultPatch;
}

export const removeComment = async (commentID) => {
    // todo
    const routeDelete = `${REELAY_API_BASE_URL}/comments/${commentID}`;
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
    });
    console.log('Deleted comment like: ', resultDelete);
    return resultDelete;
}

export const removeCommentLike = async (commentUUID, userSub) => {
    // todo
    const routeDelete = `${REELAY_API_BASE_URL}/comments/like?commentUUID=${commentUUID}&userSub=${userSub}`;
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
    });
    console.log('Deleted comment like: ', resultDelete);
    return resultDelete;
}

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

export const removeStreamingSubscription = async (userSub, removeSubscriptionBody) => {
    const routeRemove = `${REELAY_API_BASE_URL}/streamingSubscriptions/${userSub}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
        body: JSON.stringify(removeSubscriptionBody),
    });
    return resultRemove;
}

export const searchTitles = async (searchText, isSeries) => {
    const cleanSearchText = searchText.toLowerCase().replace(/[\u2018\u2019\u201c\u201d/'/"]/g, "");
    const routeGet = `${REELAY_API_BASE_URL}/search/titles?searchText=${cleanSearchText}&isSeries=${isSeries}`;
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

export const suspendAccount = async (bannedUserSub, adminUserSub) => {
    const routePost = `${REELAY_API_BASE_URL}/suspendUsers/ban?bannedUserSub=${bannedUserSub}`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        headers: { ...REELAY_API_HEADERS, requsersub: adminUserSub },
    });

    if (!resultPost) {
        console.log('Could not suspend account');
        return null;
    }
    return resultPost;
}

export const unsuspendAccount = async (bannedUserSub, adminUserSub) => {
    const routePost = `${REELAY_API_BASE_URL}/suspendUsers/unban?bannedUserSub=${bannedUserSub}`;
    const resultPost = await fetchResults(routePost, {
        method: 'PATCH',
        headers: { ...REELAY_API_HEADERS, requsersub: adminUserSub },
    });

    if (!resultPost) {
        console.log('Could not unsuspend account');
        return null;
    }
    return resultPost;
}

// make it work?
export const updateUserBio = async (userSub, bio) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${userSub}`;
    const updateBody = {
        bio: bio
    };
    const resultPatch = await fetchResults(routePatch, {
        method: "PATCH",
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: userSub,
        },
        body: JSON.stringify(updateBody),
    });
    console.log("Patched user bio to: ", bio);
    return resultPatch;
};

export const updateUserFestivalPreference = async (userSub, showFestivalsRow) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${userSub}/settings?showFilmFestivals=${showFestivalsRow}`;
    const resultPatch = await fetchResults(routePatch, {
        method: "PATCH",
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: userSub,
        },
    });
    console.log("Patched user festival preference to: ", showFestivalsRow);
    return resultPatch;
};

export const updateProfilePic = async (sub, photoURI) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${sub}/profilepic`;
    const updateBody = {
        profilePictureURI: photoURI,
    }
	const resultPatch = await fetchResults(routePatch, {
		method: "PATCH",
        headers: REELAY_API_HEADERS,
        body: JSON.stringify(updateBody)
	});
    console.log("Patched user profile picture to: ", photoURI);
	return resultPatch;
};

export const updateUserWebsite = async (userSub, website) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${userSub}`;
    const updateBody = {
        website: website,
    };
    const resultPatch = await fetchResults(routePatch, {
        method: "PATCH",
        headers: {
        ...REELAY_API_HEADERS,
        requsersub: userSub,
        },
        body: JSON.stringify(updateBody),
    });
    console.log("Patched user website to: ", website);
    return resultPatch;
};
