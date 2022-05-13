import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';
import { fetchAnnotatedTitle } from './TMDbApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const addMemberToClub = async ({
    clubID,
    userSub,
    username,
    role,
    invitedBySub, 
    invitedByUsername, 
    inviteLinkID,
}) => {
    const routePost = `${REELAY_API_BASE_URL}/clubs/member/${clubID}`;
    const postBody = {
        userSub, 
        username, 
        role, 
        invitedBySub, 
        invitedByUsername, 
        inviteLinkID
    };
    const addMemberResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: invitedBySub
        },
        body: JSON.stringify(postBody),
    });
    return addMemberResult;
}

export const addTitleToClub = async ({
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
            ...ReelayAPIHeaders,
            requsersub: addedByUserSub
        },
        body: JSON.stringify(postBody),
    });
    const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType === 'tv');
    return { ...addClubTitleResult, title: annotatedTitle, reelays: [] };
}

export const createClub = async ({ 
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
            ...ReelayAPIHeaders,
            requsersub: creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return createClubResult;
}

export const editClub = async ({
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
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return resultPatch;
}

export const getClubMembers = async (clubID, reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/members/${clubID}`;
    const fetchedClubs = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });
    fetchedClubs.forEach((club) => {
        if (!club?.members) club.members = [];
        if (!club?.titles) club.titles = [];
    });
    return fetchedClubs;
}

export const getClubsMemberOf = async (userSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/memberOf/${userSub}`;
    const fetchedClubs = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: userSub,
        },
    });
    fetchedClubs.forEach((club) => {
        if (!club?.members) club.members = [];
        if (!club?.titles) club.titles = [];
    })
    return fetchedClubs;
}

export const getClubTitles = async (clubID, reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/titles/${clubID}`;
    const clubTitles = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });

    const annotatedClubTitles = await Promise.all(clubTitles.map(async (clubTitle) => {
        const { tmdbTitleID, titleType } = clubTitle;
        const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType === 'tv');
        const preparedReelays = await Promise.all(clubTitle.reelays.map(prepareReelay));
        return { ...clubTitle, title: annotatedTitle, reelays: preparedReelays };
    }));
    return annotatedClubTitles;
}

export const getClubTopics = async (clubID, reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/topics/${clubID}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    })
    return resultGet;
}

export const removeMemberFromClub = async ({
    clubID,
    userSub,
    reqUserSub,
}) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/member/${clubID}`;
    const removeBody = { userSub };
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const banMemberFromClub = async ({
    clubID,
    userSub,
    reqUserSub,
}) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/member/${clubID}/ban`;
    const removeBody = { userSub };
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const removeTitleFromClub = async ({
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
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(removeBody),
    });
    return resultRemove;
}

export const deleteClub = async ({
    clubID,
    reqUserSub,
}) => {
    const routeRemove = `${REELAY_API_BASE_URL}/clubs/club/${clubID}`;
    const resultRemove = await fetchResults(routeRemove, {
        method: 'DELETE',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });
    return resultRemove;

}
