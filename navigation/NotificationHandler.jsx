import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { getReelay, getReelaysForTitleKey, getRegisteredUser, prepareReelay } from "../api/ReelayDBApi";
import { getSingleTopic } from '../api/TopicsApi';
import { fetchAnnotatedTitle } from '../api/TMDbApi';
import { showErrorToast, showMessageToast } from '../components/utils/toasts';
import { getGuessingGamesPublished } from '../api/GuessingGameApi';

export const handlePushNotificationResponse = async ({ 
    authSession,
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

    const openClubActivityScreen = async ({ club, myClubs }) => {
        if (!navigation) {
            console.log('No navigation ref')
            return;
        }
    
        const loadedClub = myClubs.find(nextClub => nextClub.id === club?.id);
        if (loadedClub) {
            navigation.navigate('ClubActivityScreen', { club: loadedClub, promptToInvite: false });
        } else {
            navigation.navigate('ClubActivityScreen', { club, promptToInvite: false  });
        }
        // allows us to navigate to the ClubActivityScreen
        // ...while returning to MyClubs on navigating back
    }
    
    const openClubAtReelay = async (reelaySub) => {
        // todo
    }
    
    const openCreateScreen = async () => {
        if (!navigation) {
            console.log('No navigation ref');
            return;
        }
        navigation.navigate('Create');
    }

    const openGuessingGame = async (topicID) => {
        if (!navigation) {
            console.log('No navigation ref');
            return;
        }

        const guessingGames = await getGuessingGamesPublished({
            authSession,
            reqUserSub: reelayDBUser?.sub,
        });

        const matchGuessingGame = (game) => game?.id === topicID;
        const matchedGameIndex = guessingGames.findIndex(matchGuessingGame);
        const isGameCreator = (game?.creatorSub === reelayDBUser?.sub);
        const hasCompletedGame = (game?.hasCompletedGame) ?? false;
        
        if (matchedGameIndex !== -1) {
            navigation.push('SingleGuessingGameScreen', {
                initialFeedPos: matchedGameIndex,
                isPreview: false,
                isUnlocked: (isGameCreator || hasCompletedGame),
            });
        }
    }
    
    const openSingleReelayScreen = async (reelaySub) => {
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

    const openTitleAtReelay = async (reelaySub, titleKey) => {
        if (!navigation) {
            console.log('No navigation ref')
            return;
        }
    
        const titleThread = await getReelaysForTitleKey({ authSession, reqUserSub: reelayDBUser?.sub, titleKey });
        const reelayIndex = titleThread.findIndex(nextReelay => nextReelay.sub === reelaySub);
        if (titleThread && titleThread?.length > 0) {
            navigation.navigate('TitleFeedScreen', {
                initialStackPos: (reelayIndex === -1) ? 0 : reelayIndex,
                fixedStackList: [titleThread],
            });    
        } else {
            console.log('title thread empty: ', titleThread);
        }
    }
    
    const openTopicAtReelay = async (reelaySub) => {
        if (!navigation) {
            console.log('No navigation ref')
            return;
        }
    
        const singleReelay = await getReelay(reelaySub);
        const findReelayInTopic = (nextReelay) => nextReelay?.sub === reelaySub;
        const fetchedTopicWithReelays = await getSingleTopic({ 
            authSession, 
            reqUserSub: reelayDBUser?.sub,
            topicID: singleReelay.topicID, 
        });
    
        if (!fetchedTopicWithReelays?.reelays?.length) return;
        let reelayIndex = fetchedTopicWithReelays.reelays.findIndex(findReelayInTopic);
        navigation.navigate('SingleTopicScreen', {
            initReelayIndex: reelayIndex,
            topic: fetchedTopicWithReelays,
        });  
    }
    
    const openTitleThreadScreen = async (titleKey) => {
        if (!navigation) {
            console.log('No navigation ref');
            return;
        }
    
        const titleThread = await getReelaysForTitleKey({ authSession, reqUserSub: reelayDBUser?.sub, titleKey });
        if (titleThread && titleThread?.length > 0) {
            navigation.navigate('TitleFeedScreen', {
                initialStackPos: 0,
                fixedStackList: [titleThread],
            });    
        } else {
            console.log('title thread empty: ', titleThread);
        }
    }
    
    const openTopicThreadScreen = async (topicID) => {
        if (!navigation) {
            console.log('No navigation ref');
            return;
        }
        const fetchedTopicWithReelays = await getSingleTopic({ 
            authSession, 
            reqUserSub: reelayDBUser?.sub,
            topicID 
        });
    
        if (!fetchedTopicWithReelays?.reelays?.length) return;
        navigation.navigate('SingleTopicScreen', {
            initReelayIndex: 0,
            topic: fetchedTopicWithReelays,
        });  
    }
    
    const openUserProfileScreen = async (fromUser) => {
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

    switch (action) {
        case 'openClubActivityScreen':
            await openClubActivityScreen({ club: data?.club, myClubs });
            return;
        case 'openClubAtReelay':
            const clubUserResult = await getRegisteredUser(data?.fromUser?.sub);
            if (clubUserResult.username === '[deleted]') {
                showErrorToast("User doesn't exist!");
                return;
            }
            await openClubAtReelay(data?.reelaySub);
            return;
        case 'openCreateScreen':
            await openCreateScreen();
            return;
        case 'openGuessingGame':
            await openGuessingGame(data?.topicID);
        case 'openSingleReelayScreen':
            const reelayUserResult = await getRegisteredUser(data?.fromUser?.sub);
            if (reelayUserResult.username === '[deleted]') {
                showErrorToast("User doesn't exist!");
                return;
            }
            await openSingleReelayScreen(data?.reelaySub);
            return;
        case 'openTitleAtReelay':
            await openTitleAtReelay(data?.reelaySub, data?.titleKey);
            return;
        case 'openTopicAtReelay':
            await openTopicAtReelay(data?.reelaySub, data?.topicID);
            return;    
        case 'openTitleThreadScreen':
            await openTitleThreadScreen(data?.titleKey);
            return;    
        case 'openTopicThreadScreen':
            await openTopicThreadScreen(data?.topicID);
            return;    
        case 'openUserProfileScreen':
            const userResult = await getRegisteredUser(data?.fromUser?.sub);
            if (userResult.username === '[deleted]') {
                showErrorToast("User doesn't exist!");
                return;
            }
            await openUserProfileScreen(data?.fromUser);
            return;
        case 'openMyRecs':
            // await openMyRecs(dispatch, navigation, [data?.newWatchlistItem], myWatchlistItems);
            return;
        default:
            return;
    }
}