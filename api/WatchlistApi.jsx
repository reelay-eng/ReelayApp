import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { fetchAnnotatedTitle } from './TMDbApi';
import ReelayAPIHeaders, { getReelayAuthHeaders } from './ReelayAPIHeaders';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

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
    const titleObj = await fetchAnnotatedTitle({ tmdbTitleID, isSeries });
    return {
        ...fetchedWatchlistItem,
        title: titleObj,
    };
}

// MANAGE WATCHLIST

export const addToMyWatchlist = async ({ reqUserSub, reelaySub, creatorName, tmdbTitleID, titleType }) => {
    const check = checkForErrors({ reqUserSub, tmdbTitleID, titleType });
    if (check.error) return check.error;

    const routePost = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/add`;
    const postBody = { 
        recommendedReelaySub: reelaySub, 
        recReelayCreatorName: creatorName,
        tmdbTitleID, 
        titleType, 
    };

    try {
        const dbResult = await fetchResults(routePost, {
            method: 'POST',
            headers: {
                ...ReelayAPIHeaders,
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
                ...ReelayAPIHeaders, 
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
                ...ReelayAPIHeaders, 
                requsersub: reqUserSub,
            },
        });
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
                ...ReelayAPIHeaders, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return patchResult;    
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
                ...ReelayAPIHeaders, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return patchResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const moveWatchlistItemToFront = async ({ authSession, itemID, reqUserSub }) => {
    const routePatch = `${REELAY_API_BASE_URL}/watchlists/moveToFront`;
    const patchBody = { itemID };
    console.log(routePatch);

    try {
        const sendRecResult = await fetchResults(routePatch, {
            method: 'PATCH',
            headers: { 
                ...getReelayAuthHeaders(authSession), 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return sendRecResult;    
    } catch (error) {
        console.log(error);
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
                ...ReelayAPIHeaders, 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return removeResult;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

// RECOMMENDATIONS
export const getWatchlistRecs = async ({ authSession, reqUserSub, category = 'all'}) => {
    const routeGet = `${REELAY_API_BASE_URL}/watchlists/recs?category=${category}`;
    try {
        const recommendedTitles = await fetchResults(routeGet, {
            method: 'GET',
            headers: { 
                ...getReelayAuthHeaders(authSession), 
                requsersub: reqUserSub,
            },
        });

        const prepareRecTitle = async (title) => {
            const tmdbTitleID = title?.tmdbTitleID ?? 0;
            const titleType = title?.titleType;
            const isSeries = (titleType === 'tv');
            console.log('preparing title: ', title);
            return await fetchAnnotatedTitle({ tmdbTitleID, isSeries });
        }

        return await Promise.all(recommendedTitles.map(prepareRecTitle));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// EMOJI REACTIONS
export const getPreferredReactEmojis = async ({ authSession, reqUserSub }) => {
    const routePost = `${REELAY_API_BASE_URL}/watchlists/preferredReactEmojis`
    console.log(routePost);

    try {
        const resultGet = await fetchResults(routePost, {
            method: 'GET',
            headers: { 
                ...getReelayAuthHeaders(authSession), 
                requsersub: reqUserSub,
            },
        });
        return resultGet;    
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const getTitleReactEmojis = async ({ authSession, tmdbTitleID, titleType, reqUserSub }) => {
    const queryParams = `tmdbTitleID=${tmdbTitleID}&titleType=${titleType}`;
    const routePost = `${REELAY_API_BASE_URL}/watchlists/preferredReactEmojis?${queryParams}`;
    console.log(routePost);

    try {
        const resultGet = await fetchResults(routePost, {
            method: 'GET',
            headers: { 
                ...getReelayAuthHeaders(authSession), 
                requsersub: reqUserSub,
            },
        });
        return resultGet;    
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const setReactEmojis = async ({ authSession, itemID, reactEmojis, reqUserSub }) => {
    const routePatch = `${REELAY_API_BASE_URL}/watchlists/setEmojis`
    const patchBody = { itemID, reactEmojis }
    console.log(routePatch);

    try {
        const resultPatch = await fetchResults(routePatch, {
            method: 'PATCH',
            headers: { 
                ...getReelayAuthHeaders(authSession), 
                requsersub: reqUserSub,
            },
            body: JSON.stringify(patchBody),
        });
        return resultPatch;    
    } catch (error) {
        console.log(error);
        return [];
    }
}
