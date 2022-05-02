import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { getReelay, prepareReelay } from "../api/ReelayDBApi";
import { getSingleTopic } from '../api/TopicsApi';

export const handlePushNotificationResponse = async ({ 
    dispatch,
    navigation, 
    notificationContent, 
    reelayDBUser, 
    globalTopics,
    myWatchlistItems, 
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
        await openMyRecs(dispatch, navigation, [data?.newWatchlistItem], myWatchlistItems);
    } else if (action === 'openTopicAtReelay') {
        await openTopicAtReelay(navigation, globalTopics, data?.reelaySub)
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
const openMyRecs = async (dispatch, navigation, newWatchlistItems, myWatchlistItems) => {
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

    dispatch({ type: 'setMyWatchlistItems', payload: uniqueWatchlistItems });
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

const openTopicAtReelay = async (navigation, globalTopics, reelaySub) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    const singleReelay = await getReelay(reelaySub);
    const findTopicInGlobal = (nextTopic) => nextTopic?.id === singleReelay?.topicID;
    const findReelayInTopic = (nextReelay) => nextReelay?.sub === reelaySub;

    const topicIndex = globalTopics.findIndex(findTopicInGlobal);
    if (topicIndex !== -1) {
        let reelayIndex = globalTopics[topicIndex]?.reelays?.findIndex(findReelayInTopic);
        navigation.navigate('TopicsFeedScreen', {
            initTopicIndex: topicIndex,
            initReelayIndex: reelayIndex ?? 0,  
        });  
        return;
    }

    const fetchedTopicWithReelays = await getSingleTopic(singleReelay.topicID);
    if (!fetchedTopicWithReelays?.reelays?.length) return;

    let reelayIndex = fetchedTopicWithReelays.reelays.findIndex(findReelayInTopic);
    navigation.navigate('SingleTopicScreen', {
        initReelayIndex: reelayIndex,
        topic: fetchedTopicWithReelays,
    });  
}

const openUserProfileScreen = async (navigation, user) => {
    if (!navigation) {
        console.log("No navigation ref");
        return;
    }
    navigation.navigate('UserProfileScreen', { creator: user });
};
