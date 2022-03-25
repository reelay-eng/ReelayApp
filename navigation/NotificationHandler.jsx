import AsyncStorage from "@react-native-async-storage/async-storage";
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { getReelay, prepareReelay } from "../api/ReelayDBApi";

export const handlePushNotificationResponse = async ({ 
    myWatchlistItems, 
    navigation, 
    notificationContent, 
    reelayDBUser, 
    setMyWatchlistItems 
}) => {
    const { title, body, data } = notificationContent;
    const action = data?.action;
    console.log('handle push data: ', data);
    if (!action) {
        console.log('No action given');
        return;
    }

    logAmplitudeEventProd('openedNotification', {
        username: reelayDBUser?.username,
        sub: reelayDBUser?.sub,
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
        if (!data.fromUser) {
          console.log("No user given");
        } else {
            await openUserProfileScreen(navigation, data?.fromUser);
        }
    } else if (action === 'openCreateScreen') {
        await openCreateScreen(navigation);
    } else if (action === 'openMyRecs') {
        await openMyRecs(navigation, [data?.newWatchlistItem], myWatchlistItems, setMyWatchlistItems);
    }
}

const openCreateScreen = async (navigation) => {
    if (!navigation) {
        console.log('No navigation ref');
        return;
    }
    navigation.navigate('Create');
}

// todo: only add if coming from external push notification
const openMyRecs = async (navigation, newWatchlistItems, myWatchlistItems, setMyWatchlistItems) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    const isSameWatchlistItem = (item0, item1) => (item0.id === item1.id);
    const allMyWatchlistItems = [...newWatchlistItems, ...myWatchlistItems];
    const uniqueWatchlistItems = allMyWatchlistItems.filter((nextItem, index) => {
        const duplicateIndex = allMyWatchlistItems.slice(0, index).findIndex((prevItem) => {
            return isSameWatchlistItem(prevItem, nextItem);
        });
        return duplicateIndex === -1;
    });
    setMyWatchlistItems(uniqueWatchlistItems);
    await AsyncStorage.setItem('myWatchlist', JSON.stringify(uniqueWatchlistItems));
    navigation.navigate('Watchlist', { category: 'Recs' });
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
