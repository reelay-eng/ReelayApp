import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

export const createTopic = async ({ 
    clubID = null,
    creatorName, 
    creatorSub, 
    description, 
    title, 
}) => {
    const routePost = `${REELAY_API_BASE_URL}/topics`;
    const postBody = {
        clubID,
        creatorName,
        creatorSub,
        description,
        title,
        visibility: FEED_VISIBILITY,
    };
    const createTopicResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return createTopicResult;
}

export const editTopic = async ({
    description, 
    reqUserSub, 
    title, 
    topicID,
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/topics`;
    const patchBody = { topicID };

    if (description) patchBody.description = description;
    if (title) patchBody.prompt = title;

    const resultPatch = await fetchResults(routePatch, {
        method: 'PATCH',
        headers: {
            ...REELAY_API_HEADERS,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return resultPatch;
}

export const getGlobalTopics = async ({ page = 0 }) => {
    console.log('Getting global topics...');
    const routeGet = `${REELAY_API_BASE_URL}/topics?page=${page}&visibility=${FEED_VISIBILITY}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
}

export const removeTopic = async ({ reqUserSub, topicID }) => {
    const routeDelete =  `${REELAY_API_BASE_URL}/topics`;
    const deleteBody = { topicID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...REELAY_API_HEADERS,
            reqUserSub,
        },
        body: JSON.stringify(deleteBody),
    });
    return resultDelete;
}

export const reportTopic = async ({ reqUserSub, topicID }) => {
    const routePost =  `${REELAY_API_BASE_URL}/topics/report`;
    const postBody = { topicID };
    const resultPost = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...REELAY_API_HEADERS,
            reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return resultPost;
}

export const searchTopics = async ({ searchText, page = 0 }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/search?searchText=${searchText}&page=${page}&visibility=${FEED_VISIBILITY}`;
    const resultGet = await fetchResults(routeGet, {
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
}
