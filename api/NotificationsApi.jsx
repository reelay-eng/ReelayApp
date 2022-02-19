import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { fetchResults } from './fetchResults';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

import { 
    getMostRecentReelaysByTitle,
    getRegisteredUser, 
    getUserByUsername, 
} from './ReelayDBApi';

const EXPO_NOTIFICATION_URL = Constants.manifest.extra.expoNotificationUrl;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
    'reelayapikey': REELAY_API_KEY,
};

const getDevicePushToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        logAmplitudeEventProd('pushTokenFetchFailed', {
            status: existingStatus
        });
        return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}

export const condensedTitleObj = (titleObj) => {
    const { id, display, posterSource, releaseYear } = titleObj;
    return { id, display, posterSource, releaseYear };
}

export const getAllMyNotifications = async (userSub, page = 0) => {
    const routeGet = REELAY_API_BASE_URL + `/notifications/${userSub}/all?page=${page}`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });

    // notification content is comprised of { title, body, data }
    // the last of these is stored as a JSON string, so we parse it before storing locally
    const parsedNotifications = resultGet.map((notification) => {
        try {
            notification.data = JSON.parse(notification?.data);
        } catch (error) {
            console.log('Error in getAllMyNotifications: ', error);
        }
        return notification;
    })

    return parsedNotifications;
}

export const getMyNotificationSettings = async(user) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${user.attributes.sub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
}

export const getUserNotificationSettings = async (userSub) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${userSub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
}

export const hideNotification = async (notificationID) => {
    const routeDelete = REELAY_API_BASE_URL + `/notifications/${notificationID}/hide`;
    const resultDelete = await fetchResults(routeDelete, { 
        method: 'DELETE',
        headers: REELAY_API_HEADERS,
    });

    console.log('HID NOTIFICATION: ', resultDelete);
    return resultDelete;
}

export const markAllNotificationsSeen = async (userSub) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${userSub}/markAllSeen`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    console.log('MARK ALL SEEN: ', resultPatch);
    return resultPatch;
}

export const markNotificationActivated = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markActivated`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    return resultPatch;
}

export const markNotificationReceived = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markReceived`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    return resultPatch;
}

export const markNotificationSeen = async (notificationID) => {
    const routePatch = REELAY_API_BASE_URL + `/notifications/${notificationID}/markSeen`;
    const resultPatch = await fetchResults(routePatch, { 
        method: 'PATCH',
        headers: REELAY_API_HEADERS,
    });
    return resultPatch;
}

// https://docs.expo.dev/push-notifications/push-notifications-setup/
export const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Constants.isDevice) {
        return await getDevicePushToken();
    } else {
        alert('Must use physical device for Push Notifications');
        return null;
    }
}; 

// We probably shouldn't let these have default values...
export const sendPushNotification = async ({
    body='', 
    data={},
    sendToUserSub,
    sound='default',
    title='You have a notification from Reelay', 
    token, 
}) => {
    const dataToPush = { ...data, 'content-available': 1 };
    const reelayDBPostBody = { title, body, data: dataToPush };
    const reelayDBRoutePost = `${REELAY_API_BASE_URL}/notifications/${sendToUserSub}`;

    const { settingsNotifyReactions } = await getUserNotificationSettings(sendToUserSub);
    if (!settingsNotifyReactions) {
        console.log('Creator does not want to receive push notifications');
        return;
    }

    console.log('POST BODY: ', reelayDBPostBody);
    const postResult = await fetchResults(reelayDBRoutePost, {
        method: 'POST',
        headers: REELAY_API_HEADERS,
        body: JSON.stringify(reelayDBPostBody),
    });

    console.log('Notification posted to ReelayDB: ', postResult);

    const expoMessage = { body, data: dataToPush, sound, title, to: token };
    const expoResponse = await fetchResults(EXPO_NOTIFICATION_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expoMessage),
    });

    if (expoResponse?.data?.error) {
        console.log(expoResponse.data.error);
    }

    return expoResponse;
}

export const notifyCreatorOnComment = async ({ creatorSub, author, reelay, commentText }) => {
    const recipientIsAuthor = (creatorSub === author.attributes.sub);
    if (recipientIsAuthor) {
        console.log('No need to send notification to creator');
        return;
    }

    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log('Creator not registered for notifications');
        return;
    }

    const title = `@${author.username} commented on your reelay.`;
    // const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    // const body = `${bodyTitle}: ${commentText}`;
    const body = '';
    const data = {        
        notifyType: 'notifyCreatorOnComment', 
        commentText,
        // reelaySub is used by the primary action
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),
        fromUser: { sub: author.attributes.sub, username: author.username },
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
}

export const notifyThreadOnComment = async ({ creator, author, reelay, commentText }) => {
    reelay.comments.map(async (comment, index) => {
        const notifyAuthorName = comment.authorName;
        const notifyAuthor = await getUserByUsername(notifyAuthorName);

        const token = notifyAuthor?.pushToken;
        if (!token) {
            console.log('Comment author not registered for notifications');
            return;
        }

        const recipientIsAuthor = (notifyAuthor.sub === author.attributes.sub);
        if (recipientIsAuthor) {
            console.log('No need to send notification to comment author');
            return;
        }

        // if we don't catch this, we'll send a notification twice to a creator
        // who commented on their own reelay
        const recipientIsCreator = (notifyAuthor.sub === creator?.sub);
        if (recipientIsCreator) {
            console.log('No need to send notification to creator');
            return;
        }    

        const recipientAlreadyNotified = (comment) => comment.authorName === notifyAuthorName;
        const recipientIndex = reelay.comments.findIndex(recipientAlreadyNotified);
        if (recipientIndex < index) {
            console.log('User already notified');
            return;
        }

        const creatorDirectObject = (creator.username === author.username) 
            ? 'their'
            : `@${creator.username}'s`;
            
        const title = `@${author.username} also commented on ${creatorDirectObject} reelay.`;
        // const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        // const body = `${bodyTitle}: ${commentText}`;
        const body = '';
        const data = { 
            notifyType: 'notifyThreadOnComment',
            commentText,
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: author.attributes.sub, username: author.username },
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyAuthor?.sub });    
    });
}

export const notifyCreatorOnFollow = async ({ creatorSub, follower }) => {
    console.log('follower', follower)
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log("Creator not registered for follow notifications");
        return;
    }

    const title = `@${follower.username} followed you!`;
    const body = ``;
    const data = {
        action: "openUserProfileScreen",
        fromUser: { sub: follower.sub, username: follower.username },
        notifyType: 'notifyCreatorOnFollow',
        // here, the alt action is to follow, and we can get that
        // from the type 
    };
    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
};

export const notifyCreatorOnLike = async ({ creatorSub, user, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const recipientIsAuthor = (creatorSub === user.attributes.sub);
    if (recipientIsAuthor) {
        const title = `Achievement earned: Love Yourself`;
        // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const body = '';
        const data = { 
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            notifyType: 'loveYourself',
        };
    
        await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `@${user.username} liked your reelay.`;
    // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    const body = '';
    const data = { 
        notifyType: 'notifyCreatorOnLike',
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
        title: condensedTitleObj(reelay.title),   
        fromUser: { sub: user.attributes.sub, username: user.username },
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
}

export const notifyOtherCreatorsOnReelayPosted = async ({ creator, reelay }) => {
    const notifyReelayStack = await getMostRecentReelaysByTitle(reelay.title.id);
    
    notifyReelayStack.map(async (notifyReelay, index) => {
        const notifyCreator = await getRegisteredUser(notifyReelay.creator.sub);
        const token = notifyCreator?.pushToken;

        if (!token) {
            console.log('Creator not registered for like notifications');
            return;
        }

        const recipientIsCreator = (notifyCreator.sub === creator.attributes.sub);
        if (recipientIsCreator) {
            console.log('No need to send notification to creator');
            return;
        }    

        const alreadyNotified = (reelay) => (notifyCreator.sub === reelay.creator.sub);
        const recipientIndex = notifyReelayStack.findIndex(alreadyNotified);
        if (recipientIndex < index) {
            console.log('Recipient already notified');
            return;
        }

        const title = `@${creator.username} also posted a reelay.`;
        // const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const body = '';
        const data = { 
            notifyType: 'notifyOtherCreatorsOnReelayPosted',
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
            title: condensedTitleObj(reelay.title),   
            fromUser: { sub: creator.attributes.sub, username: creator.username },
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyReelay.creator.sub });    
    })
}

export const setMyNotificationSettings = async({user, notifyPrompts, notifyReactions, notifyTrending }) => {
    const routePost =  
        `${REELAY_API_BASE_URL}/users/sub/${user.attributes.sub}/settings?notifyPrompts=${notifyPrompts}&notifyReactions=${notifyReactions}&notifyTrending=${notifyTrending}`;
    const resultPost = await fetchResults(routePost, { 
        method: 'POST',
        headers: REELAY_API_HEADERS,
    });
    return resultPost;
}
