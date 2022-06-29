import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';
import * as Linking from 'expo-linking';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';

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

export const deleteAccount = async (userSub, authSession) => {
    const routeDelete = `${REELAY_API_BASE_URL}/users/sub/${userSub}`;
    console.log(routeDelete);
    const deleteAccountResult = await fetchResults(routeDelete, {
        method: "DELETE",
        headers: {
            requsersub: userSub,
            ...getReelayAuthHeaders(authSession),
        }
    });
    return deleteAccountResult;
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

export const reportIssue = async ({ 
        authSession, 
        email, 
        issueText, 
        reqUserSub, 
        reqUsername,
        viewedContent = {}, 
        viewedContentType = 'profileSettings'
}) => {
    const routePost = `${REELAY_API_BASE_URL}/reported-content/issue`;
    const body = {
        email,
        issueText, 
        username: reqUsername,
        viewedContentJSON: JSON.stringify(viewedContent), 
        viewedContentType
    }

    const reportIssueResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            reqUserSub,
        },
        body: JSON.stringify(body),
    });
    return reportIssueResult;
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

export const getLatestAnnouncement = async ({ authSession, reqUserSub, page }) => {
    try {
        const routeGet = `${REELAY_API_BASE_URL}/announcements?page=${page ?? 0}&visibility=${FEED_VISIBILITY}`;
        const latestAnnouncement = await fetchResults(routeGet, {
            method: 'GET',
            headers: {
                ...getReelayAuthHeaders(authSession),
                reqUserSub,
            },
        });

        if (!latestAnnouncement || latestAnnouncement?.error) {
            console.log('No latest announcement');
            return null;
        }

        const fetchedReelay = await getReelay(latestAnnouncement?.reelaySub);
        if (fetchedReelay) {
            const preparedReelay = await prepareReelay(fetchedReelay);
            latestAnnouncement.pinnedReelay = preparedReelay;
        }
        return latestAnnouncement;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getReportedIssues = async ({ authSession, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/issues`;
    const reportedIssues = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            reqUserSub,
        },
    })
    return reportedIssues;
}

export const getReportedReelayStacks = async () => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/feed?visibility=${FEED_VISIBILITY}`;
    const fetchedReportedStacks = await fetchResults(routeGet, {
        method: 'GET',
        headers: ReelayAPIHeaders,
    });

    const preparedReportedStacks = await prepareFeed(fetchedReportedStacks);
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
const prepareFeed = async (fetchedStacks) => {
    const preparedStacks = [];
    for (const fetchedStack of fetchedStacks) {
        const preparedStack = await Promise.all(fetchedStack.map(prepareReelay));
        preparedStacks.push(preparedStack);
    }
    return preparedStacks;
}

const prepareTitlesAndTopics = async (titlesAndTopics) => {
    for (const titleOrTopic of titlesAndTopics) {
        titleOrTopic.reelays = await Promise.all(titleOrTopic.reelays.map(prepareReelay));
    }
    return titlesAndTopics;
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

export const getHomeContent = async ({ authSession, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/home?visibility=${FEED_VISIBILITY}`;
    const homeContent = await fetchResults(routeGet, {
        method: 'GET',
        headers: { 
            ...getReelayAuthHeaders(authSession), 
            requsersub: reqUserSub
        },
    });

    const reelayContentTypes = [
        'clubTitles',
        'clubTopics',
        'festivals',
        'theaters',
        'streaming',
        'mostRecent', 
        'newTopics', 
        'popularTitles',
        'popularTopics',
        'topOfTheWeek',
    ];

    const titleAndTopicContentTypes = [
        'newTopics', 
        'popularTopics',
    ]

    if (!homeContent) {
        console.log('Error: no home content');
        return null;
    }

    const { discover, following, clubs, global, profile } = homeContent;
    if (!discover || !following || !clubs || !global || !profile) {
        console.log('Error: home content missing');
        return null;
    }

    const prepareAllClubs = async () => {
        const preparedClubs = [];
        for (const club of clubs) {
            await prepareClubReelays(club);
            await prepareClubActivities(club);
            preparedClubs.push(club);
        }
        return preparedClubs;
    }

    const prepareClubActivities = async (club) => {
        for (const member of club.members) {
            member.activityType = 'member';
        }
        for (const title of club.titles) {
            const { tmdbTitleID, titleType } = title;
            const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType === 'tv');
            title.activityType = 'title';
            title.title = annotatedTitle;
        }
        for (const topic of club.topics) {
            topic.activityType = 'topic';
        }
    }

    const prepareClubReelays = async (club) => {
        const { titles, topics } = club;
        const [preparedTitles, preparedTopics] = await Promise.all([
            prepareTitlesAndTopics(titles),
            prepareTitlesAndTopics(topics),
        ]);
        club.titles = preparedTitles;
        club.topics = preparedTopics;
    };

    const prepareHomeTabReelays = async (homeTab) => {
        const contentKeys = Object.keys(homeTab);
        const prepareHomeContentForKey = async (contentKey) => {
            const isTitlesOrTopics = titleAndTopicContentTypes.includes(contentKey);
            const mustPrepareReelays = reelayContentTypes.includes(contentKey);
    
            if (isTitlesOrTopics) {
                homeTab[contentKey] = await prepareTitlesAndTopics(homeTab[contentKey]);
            } else if (mustPrepareReelays) {
                homeTab[contentKey] = await prepareFeed(homeTab[contentKey]);
            } else {
                // change nothing
            }
        }

        await Promise.all(contentKeys.map(prepareHomeContentForKey));
        return homeTab;
    }

    const [
        discoverPrepared,
        followingPrepared,
        globalPrepared,
        clubsPrepared,
    ] = await Promise.all([
        prepareHomeTabReelays(discover),
        prepareHomeTabReelays(following),
        prepareFeed(global),
        prepareAllClubs(),
    ]);

    // console.log('prepared home screen: ');
    // console.log('discover popular: ', discoverPrepared?.popularTitles);
    // console.log('following popular: ', followingPrepared?.popularTitles);
    // console.log('following most recent: ', followingPrepared?.mostRecent);
    // console.log('global: ', globalPrepared);
    // console.log('clubs: ', clubsPrepared);
    // console.log('profile: ', profile);
    
    return {
        discover: discoverPrepared,
        following: followingPrepared,
        global: globalPrepared,
        clubs: clubsPrepared,
        profile,
    };
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
    console.log('fetched stacks length: ', feedSource, fetchedStacks.length);
    if (!fetchedStacks) {
        console.log('Found no reelays in feed');
        return null;
    }
    return await prepareFeed(fetchedStacks);
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

export const getVenuesWhereSeen = async (titleType, tmdbTitleID, visibility=FEED_VISIBILITY) => {
    const routeGet = `${REELAY_API_BASE_URL}/venues/seenOn?titleType=${titleType}&tmdbTitleID=${tmdbTitleID}&visibility=${visibility}`;
    const resultGet = await fetchResults(routeGet, {
        method: "GET",
        headers: ReelayAPIHeaders,
    });
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

export const postAnnouncement = async ({ authSession, reqUserSub, postBody }) => {
    const routePost = `${REELAY_API_BASE_URL}/announcements`;
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            reqUserSub,
        },
        body: JSON.stringify(postBody)
    });
    return resultPost;
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
        clubID: fetchedReelay.clubID,
        topicID: fetchedReelay.topicID,
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
    return resultPatch;
}

export const removeAnnouncement = async ({ announcementID, authSession, reqUserSub }) => {
    const routeDelete = `${REELAY_API_BASE_URL}/announcements`;
    const deleteBody = { announcementID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: { 
            ...getReelayAuthHeaders(authSession), 
            requsersub: reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return resultDelete;
}

export const removeComment = async (commentID) => {
    const routeDelete = `${REELAY_API_BASE_URL}/comments`;
    const deleteBody = { commentID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(deleteBody),
    });
    return resultDelete;
}

export const removeCommentLike = async (commentUUID, userSub) => {
    // todo
    const routeDelete = `${REELAY_API_BASE_URL}/comments/like?commentUUID=${commentUUID}&userSub=${userSub}`;
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: ReelayAPIHeaders,
    });
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

export const searchTitles = async (searchText, isSeries, page = 0) => {
    const cleanSearchText = searchText.toLowerCase().replace(/[\u2018\u2019\u201c\u201d/'/"]/g, "");
    const routeGet = `${REELAY_API_BASE_URL}/search/titles?searchText=${cleanSearchText}&isSeries=${isSeries}&page=${page}`;
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

export const searchUsers = async (searchText, page = 0) => {
    const routeGet = `${REELAY_API_BASE_URL}/search/users?searchText=${searchText}&page=${page}`;
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

export const updateUsername = async (userSub, newUsername) => {
    const routePatch = `${REELAY_API_BASE_URL}/users/sub/${userSub}`;
    const updateBody = {
        username: newUsername
    };
    const resultPatch = await fetchResults(routePatch, {
        method: "PATCH",
        headers: {
            ...ReelayAPIHeaders,
            requsersub: userSub,
        },
        body: JSON.stringify(updateBody),
    });
    console.log("Patched user bio to: ", newUsername);
    return resultPatch;
};

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
    return resultPatch;
};
