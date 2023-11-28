import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

const prepareThread = async (thread) => await Promise.all(thread.map(prepareReelay));
const prepareFeed = async (feed) => await Promise.all(feed.map(prepareThread));

export const getDiscoverFeed = async ({ 
    authSession, 
    filters = {}, 
    page = 0, 
    reqUserSub, 
    sortMethod = 'mostRecent', 
    items
}) => {
    const startTime = Performance.now();
    const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
    const routeGet = `${REELAY_API_BASE_URL}/feed/discover?${queryParams}`;
    const filteredFeed = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            filtersjson: JSON.stringify(filters),
            requsersub: reqUserSub,
        }
    });
    if(filteredFeed){
        const endTime = Performance.now();
        const elapsedTimeInMilliseconds = endTime - startTime;
        console.log(`getDiscoverFeed: ${REELAY_API_BASE_URL}/feed/discover of ${items} API took ${elapsedTimeInMilliseconds} milliseconds.`);
        const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
        console.log(`getDiscoverFeed: ${REELAY_API_BASE_URL}/feed/discover API took  ${items} ${elapsedTimeInSeconds} seconds.`);
    }
   
    // console.log("filteredFeed",routeGet,{ ...getReelayAuthHeaders(authSession),
    //     filtersjson: JSON.stringify(filters),
    //     requsersub: reqUserSub,})
    return await prepareFeed(filteredFeed);
}

export const getDiscoverFeedLatest = async ({ 
    authSession, 
    filters = {}, 
    page = 0, 
    reqUserSub, 
    sortMethod = 'mostRecent', 
}) => {
    const startTime = Performance.now();
    const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
    const routeGet = `${REELAY_API_BASE_URL}/feed/discovernew?${queryParams}`;
    const filteredFeed = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            filtersjson: JSON.stringify(filters),
            requsersub: reqUserSub,
        }
    });
    if(filteredFeed){
        const endTime = Performance.now();
        const elapsedTimeInMilliseconds = endTime - startTime;
        console.log(`getDiscoverFeedLatest: ${REELAY_API_BASE_URL}/feed/discovernew of ${items} API took ${elapsedTimeInMilliseconds} milliseconds.`);
        const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
        console.log(`getDiscoverFeedLatest: ${REELAY_API_BASE_URL}/feed/discovernew of ${items} API took ${elapsedTimeInSeconds} seconds.`);
    }
    // console.log("filteredFeed",routeGet, {
    //     ...getReelayAuthHeaders(authSession),
    //     filtersjson: JSON.stringify(filters),
    //     requsersub: reqUserSub,
    // })
    return await prepareThread(filteredFeed);
}

export const getDiscoverFeedNew = async ({ 
            authSession, 
            filters = {}, 
            page = 0, 
            reqUserSub, 
            sortMethod = 'mostRecent', 
        })=>{
            const startTime = Performance.now();
        const queryParams = `page=${page}&sortMethod=${sortMethod}&visibility=${FEED_VISIBILITY}`;
        const routeGet = `${REELAY_API_BASE_URL}/feed/latest?${queryParams}`;
        const filteredFeed = await fetchResults(routeGet, {
            method: 'GET',
            headers: {
                ...getReelayAuthHeaders(authSession),
                filtersjson: JSON.stringify(filters),
                requsersub: reqUserSub,
            }
            // headers: ReelayAPIHeaders,
        });
        if(filteredFeed){
            const endTime = Performance.now();
            const elapsedTimeInMilliseconds = endTime - startTime;
            console.log(`getDiscoverFeedLatest: ${REELAY_API_BASE_URL}/feed/latest of  API took ${elapsedTimeInMilliseconds} milliseconds.`);
            const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
            console.log(`getDiscoverFeedLatest: ${REELAY_API_BASE_URL}/feed/latest of API took ${elapsedTimeInSeconds} seconds.`);
        }
        // console.log("filteredFeed",routeGet)
        return await prepareThread(filteredFeed);
    };


export const getEmptyGlobalTopics = async ({ authSession, page = 0, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/feed/emptyGlobalTopics?page=${page}&visibility=${FEED_VISIBILITY}`;
    const emptyTopics = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...getReelayAuthHeaders(authSession),
            requsersub: reqUserSub,
        }
    });
    
    for (const topic of emptyTopics) {
        topic.isEmptyTopic = true;
        topic.creator = {
            sub: topic.creatorSub,
            username: topic.creatorName,
        }
    }
    return emptyTopics;
}
