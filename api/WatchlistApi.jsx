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

const prepareWatchlistItem = async (fetchedWatchlistItem) => {
    const { tmdbTitleID, titleType } = fetchedWatchlistItem;
    const isSeries = (titleType === 'tv');
    const titleObj = await fetchAnnotatedTitle(tmdbTitleID, isSeries);
    return {
        ...fetchedWatchlistItem,
        title: titleObj,
    };
}

export const getWatchlistItems = async (reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/all`;
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

export const getWatchlistItemsUnseen = async (reqUserSub) => {
    const routeGet = `${REELAY_API_BASE_URL}/watchlists/${reqUserSub}/unseen`;
    console.log(routeGet);
    try {
        const watchlistItems = await fetchResults(routeGet, {
            method: 'GET',
            headers: { 
                ...REELAY_API_HEADERS, 
                requsersub: reqUserSub,
            },
        });
        return watchlistItems;    
    } catch (error) {
        console.error(error);
        return [];
    }
}

export const getWatchlistSeen = async () => {
    
}

export const getWatchlistRecs = async () => {
    
}