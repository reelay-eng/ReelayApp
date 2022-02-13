import AsyncStorage from "@react-native-async-storage/async-storage";
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { getReelay, prepareReelay } from "../api/ReelayDBApi";


export const handlePushNotificationResponse = async ({ navigation, notificationContent, userContext }) => {
    const { cognitoUser, myWatchlistItems, setMyWatchlistItems } = userContext;
    const { title, body, data } = notificationContent;
    const action = data?.action;
    console.log('handle push data: ', data);
    if (!action) {
        console.log('No action given');
        return;
    }

    logAmplitudeEventProd('openedNotification', {
        username: cognitoUser?.username,
        sub: cognitoUser?.attributes.sub,
        action,
        title, 
        body,
    });

    if (action === 'openSingleReelayScreen') {
        if (!data.reelaySub) {
            console.log('No reelay sub given');
        } else {
            await openSingleReelayScreen(navigation, data?.reelaySub);
        }
    } else if (action === 'openUserProfileScreen') {
        if (!data.user) {
          console.log("No user given");
        } else {
            await openUserProfileScreen(navigation, data?.user);
        }
    } else if (action === 'openCreateScreen') {
        await openCreateScreen(navigation);
    } else if (action === 'openMyRecs') {
        await openMyRecs(navigation, data?.newItems, myWatchlistItems, setMyWatchlistItems);
    }
}

const openCreateScreen = async (navigation) => {
    if (!navigation) {
        console.log('No navigation ref');
        return;
    }
    navigation.navigate('Create');
}

const openMyRecs = async (navigation, newWatchlistItems, myWatchlistItems, setMyWatchlistItems) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    const allMyWatchlistItems = [...newWatchlistItems, ...myWatchlistItems];
    setMyWatchlistItems(allMyWatchlistItems);

    navigation.navigate('Watchlist', { category: 'Recs' });
    await AsyncStorage.setItem('myWatchlist', JSON.stringify(allMyWatchlistItems));
}

const openSingleReelayScreen = async (navigation, reelaySub) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    const singleReelay = await getReelay(reelaySub);
    const preparedReelay = await prepareReelay(singleReelay); 
    navigation.navigate('SingleReelayScreen', { preparedReelay })
}

const openUserProfileScreen = async (navigation, user) => {
    if (!navigation) {
        console.log("No navigation ref");
        return;
    }
    navigation.navigate('UserProfileScreen', { creator: user });
};
