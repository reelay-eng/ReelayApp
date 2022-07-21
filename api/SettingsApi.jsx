import { fetchResults } from './fetchResults';
import ReelayAPIHeaders from './ReelayAPIHeaders';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

// any additional settings must be added both here and in the backend's DEFAULT_SETTINGS for them to be recognized.
const DEFAULT_SETTINGS = {
    // homescreen
    showFilmFestivals: true,
    showAwards: true,
    showHashtags: true,

    // notifications
    notificationsEnabled: true,
    notifyCommentsOnMyReelays: true,
    notifyCommentsOnOtherReelays: true,
    notifyFollows: true,
    notifyLikesOnMyReelays: true,
    notifyLikesOnMyComments: true,
    notifyTagsInReelays: true,
    notifyTagsInComments: true,
    notifyPostsOnMyReelayedTitles: true,
    notifyPostsInMyClubs: true,
    notifyPostsInMyTopics: true,
    notifyPostsInOtherTopics: true,
}

const validateSettings = (settingsObj) => {
    // helper function to ensure every setting passed in settingsObj is a known setting that we know what to do with
    const validKeys = Object.keys(DEFAULT_SETTINGS);
    for(const [key, value] of Object.entries(settingsObj)) {
        if(!validKeys.includes(key)) {
            return false;
        }
    }
    return true;
}

const getNewSettings = (oldSettings, newSettings) => {
    return { ...DEFAULT_SETTINGS, ...oldSettings, ...newSettings }
}

export const getMySettings = async (user) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${user?.sub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const getUserSettings = async (userSub) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${userSub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const updateMySettings = async ({ user, updateSettings }) => {
    if (!validateSettings(newSettings)) {
        return { error: 'Invalid settings' }
    }
    oldSettingsJSON = user?.settingsJSON
    oldSettings = oldSettingsJSON ? JSON.parse(oldSettingsJSON) : {};

    newSettings = getNewSettings(oldSettings, updateSettings);

    const routePost =  
        `${REELAY_API_BASE_URL}/users/sub/${user?.sub}/settings`;
    const resultPost = await fetchResults(routePost, { 
        method: 'POST',
        headers: ReelayAPIHeaders,
        body: { settingsJSON: JSON.stringify(newSettings)}
    });
    return resultPost;
}