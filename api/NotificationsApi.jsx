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

export const sendLikeNotification = async ({ creatorSub, userSub, reelay }) => {
    const creator = await getRegisteredUser(creatorSub);
    const user = await getRegisteredUser(userSub);
    const token = creator?.pushToken;

    if (!token) {
        console.log('Creator not registered for like notifications');
        return;
    }

    const title = `${user.username} liked your reelay!`;
    const body = (reelay.releaseYear) ? `${reelay.title} (${reelay.releaseYear})` : `${reelay.title}`;

    await sendPushNotification({ title, body, token });
}