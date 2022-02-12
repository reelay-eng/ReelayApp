import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getRegisteredUser, getUserByUsername, getMostRecentReelaysByTitle } from './ReelayDBApi';
import { fetchResults } from './fetchResults';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

const EXPO_NOTIFICATION_URL = Constants.manifest.extra.expoNotificationUrl;
const STACK_NOTIFICATION_LIMIT = 4;

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

// We probably shouldn't let these have default values...
export const sendPushNotification = async ({
    body='', 
    data={},
    title='You have a notification from Reelay', 
    token, 
    sound='default',
    sendToUserSub,
}) => {
    const dataToPush = { 
        ...data, 
        'content-available': 1 
    };

    const reelayDBRoutePost = `${REELAY_API_BASE_URL}/notifications/${sendToUserSub}`;
    const reelayDBPostBody = { title, body, data: dataToPush };

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

export const sendCommentNotificationToCreator = async ({ creatorSub, author, reelay, commentText }) => {
    const recipientIsAuthor = (creatorSub === author.attributes.sub);
    if (recipientIsAuthor) {
        console.log('No need to send notification to creator');
        return;
    }

    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const { settingsNotifyReactions } = await getUserNotificationSettings(creator);
    if (!settingsNotifyReactions) {
        console.log('Creator does not want to receive push notifications');
        return;
    }

    if (!token) {
        console.log('Creator not registered for notifications');
        return;
    }

    const title = `${author.username} commented on your reelay!`;
    const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    const body = `${bodyTitle}: ${commentText}`;
    const data = { 
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
}

export const sendCommentNotificationToThread = async ({ creator, author, reelay, commentText }) => {
    reelay.comments.map(async (comment, index) => {
        const notifyAuthorName = comment.authorName;
        const notifyAuthor = await getUserByUsername(notifyAuthorName);

        const { settingsNotifyReactions } = await getUserNotificationSettings(notifyAuthor);
        if (!settingsNotifyReactions) {
            console.log('Author does not want to receive push notifications');
            return;
        }    

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

        const recipientAlreadyNotified = (comment) => comment.authorName === notifyAuthorName;
        const recipientIndex = reelay.comments.findIndex(recipientAlreadyNotified);
        if (recipientIndex < index) {
            console.log('User already notified');
            return;
        }

        const title = `${author.username} also commented on ${creator.username}'s reelay`;
        const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const body = `${bodyTitle}: ${commentText}`;
        const data = { 
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyAuthor?.sub });    
    });
}

export const sendFollowNotification = async ({ creatorSub, follower }) => {
    console.log('follower', follower)
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const { settingsNotifyReactions } = await getUserNotificationSettings(
        creator
    ); 
    if (!settingsNotifyReactions) {
        console.log("Creator does not want to receive push notifications"); // is it this type of notif?
        return;
    }
    if (!token) {
        console.log("Creator not registered for follow notifications");
        return;
    }

    const title = 'Reelay';
    const body = `${follower.username} followed you!`;
    const data = {
        action: "openUserProfileScreen",
        user: follower,
    };
    console.log("sending notification");
    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
};

export const sendLikeNotification = async ({ creatorSub, user, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const { settingsNotifyReactions } = await getUserNotificationSettings(creator);
    if (!settingsNotifyReactions) {
        console.log('Creator does not want to receive push notifications');
        return;
    }

    const recipientIsAuthor = (creatorSub === user.attributes.sub);
    if (recipientIsAuthor) {
        const title = `Achievement earned: Love Yourself`;
        const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const data = { 
            action: 'openSingleReelayScreen',
            reelaySub: reelay.sub,
        };
    
        await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${user.username} liked your reelay!`;
    const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    const data = { 
        action: 'openSingleReelayScreen',
        reelaySub: reelay.sub,
    };

    await sendPushNotification({ title, body, data, token, sendToUserSub: creatorSub });
}

export const sendStackPushNotificationToOtherCreators = async ({ creator, reelay }) => {
    const notifyReelayStack = await getMostRecentReelaysByTitle(reelay.title.id);
    
    notifyReelayStack.map(async (notifyReelay, index) => {
        const notifyCreator = await getRegisteredUser(notifyReelay.creator.sub);

        const { settingsNotifyReactions } = await getUserNotificationSettings(notifyCreator);
        if (!settingsNotifyReactions) {
            console.log('Creator does not want to receive push notifications');
            return;
        }
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

        const title = `${creator.username} also posted a reelay!`;
        const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        const data = { 
            action: 'openSingleReelayScreen',
            reelaySub: reelay.datastoreSub,
        };

        await sendPushNotification({ title, body, data, token, sendToUserSub: notifyReelay.creator.sub });    
    })
}

export const getMyNotificationSettings = async(user) => {
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${user.attributes.sub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
}

export const getUserNotificationSettings = async (user) => {
    console.log(user);
    const routeGet = REELAY_API_BASE_URL + `/users/sub/${user.sub}/settings`;
    const resultGet = await fetchResults(routeGet, { 
        method: 'GET',
        headers: REELAY_API_HEADERS,
    });
    return resultGet;
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