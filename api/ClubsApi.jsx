import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { fetchResults } from './fetchResults';
import { getReelayAuthHeaders } from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';
import { fetchAnnotatedTitle } from './TMDbApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const addMemberToClub = async ({
    authSession,
    clubID,
    userSub,
    username,
    role,
    invitedBySub, 
    invitedByUsername, 
    clubLinkID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/clubs/member/${clubID}`;
    const postBody = {
        userSub, 
        username, 
        role, 
        invitedBySub, 
        invitedByUsername,
        clubLinkID
    };
    const addMemberResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: invitedBySub
        },
        body: JSON.stringify(postBody),
    });
    return addMemberResult;
}

export const addTitleToClub = async ({
    authSession,
    addedByUsername,
    addedByUserSub,
    clubID,
    titleType,
    tmdbTitleID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/clubs/title/${clubID}`;
    const postBody = {
        addedByUsername,
        addedByUserSub,
        titleType,
        tmdbTitleID,
    }
    const addClubTitleResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: addedByUserSub
        },
        body: JSON.stringify(postBody),
    });
    const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType === 'tv');
    return { ...addClubTitleResult, title: annotatedTitle, reelays: [] };
}

export const createClub = async ({ 
    authSession,
    creatorName, 
    creatorSub, 
    description, 
    name, 
    visibility,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/clubs/club`;
    const postBody = {
        creatorName,
        creatorSub,
        description,
        name,
        visibility,
    };
    const createClubResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return createClubResult;
}

export const createDeeplinkPathToClub = async ({ authSession, clubID, invitedByUserSub, invitedByUsername }) => {
    // using the scheme reelayapp://, the statement below creates an unusable triple slash
    // ...doesn't happen on expo
    let deeplinkURI = Linking.createURL(`/clubInvite`);
    deeplinkURI = deeplinkURI.replace('///', '//'); 

    const routePost = `${REELAY_API_BASE_URL}/clubs/invite/${clubID}`;
    const postBody = {
        invitedByUserSub, 
        invitedByUsername,
        deeplinkURI,
    };

    const dbResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: invitedByUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return dbResult;
}

export const editClub = async ({
    authSession,
    clubID,
    name,
    description,
    membersCanInvite,
    reqUserSub,
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/clubs/${clubID}`;
    const patchBody = {};
    if (name) patchBody.name = name;
    if (description) patchBody.description = description;
    if (membersCanInvite !== undefined) patchBody.membersCanInvite = membersCanInvite;

    const resultPatch = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return resultPatch;
}

export const getClubInviteFromCode = async ({ authSession, inviteCode, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/invite/${inviteCode}`;
    const clubInviteResult = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });
    return clubInviteResult;
}

export const getClubMembers = async ({ authSession, clubID, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/members/${clubID}`;
    const fetchedMembers = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });
    fetchedMembers.forEach(member => {
        member.activityType = 'member';
        member.lastUpdatedAt = member.createdAt;
    });
    return fetchedMembers;
}

export const getClubsMemberOf = async ({ authSession, userSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/memberOf/${userSub}`;
    const fetchedClubs = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: userSub,
        },
    });

    fetchedClubs.forEach((club) => {
        if (!club?.members) club.members = [];
        if (!club?.titles) club.titles = [];
        if (!club?.topics) club.topics = [];
    })
    return fetchedClubs;
}

export const getClubTitles = async ({ authSession, clubID, page = 0, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/titles/${clubID}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const clubTitles = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const annotatedClubTitles = await Promise.all(clubTitles.map(async (clubTitle) => {
        const { tmdbTitleID, titleType } = clubTitle;
        const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType === 'tv');
        const preparedReelays = await Promise.all(clubTitle.reelays.map(prepareReelay));
        return { ...clubTitle, activityType: 'title', title: annotatedTitle, reelays: preparedReelays };
    }));
    return annotatedClubTitles;
}

export const getClubTopics = async ({ authSession, clubID, page = 0, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/topics/${clubID}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const topicsWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        topic.activityType = 'topic';
        return topic;
    }
    return await Promise.all(topicsWithReelays.map(prepareTopicReelays));
}

export const removeMemberFromClub = async ({ authSession, clubID, userSub, reqUserSub }) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/member/${clubID}`;
    const removeBody = { userSub };
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const banMemberFromClub = async ({ authSession, clubID, userSub, reqUserSub }) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/member/${clubID}/ban`;
    const removeBody = { userSub };
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const removeTitleFromClub = async ({
    authSession, 
    clubID,
    tmdbTitleID,
    titleType,
    reqUserSub,
}) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/title/${clubID}`;
    const removeBody = {
        tmdbTitleID,
        titleType,
    };
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const deleteClub = async ({ authSession, clubID, reqUserSub }) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/club/${clubID}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });
    return resultRemove;

}