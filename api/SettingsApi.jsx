import Constants from 'expo-constants';
import { fetchResults } from './fetchResults';
import ReelayAPIHeaders from './ReelayAPIHeaders';

const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;

const DEFAULT_SETTINGS = {
    // homescreen
    showFilmFestivals: true,
    showAwards: true,
    showHashtags: true,

    // notifications
    notificationsEnabled: true, // deprecated in 1.05.07
    // comments
    notifyCommentsOnMyReelays: true,
    notifyCommentsOnOtherReelays: true,
    // follows
    notifyFollows: true,
    // likes
    notifyLikesOnMyReelays: true,
    notifyLikesOnMyComments: true,
    // tags
    notifyTagsInReelays: true,
    notifyTagsInComments: true,
    // posts
    notifyPostsOnMyReelayedTitles: true,
    notifyPostsInMyClubs: true,
    notifyPostsInMyTopics: true,
    notifyPostsInOtherTopics: true,
    // watchlist recommendations
    notifyCreatorRecommendationTaken: true,
    notifyMyRecommendationTaken: true,
    // invites
    notifyClubInvites: true,
}

export const getNewSettings = (oldSettings, newSettings) => {
    return { ...DEFAULT_SETTINGS, ...oldSettings, ...newSettings }
}

export const getUserSettings = async (userSub) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${userSub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: ReelayAPIHeaders,
    });
    return resultGet;
}

export const shouldNotifyUser = async(userSub, settingKey) => {
    const settingsResult = await getUserSettings(userSub);
    if (settingsResult.error) return false;
    const userSettingsJSON = settingsResult["settingsJSON"];
    const userSettings = JSON.parse(userSettingsJSON);
    return !!userSettings[settingKey];
}

export const updateMySettings = async ({ mySub, oldSettings, settingsToUpdate }) => {
    const newSettings = getNewSettings(oldSettings, settingsToUpdate);
    const settingsUpdateBody = { settingsJSON: newSettings }

    const routePost =  
        `${REELAY_API_BASE_URL}/users/sub/${mySub}/settings`;
    const resultPost = await fetchResults(routePost, { 
        method: 'POST',
        headers: ReelayAPIHeaders,
        body: JSON.stringify(settingsUpdateBody)
    });
    return resultPost;
}