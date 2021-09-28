import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getRegisteredUser } from './ReelayDBApi';

const EXPO_NOTIFICATION_URL = Constants.manifest.extra.expoNotificationUrl;

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
    const bodyTitle = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;
    const body = `${bodyTitle}: ${commentText}`;
    await sendPushNotification({ title, body, token });
}

export const sendCommentNotificationToThread = async ({ creator, author, reelay, commentText }) => {
    // todo
    reelay.comments.map(async (comment, index) => {
        const notifyAuthorSub = comment.userID;
        const recipientIsAuthor = (notifyAuthorSub === author.attributes.sub);
        if (recipientIsAuthor) {
            console.log('No need to send notification to comment author');
            return;
        }
        const recipientAlreadyNotified = (comment) => comment.userID === notifyAuthorSub;
        if (reelay.comments.findIndex(recipientAlreadyNotified) < index) {
            console.log('User already notified');
            return;
        }

        console.log('notify author sub: ', notifyAuthorSub);
        console.log(comment);
        const notifyAuthor = await getRegisteredUser(notifyAuthorSub);
        const token = notifyAuthor?.token;
        if (!token) {
            console.log('Comment author not registered for notifications');
            return;
        }

        const title = `${author.username} also commented on ${creator.username}'s reelay`;
        const bodyTitle = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;
        const body = `${bodyTitle}: ${commentText}`;
        await sendPushNotification({ title, body, token });    
    });
}

export const sendLikeNotification = async ({ creatorSub, user, reelay }) => {
    const recipientIsAuthor = (creatorSub === user.attributes.sub);
    if (recipientIsAuthor) {
        const title = `Achievement earned: Love Yourself`;
        const body = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;    
        await sendPushNotification({ title, body, token });
        return;
    }

    const creator = await getRegisteredUser(creatorSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${user.username} liked your reelay!`;
    const body = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;
    await sendPushNotification({ title, body, token });
}

export const sendStackPushNotificationToOtherCreators = async ({ creator, reelayStack }) => {
    // todo
    reelayStack.map(async (reelay, index) => {
        const notifyCreatorSub = await getRegisteredUser(reelay.creator.id);
        const token = notifyCreatorSub?.pushToken;

        const alreadyNotified = (reelay) => reelay.creator.id === notifyCreatorSub;
        if (reelayStack.findIndex(alreadyNotified) < index) return;

        if (!token) {
            console.log('Creator not registered for like notifications');
            return;
        }

        const title = `${creator.username} followed up your reelay`;
        const body = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;
        await sendPushNotification({ title, body, token });    
    })
}