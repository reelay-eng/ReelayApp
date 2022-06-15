import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { getReelay, prepareReelay } from "../api/ReelayDBApi";
import { getSingleTopic } from '../api/TopicsApi';
import { fetchAnnotatedTitle } from '../api/TMDbApi';

export const handlePushNotificationResponse = async ({ 
    myClubs,
    navigation, 
    notificationContent, 
    reelayDBUser, 
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

    switch (action) {
        case 'openClubActivityScreen':
            await openClubActivityScreen(navigation, data?.club?.id, myClubs);
            return;
        case 'openClubAtReelay':
            await openClubAtReelay(navigation, data?.reelaySub);
            return;
        case 'openCreateScreen':
            await openCreateScreen(navigation);
            return;
        case 'openSingleReelayScreen':
            await openSingleReelayScreen(navigation, data?.reelaySub);
            return;
        case 'openTitleScreen':
            await openTitleScreen(navigation, data?.titleObj);
            return;    
        case 'openTopicAtReelay':
            await openTopicAtReelay(navigation, data?.reelaySub);
            return;
        case 'openUserProfileScreen':
            await openUserProfileScreen(navigation, data?.fromUser);
            return;
        case 'openMyRecs':
            // await openMyRecs(dispatch, navigation, [data?.newWatchlistItem], myWatchlistItems);
            return;
        default:
            return;
    }
}

const openClubActivityScreen = async (navigation, clubID, myClubs) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    if (!clubID) {
        console.log('No club ID given');
        return;
    }

    const club = myClubs.find(nextClub => nextClub.id === clubID);
    // allows us to navigate to the ClubActivityScreen
    // ...while returning to MyClubs on navigating back
    navigation.navigate('ClubActivityScreen', { club, promptToInvite: false });
}

const openClubAtReelay = async (navigation, reelaySub) => {
    // todo
}

const openCreateScreen = async (navigation) => {
    if (!navigation) {
        console.log('No navigation ref');
        return;
    }
    navigation.navigate('Create');
}

const openSingleReelayScreen = async (navigation, reelaySub) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    if (!reelaySub) {
        console.log('No reelay sub given');
        return;
    }

    const singleReelay = await getReelay(reelaySub);
    const preparedReelay = await prepareReelay(singleReelay); 
    navigation.navigate('SingleReelayScreen', { preparedReelay })
}

const openTitleScreen = async (navigation, titleObj) => {
    if (!navigation) {
        console.log('No navigation ref');
        return;
    }

    if (!titleObj?.id || !titleObj.titleType) {
        console.log('Invalid title type');
        return;
    }

    const tmdbTitleID = titleObj.id;
    const titleType = titleObj.titleType === 'isSeries';
    const annotatedTitle = await fetchAnnotatedTitle(tmdbTitleID, titleType);
    navigation.navigate('TitleDetailScreen', { titleObj: annotatedTitle });
}

const openTopicAtReelay = async (navigation, reelaySub) => {
    if (!navigation) {
        console.log('No navigation ref')
        return;
    }

    const singleReelay = await getReelay(reelaySub);
    const findReelayInTopic = (nextReelay) => nextReelay?.sub === reelaySub;
    const fetchedTopicWithReelays = await getSingleTopic(singleReelay.topicID);
    if (!fetchedTopicWithReelays?.reelays?.length) return;

    let reelayIndex = fetchedTopicWithReelays.reelays.findIndex(findReelayInTopic);
    navigation.navigate('SingleTopicScreen', {
        initReelayIndex: reelayIndex,
        topic: fetchedTopicWithReelays,
    });  
}

const openUserProfileScreen = async (navigation, fromUser) => {
    if (!navigation) {
        console.log("No navigation ref");
        return;
    }

    if (!fromUser) {
        console.log('No from user given');
        return;
    }

    navigation.navigate('UserProfileScreen', { creator: fromUser });
};
