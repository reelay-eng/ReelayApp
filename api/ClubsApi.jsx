import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';

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
    clubID,
    userSub,
    username,
    tmdbTitleID,
    titleType
}) => {
    const routePost = `${REELAY_API_BASE_URL}/clubs/title/${clubID}`;
    const postBody = {
        userSub,
        username,
        tmdbTitleID,
        titleType
    }
    const addTitleResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: userSub
        },
        body: JSON.stringify(postBody),
    });
    return addTitleResult;
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
        pictureURI,
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
}) => {
    // todo
}

export const getClubMembers = async (clubID, reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/members/${clubID}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    })
    return resultGet;
}

export const getClubsForUser = async (userSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/memberOf/${userSub}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: userSub,
        },
    })
    return resultGet;
}

export const getClubTitles = async (clubID, reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/clubs/titles/${clubID}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    })
    return resultGet;
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
