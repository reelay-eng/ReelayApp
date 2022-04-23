import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';
import * as Linking from 'expo-linking';
import ReelayAPIHeaders from './ReelayAPIHeaders';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const WELCOME_REELAY_SUB = Constants.manifest.extra.welcomeReelaySub;

export const followCreator = async (creatorSub, followerSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeGet);
    const followResult = await fetchResults(routeGet, {
        method: "POST",
        headers: ReelayAPIHeaders,
    });
    return followResult;
}

export const acceptFollowRequest = async (creatorSub, followerSub) => {
    const routePost = `${REELAY_API_BASE_URL}/follows/accept?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routePost);
    const acceptRequestResult = await fetchResults(routePost, {
      method: "POST",
      headers: ReelayAPIHeaders,
    });
    return acceptRequestResult;
}

export const rejectFollowRequest = async (creatorSub, followerSub) => {
    const routeDelete = `${REELAY_API_BASE_URL}/follows/reject?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeDelete);
    const rejectRequestResult = await fetchResults(routeDelete, {
        method: "DELETE",
        headers: ReelayAPIHeaders,
    });
    return rejectRequestResult;
};

export const unfollowCreator = async (creatorSub, followerSub) => {
    const routeRemove = `${REELAY_API_BASE_URL}/follows?creatorSub=${creatorSub}&followerSub=${followerSub}`;
    console.log(routeRemove);
    const unfollowResult = await fetchResults(routeRemove, {
        method: "DELETE",
        headers: ReelayAPIHeaders,
    });
    return unfollowResult;
}

export const unblockCreator = async (creatorSub, blockingUserSub) => {
    const routePatch = `${REELAY_API_BASE_URL}/blockUsers/unblockUser?blockedUserSub=${creatorSub}&blockingUserSub=${blockingUserSub}`;
    console.log(routePost);
    const unblockCreatorResult = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: ReelayAPIHeaders,
    });

    return unblockCreatorResult;
}

export const blockCreator = async (creatorSub, blockingUserSub) => {
    const routePost = `${REELAY_API_BASE_URL}/blockUsers/blockUser?blockedUserSub=${creatorSub}&blockingUserSub=${blockingUserSub}`;
    console.log(routePost);
    const blockCreatorResult = await fetchResults(routePost, {
        method: 'POST',
        headers: ReelayAPIHeaders,
    });

    return blockCreatorResult;
}

export const reportReelay = async (reportingUserSub, reportReq) => {
    const routePost = `${REELAY_API_BASE_URL}/reported-content/reelay`;
    const reportReelayResult = await fetchResults(routePost, {
        body: JSON.stringify(reportReq),
        method: 'POST',
        headers: { ...ReelayAPIHeaders, requsersub: reportingUserSub },
    });

    console.log(reportReelayResult);
    return reportReelayResult;
}

export const createDeeplinkPathToReelay = async (linkingUserSub, linkingUsername, reelaySub) => {
    // using the scheme reelayapp://, the statement below creates an unusable triple slash
    // ...doesn't happen on expo
    let deeplinkPath = Linking.createURL(`/reelay/${reelaySub}`);
    deeplinkPath = deeplinkPath.replace('///', '//'); 

    const routePost = `${REELAY_API_BASE_URL}/deeplink/`;
    const postBody = {
        linkingUserSub, 
        linkingUsername,
        deeplinkPath,
        propsJSON: null,
    };

    const dbResult = await fetchResults(routePost, {
        method: 'POST',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(postBody),
    });
    return dbResult;
}

export const getReportedReelayStacks = async () => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/feed?visibility=${FEED_VISIBILITY}`;
    const fetchedReportedStacks = await fetchResults(routeGet, {
        method: 'GET',
        headers: ReelayAPIHeaders,
    });

    const preparedReportedStacks = await prepareStacks(fetchedReportedStacks);
    console.log('REPORTED REELAYS: ', preparedReportedStacks);
    return preparedReportedStacks;
}

export const getAllDonateLinks = async () => {
    const routeGet = `${REELAY_API_BASE_URL}/donateLinks/all`;
    const resultGet = await fetchResults(routeGet, {
        method: "GET",
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const getFollowing = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/follows/follower/sub/${creatorSub}`;
    console.log(routeGet);
    const following = await fetchResults(routeGet, {
        method: "GET",
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
    });

    if (!fetchedReelay) {
        console.log('Could not get reelays for this creator');
        return null;
    }
    return fetchedReelay;
}

export const getReelaysByCreator = async (creatorSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/sub/${creatorSub}/reelays?visibility=${FEED_VISIBILITY}`;
    console.log('GET REELAYS BY CREATOR: ', routeGet);
    const fetchedReelays = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
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
        headers: { ...ReelayAPIHeaders, 'venue': JSON.stringify(venues) },
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
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const getFeed = async ({ reqUserSub, feedSource, page = 0 }) => {
    console.log(`Getting most recent ${feedSource} reelays...`);
    const routeGet = `${REELAY_API_BASE_URL}/feed/${feedSource}?page=${page}&visibility=${FEED_VISIBILITY}`;
    let fetchedStacks = await fetchResults(routeGet, { 
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        }, 
    });
    if (!fetchedStacks) {
        console.log('Found no reelays in feed');
        return null;
    }
    if (feedSource === 'trending') fetchedStacks = fetchedStacks.map(reelay => [reelay]);
    return await prepareStacks(fetchedStacks);
}

export const getMostRecentReelaysByTitle = async (tmdbTitleID, page = 0) => {
    const routeGet = `${REELAY_API_BASE_URL}/reelays/${tmdbTitleID}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const fetchedReelays = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
    });

    console.log('Get user by email result: ', userResult);
    return userResult;
}

export const getUserByUsername = async (username) => {
    const routeGet = `${REELAY_API_BASE_URL}/users/byusername/${username}`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders, 
    });

    if (!resultGet || resultGet.error) {
        console.log('User not registered');
        return null;
    }
    return resultGet;
}

export const getVideoURIObject = (fetchedReelay) => {    
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
        headers: ReelayAPIHeaders,
    });
    return resultPost;
}

export const postCommentToDB = async (commentBody, reelaySub) => {
    const routePost = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}/comments`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(commentBody),
        headers: ReelayAPIHeaders,
    });
    return resultPost;
}

export const postCommentLikeToDB = async (commentUUID, commentAuthorSub, commentLikerSub) => {
    const reqBody = { commentUUID, commentAuthorSub, commentLikerSub };
    const routePost = `${REELAY_API_BASE_URL}/comments/like`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: ReelayAPIHeaders,
    });
    console.log('Posted comment like: ', resultPost);
    return resultPost;
}

export const postLikeToDB = async (likeBody, reelaySub) => {
    const routePost = `${REELAY_API_BASE_URL}/reelays/sub/${reelaySub}/likes`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(likeBody),
        headers: ReelayAPIHeaders,
    });
    return resultPost;
}

export const postStreamingSubscriptionToDB = async (userSub, streamingSubscriptionBody) => {
    const routePost = `${REELAY_API_BASE_URL}/streamingSubscriptions/${userSub}`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        body: JSON.stringify(streamingSubscriptionBody),
        headers: ReelayAPIHeaders,
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
    const videoURIObject = getVideoURIObject(fetchedReelay);
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
            headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
    });
    console.log('Patched user registry entry: ', resultPatch);
    return resultPatch;
}

export const removeComment = async (commentID) => {
    const routeDelete = `${REELAY_API_BASE_URL}/comments`;
    const deleteBody = { commentID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(deleteBody),
    });
    console.log('Deleted comment: ', resultDelete);
    return resultDelete;
}

export const removeCommentLike = async (commentUUID, userSub) => {
    // todo
    const routeDelete = `${REELAY_API_BASE_URL}/comments/like?commentUUID=${commentUUID}&userSub=${userSub}`;
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const removeReelay = async (reelay) => {
    const routeRemove = `${REELAY_API_BASE_URL}/reelays/sub/${reelay.sub}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
    });
    return resultRemove;
}

export const removeStreamingSubscription = async (userSub, removeSubscriptionBody) => {
    const routeRemove = `${REELAY_API_BASE_URL}/streamingSubscriptions/${userSub}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(removeSubscriptionBody),
    });
    return resultRemove;
}

export const searchTitles = async (searchText, isSeries) => {
    const cleanSearchText = searchText.toLowerCase().replace(/[\u2018\u2019\u201c\u201d/'/"]/g, "");
    const routeGet = `${REELAY_API_BASE_URL}/search/titles?searchText=${cleanSearchText}&isSeries=${isSeries}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
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
        headers: { ...ReelayAPIHeaders, requsersub: adminUserSub },
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
        headers: { ...ReelayAPIHeaders, requsersub: adminUserSub },
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
            ...ReelayAPIHeaders,
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
            ...ReelayAPIHeaders,
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
        headers: ReelayAPIHeaders,
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
        ...ReelayAPIHeaders,
        requsersub: userSub,
        },
        body: JSON.stringify(updateBody),
    });
    console.log("Patched user website to: ", website);
    return resultPatch;
};
