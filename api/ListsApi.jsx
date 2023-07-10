import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';
import { prepareReelay } from './ReelayDBApi';
import { fetchAnnotatedTitle } from './TMDbApi';
import * as Linking from 'expo-linking';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const createList = async (postBody) => {
    const routePost = `${REELAY_API_BASE_URL}/list/creator`;
    const createTopicResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: postBody.creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return createTopicResult;
}


export const shareList = async (postBody) => {
    const routePost = `${REELAY_API_BASE_URL}/list/shared`;
    const createTopicResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: postBody.creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    console.log("createTopicResult",createTopicResult)
    return createTopicResult;
}

export const getLists = async ({reqUserSub,  page = 0}) => {
    const routeGet = `${REELAY_API_BASE_URL}/getlist?userSub=${reqUserSub}`;//&pagesize=1&currentpage=1`;
    // console.log('List route get: ', routeGet);
    const fetchedTopics = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });
    // console.log('fetchedTopics ', fetchedTopics);
    return fetchedTopics?.data;
}


export const getCustomFromCode = async (shareCode,reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/listlink/${shareCode}`;
    // console.log("getCustomFromCode",shareCode,reqUserSub)
    const customResult = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });
    console.log("customResult",customResult)
    if (!customResult || !customResult.data || !customResult.data.deeplinkURI) return null;
    return customResult?.data;
}

export const updateMoviesList = async (reqUserSub, postBody) => {
    console.log("postBody",postBody)
    const routeGet = `${REELAY_API_BASE_URL}/listmovie/${reqUserSub}/add`;
    const fetchedMovies = await fetchResults(routeGet, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
        body: JSON.stringify(postBody),
    });
    // console.log("updateMoviesList",fetchedMovies)
    return fetchedMovies;
    // return await Promise.all(fetchedMovies?.data?.map(prepareWatchlistItem));    
}

export const getListMovies = async ({reqUserSub, listId,  page = 0}) => {
    const routeGet = `${REELAY_API_BASE_URL}/listmovie?listId=${listId}`;//&pagesize=1&currentpage=1`;
    const fetchedMovies = await fetchResults(routeGet, {
        method: 'GET',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: reqUserSub,
        },
    });
    console.log("fetchedMovies",fetchedMovies)
    return await Promise.all(fetchedMovies?.data?.map(prepareWatchlistItem));    
}


export const fetchOrCreateListLink = async ({ listId, listName, description, creatorSub, creatorName }) => {
    // using the scheme reelayapp://, the statement below creates an unusable triple slash
    // ...doesn't happen on expo
    let deeplinkURI = Linking.createURL(`/list`);
    console.log("deeplinkURI",deeplinkURI)
    deeplinkURI = deeplinkURI.replace('///', '//'); 

    const routePost = `${REELAY_API_BASE_URL}/listlink/create`;
    const postBody = {
        deeplinkURI, 
        listId, listName, description, creatorSub, creatorName
    };

    const dbResult = await fetchResults(routePost, {
        method: 'POST',
        headers: {
            ...ReelayAPIHeaders,
            requsersub: creatorSub,
        },
        body: JSON.stringify(postBody),
    });
    return dbResult?.data;
}

const prepareWatchlistItem = async (fetchedWatchlistItem) => {
    const { tmdbTitleID, titleType } = fetchedWatchlistItem;
    const isSeries = (titleType === 'tv');
    const titleObj = await fetchAnnotatedTitle({ tmdbTitleID, isSeries });
    return {
        ...fetchedWatchlistItem,
        title: titleObj,
    };
}
