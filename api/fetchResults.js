import Constants from 'expo-constants';
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const DEFAULT_TIMEOUT = (FEED_VISIBILITY === 'dev') ? 30000 : 10000;

// https://dmitripavlutin.com/timeout-fetch-request/
export const fetchResults = async (query, options={ timeout: DEFAULT_TIMEOUT }) => {
    const { timeout = DEFAULT_TIMEOUT } = options;

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
      
        const response = await fetch(query, {
            ...options,
            signal: controller.signal  
          }).then((response) => response.json())
            .catch((error) => {
                console.log('Error in fetch results: ');
                console.log(error);
            });
        clearTimeout(id);
        return response;
    
    } catch (error) {
        console.log(error);
        return null;
    }
}