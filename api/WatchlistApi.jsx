import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

const checkForErrors = ({ reqUserSub, tmdbTitleID, titleType }) => {
    if (!['film', 'tv'].includes(titleType)) {
        return { error: 'Invalid title type' };
    }
    if (!reqUserSub || !tmdbTitleID) {
        return { error: 'Invalid watchlist request' };
    }
    return { success: 1 };
}

const prepareWatchlistItem = async (fetchedWatchlistItem) => {
    const { tmdbTitleID, titleType } = fetchedWatchlistItem;
    const isSeries = (titleType === 'tv');
    const titleObj = await fetchAnnotatedTitle(tmdbTitleID, isSeries);
    return {
        ...fetchedWatchlistItem,
        title: titleObj,
    };
}

// MANAGE WATCHLIST

export const addToMyWatchlist = async (reqUserSub, tmdbTitleID, titleType) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePost = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/add`;
    const postBody = { tmdbTitleID, titleType };
    console.log(routePost);

    try {
        const dbResult = await fetchResults(routePost, {
            method: 'POST',
            headers: {
                ...REELAY_API_HEADERS,
                requsersub: reqUserSub,
            },
            body: JSON.stringify(postBody),
        });
        return prepareWatchlistItem(dbResult);
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const getWatchlistItems = async (reqUserSub, category = 'all') => {
    if (!['all', 'unseen', 'seen', 'recs'].includes(category)) {
        console.error('Invalid watchlist item category');
        return [];
    }
    if (!reqUserSub) return [];

    const routeGet = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/${category}`;
    console.log(routeGet);

    try {
        const watchlistItems = await fetchResults(routeGet, {
            method: 'GET',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
        });
        return await Promise.all(watchlistItems.map(prepareWatchlistItem));    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const getSentRecommendations = async ({
    reqUserSub, 
    tmdbTitleID, 
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;
    const paramStr = `tmdbTitleID=${tmdbTitleID}&titleType=${titleType}`
    const routeGet = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/sent?${paramStr}`;

    try {
        const sentRecs = await fetchResults(routeGet, {
            method: 'GET',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
        });
        console.log('sent recs: ', sentRecs);
        return await Promise.all(sentRecs.map(prepareWatchlistItem));    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const markWatchlistItemSeen = async ({
    reqUserSub,
    tmdbTitleID,
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePatch = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/markSeen`;
    const patchBody = { tmdbTitleID, titleType };
    console.log(routePatch);

    try {
        const patchResult = await fetchResults(routePatch, {
            method: 'PATCH',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return await patchResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const markWatchlistItemUnseen = async ({
    reqUserSub,
    tmdbTitleID,
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePatch = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/markUnseen`;
    const patchBody = { tmdbTitleID, titleType };
    console.log(routePatch);

    try {
        const patchResult = await fetchResults(routePatch, {
            method: 'PATCH',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return await patchResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const removeFromMyWatchlist = async ({ reqUserSub, tmdbTitleID, titleType }) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePatch = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/remove`;
    const patchBody = { tmdbTitleID, titleType };
    console.log(routePatch);

    try {
        const removeResult = await fetchResults(routePatch, {
            method: 'DELETE',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return await removeResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

// RECOMMENDATIONS

export const sendRecommendation = async ({
    recommendedReelaySub, // optional
    reqUserSub,
    reqUsername,
    sendToUserSub,
    tmdbTitleID,
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePost = `${REELAY_API_BASE_URL}/watchlists/${sendToUserSub}/recs`;
    const postBody = { 
        recommendedBySub: reqUserSub,
        recommendedByUsername: reqUsername,
        recommendedReelaySub,
        tmdbTitleID,
        titleType,
    }
    console.log(routePost);

    try {
        const sendRecResult = await fetchResults(routePost, {
            method: 'POST',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(postBody),
        });
        console.log('Worked fine');
        return await sendRecResult;    
    } catch (error) {
        console.log('Didn\'t work fine');
        console.log(error);
        return [];
    }
}

export const acceptRecommendation = async ({
    recommendedBySub,
    reqUserSub,
    tmdbTitleID,
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePatch = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/acceptRec`;
    const patchBody = { 
        recommendedBySub,
        tmdbTitleID,
        titleType,
    }
    console.log(routePatch);

    try {
        const sendRecResult = await fetchResults(routePatch, {
            method: 'PATCH',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return await sendRecResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const ignoreRecommendation = async ({
    recommendedBySub,
    reqUserSub,
    tmdbTitleID,
    titleType,
}) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePatch = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/ignoreRec`;
    const deleteBody = { 
        recommendedBySub,
        tmdbTitleID,
        titleType,
    }
    console.log(routePatch);

    try {
        const sendRecResult = await fetchResults(routePatch, {
            method: 'DELETE',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(deleteBody),
        });
        return await sendRecResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}
