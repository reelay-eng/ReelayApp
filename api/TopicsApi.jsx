import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';
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

export const getSingleTopic = async ({ authSession, reqUserSub, topicID }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/topic/${topicID}?visibility=${FEED_VISIBILITY}`;
    const topicWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: { 
            ...getReelayAuthHeaders(authSession), 
            requsersub: reqUserSub,
        },
    });

    console.log('fetched topic with reelays: ', topicWithReelays);

    topicWithReelays.reelays = await Promise.all(topicWithReelays.reelays.map(prepareReelay));
    return await topicWithReelays;
}

export const getTopics = async ({ authSession, page = 0, reqUserSub, source = 'discover' }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/${source}?page=${page}&visibility=${FEED_VISIBILITY}`;
    console.log('topics route get: ', routeGet);
    const fetchedTopics = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        },
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        return topic;
    }
    const preparedTopics = await Promise.all(fetchedTopics.map(prepareTopicReelays));
    return preparedTopics;
}

export const getTopicsByCreator = async ({ creatorSub, reqUserSub, page = 0 }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/byCreator/${creatorSub}?page=${page}&visibility=${FEED_VISIBILITY}`;
    const topicWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: { ...ReelayAPIHeaders, requsersub: reqUserSub },
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        return topic;
    }

    topicWithReelays.reelays = await Promise.all(topicWithReelays.map(prepareTopicReelays));
    // console.log("topicWithReelays",topicWithReelays)

    return await topicWithReelays;
}

export const editReelstoTopic = async ({
    reqUserSub, 
    reelays, 
    topicID,
}) => {
    const routePatch = `${REELAY_API_BASE_URL}/topicreelay/addreelays`;
    const patchBody = { topicId:topicID, reelays };

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

export const removeTopic = async ({ reqUserSub, topicID }) => {
    const routeDelete =  `${REELAY_API_BASE_URL}/topics/`;
    const deleteBody = { topicID };
    const resultDelete = await fetchResults(routeDelete, {
        method: 'DELETE',
        headers: { ...ReelayAPIHeaders, requsersub: reqUserSub },
        body: JSON.stringify(deleteBody),
    });
    return resultDelete;
}

export const reportTopic = async (reqUserSub, reportReq) => {
    const routePost = `${REELAY_API_BASE_URL}/reported-content/topic`;
    const reportTopicResult = await fetchResults(routePost, {
        body: JSON.stringify(reportReq),
        method: 'POST',
        headers: { ...ReelayAPIHeaders, requsersub: reqUserSub },
    });

    console.log(reportTopicResult);
    return reportTopicResult;
}

export const getReportedTopics = async ({ reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/reported-content/topicFeed?visibility=${FEED_VISIBILITY}`;
    const fetchedReportedTopics = await fetchResults(routeGet, {
        method: 'GET',
        headers: { ...ReelayAPIHeaders, requsersub: reqUserSub },
    });
    return fetchedReportedTopics;
}

export const searchTopics = async ({ searchText, page = 0, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/topics/search?searchText=${searchText}&page=${page}&visibility=${FEED_VISIBILITY}`;
    const topicsWithReelays = await fetchResults(routeGet, {
        method: 'GET',
        headers: { ...ReelayAPIHeaders, requsersub: reqUserSub },
    });

    const prepareTopicReelays = async (topic) => {
        topic.reelays = await Promise.all(topic.reelays.map(prepareReelay));
        return topic;
    }

    const preparedTopics = await Promise.all(topicsWithReelays.map(prepareTopicReelays));
    return preparedTopics;
}
