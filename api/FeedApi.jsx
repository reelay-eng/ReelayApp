import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import { getReelayAuthHeaders } from './ReelayAPIHeaders';

const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

export const getEmptyGlobalTopics = async ({ authSession, page, reqUserSub }) => {
    const routeGet = `${REELAY_API_BASE_URL}/feed/emptyGlobalTopics?page=${page}&visibility=${FEED_VISIBILITY}`;
    console.log('route get: ', routeGet);
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
