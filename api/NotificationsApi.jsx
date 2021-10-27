import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { fetchReelaysForStack } from '../api/ReelayApi';
import { getRegisteredUser, getUserByUsername, getMostRecentReelaysByTitle } from './ReelayDBApi';

const EXPO_NOTIFICATION_URL = Constants.manifest.extra.expoNotificationUrl;
const STACK_NOTIFICATION_LIMIT = 4;

const getDevicePushToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
}

// We probably shouldn't let these have default values...
const sendPushNotification = async ({
    body='Default notification body', 
    data={},
    title='Default notification title', 
    token, 
    sound='default'
}) => {
    const message = { body, data, sound, title, to: token };
    console.log('push notification message: ');
    console.log(message);
    const response = await fetch(EXPO_NOTIFICATION_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });

    if (response?.data?.error) {
        console.log(response.data.error);
    }
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

    if (!token) {
        console.log('Creator not registered for notifications');
        return;
    }

    const title = `${author.username} commented on your reelay!`;
    const bodyTitle = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    const body = `${bodyTitle}: ${commentText}`;
    await sendPushNotification({ title, body, token });
}

export const sendCommentNotificationToThread = async ({ creator, author, reelay, commentText }) => {

    console.log('IN SEND COMMENT NOTIFICATION TO THREAD');
    console.log(creator);
    console.log(author);
    console.log(reelay.title);

    reelay.comments.map(async (comment, index) => {
        const notifyAuthorName = comment.authorName;
        const notifyUser = await getUserByUsername(notifyAuthorName);

        const token = notifyUser?.token;
        if (!token) {
            console.log('Comment author not registered for notifications');
            return;
        }

        const recipientIsAuthor = (notifyUser.sub === author.attributes.sub);
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
        await sendPushNotification({ title, body, token });    
    });
}

export const sendLikeNotification = async ({ creatorSub, user, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    const recipientIsAuthor = (creatorSub === user.attributes.sub);
    if (recipientIsAuthor) {
        const title = `Achievement earned: Love Yourself`;
        const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;    
        await sendPushNotification({ title, body, token });
        return;
    }

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${user.username} liked your reelay!`;
    const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
    await sendPushNotification({ title, body, token });
}

export const sendStackPushNotificationToOtherCreators = async ({ creator, reelay }) => {
    console.log('Sending stack push notification to other creators');
    console.log(reelay);
    const reelayStack = await getMostRecentReelaysByTitle(reelay.title.id);
    
    reelayStack.map(async (reelay, index) => {
        console.log('For other reelay in stack: ', reelay.title.display, reelay.creator.username);
        const notifyCreatorSub = await getRegisteredUser(reelay.creator.sub);
        const token = notifyCreatorSub?.pushToken;

        if (!token) {
            console.log('Creator not registered for like notifications');
            return;
        }

        const recipientIsCreator = (notifyCreatorSub === creator.attributes.sub);
        if (recipientIsCreator) {
            console.log('No need to send notification to creator');
            return;
        }    

        const alreadyNotified = (reelay) => (notifyCreatorSub === reelay.creator.sub);
        const recipientIndex = reelayStack.findIndex(alreadyNotified);
        if (recipientIndex < index) {
            console.log('Recipient already notified');
            return;
        }

        const title = `${creator.username} also posted a reelay!`;
        const body = (reelay.title.releaseYear) ? `${reelay.title.display} (${reelay.title.releaseYear})` : `${reelay.title.display}`;
        await sendPushNotification({ title, body, token });    
    })
}