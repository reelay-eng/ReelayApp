import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

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
            ...ReelayAPIHeaders,
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
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(patchBody),
    });
    return resultPatch;
}

export const getGlobalTopics = async ({ page = 0 }) => {
    console.log('Getting global topics...');
    const routeGet = `${REELAY_API_BASE_URL}/topics?page=${page}&visibility=${FEED_VISIBILITY}`;
    const topicsWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: ReelayAPIHeaders,
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        return topic;
    }

    const preparedTopics = await Promise.all(topicsWithReelays.map(prepareTopicReelays));
    return preparedTopics;
}

export const removeTopic = async ({ reqUserSub, topicID }) => {
    const routeDelete =  `${REELAY_API_BASE_URL}/topics`;
    const deleteBody = { topicID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: {
            ...ReelayAPIHeaders,
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
            ...ReelayAPIHeaders,
            reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    return resultPost;
}

export const searchTopics = async ({ searchText, page = 0 }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/search?searchText=${searchText}&page=${page}&visibility=${FEED_VISIBILITY}`;
    const topicsWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: ReelayAPIHeaders,
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        return topic;
    }

    const preparedTopics = await Promise.all(topicsWithReelays.map(prepareTopicReelays));
    return preparedTopics;
}
