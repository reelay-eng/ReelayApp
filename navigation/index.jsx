/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { 
    addNotificationReceivedListener, 
    addNotificationResponseReceivedListener,
    getBadgeCountAsync,
    removeNotificationSubscription,
    setBadgeCountAsync,
} from 'expo-notifications';
import * as Linking from 'expo-linking';

import { AuthContext } from '../context/AuthContext';

import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';
import AccountSuspendedScreen from '../screens/suspended/AccountSuspendedScreen';
import LinkingConfiguration from './LinkingConfiguration';

import moment from 'moment';
import { handlePushNotificationResponse } from './NotificationHandler';
import { markNotificationReceived } from '../api/NotificationsApi';
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { uploadReelay } from '../api/UploadAPI';
import { getSingleTopic, getTopics } from '../api/TopicsApi';
import { getReelay } from '../api/ReelayDBApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomFromCode, getLists, shareList } from '../api/ListsApi';

const UUID_LENGTH = 36;

export default Navigation = () => {
    /**
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationrequest
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationcontent
     * https://docs.expo.dev/versions/latest/sdk/notifications/#notificationresponse
     * https://docs.expo.dev/versions/latest/sdk/notifications/#handling-push-notifications-with-react-navigation
     */

    const { reelayDBUser } = useContext(AuthContext);

    const navigationRef = useRef();
    const notificationListener = useRef();
    const responseListener = useRef(); 
    const [deeplinkURL, setDeeplinkURL] = useState(null);
    const [checkFirstTimeLogin, setcheckFirstTimeLogin] = useState(null);

    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const emptyGlobalTopics = useSelector(state => state.emptyGlobalTopics);
    const myClubs = useSelector(state => state.myClubs);

    const s3Client = useSelector(state => state.s3Client);
    const uploadRequest = useSelector(state => state.uploadRequest);
    const uploadStage = useSelector(state => state.uploadStage);

    const setUploadProgress = (progress) => dispatch({ type: 'setUploadProgress', payload: progress });
    const setUploadStage = (stage) => dispatch({ type: 'setUploadStage', payload: stage });
    const clearUploadRequest = () => dispatch({ type: 'setUploadRequest', payload: null });

    const handleDeepLink = async (event) => {
        const deeplinkURL = Linking.parse(event.url);
        if (deeplinkURL) {
            setDeeplinkURL(deeplinkURL);
        }
    }

    const initDeeplinkHandlers = async () => {
        Linking.addEventListener('url', handleDeepLink);
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
            setDeeplinkURL(Linking.parse(initialURL));
        }
    }
    
    const onNotificationReceived = async (notification) => {
        const notificationContent = parseNotificationContent(notification);
        console.log('NOTIFICATION RECEIVED', notificationContent);

        const { id } = notificationContent;
        markNotificationReceived(id);

        const badgeCount = await getBadgeCountAsync();
        setBadgeCountAsync(badgeCount + 1);
    }
 
    const onNotificationResponseReceived = async (notificationResponse) => {
        const { notification, actionIdentifier, userText } = notificationResponse;
        const notificationContent = parseNotificationContent(notification);
        handlePushNotificationResponse({ 
            authSession,
            myClubs,
            navigation: navigationRef?.current, 
            notificationContent,
            reelayDBUser,
        });
    }

    const parseNotificationContent = (notification) => {
        const { date, request } = notification;
        const { identifier, content, trigger } = request;
    
        /** You can use the following from the content object:
            const { 
                title, 
                subtitle, 
                body, 
                data, 
                badge, 
                sound, 
                categoryIdentifier 
            } = content;
        */
    
        return content;
    }    
    
    useEffect(() => {
        initDeeplinkHandlers();
        checkFirsttimeVisit();
        notificationListener.current = addNotificationReceivedListener(onNotificationReceived);
        responseListener.current = addNotificationResponseReceivedListener(onNotificationResponseReceived);

        return () => {
            removeNotificationSubscription(notificationListener.current);
            removeNotificationSubscription(responseListener.current);
            // Linking.removeEventListener('url');
        }
    }, []);

    // deeplinks _should_ be handled through LinkingConfiguration, but
    // I haven't totally figured it out. This is janky, but it gets the
    // job done. 
    useEffect(() => {
        if (deeplinkURL) {
            const navigation = navigationRef?.current;
            const { path } = deeplinkURL;
            console.log(deeplinkURL)
            logAmplitudeEventProd('openedAppFromDeeplink', {
                username: reelayDBUser?.username,
                deeplink: JSON.stringify(deeplinkURL),
                path: path,
            });

            if (path?.startsWith('reelay/')) {
                const reelaySub = path.substr('reelay/'.length);
                console.log(reelaySub)
                if (reelaySub) {
                    navigation.navigate('SingleReelayScreen', { reelaySub });
                }
            } else if (path?.startsWith('clubInvite/')) {
                if (reelayDBUser?.username === 'be_our_guest') {
                    dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
                    return;
                }
                
                const inviteCode = path.substr('clubInvite/'.length);
                if (inviteCode) {
                    navigation.navigate('ClubJoinFromLinkScreen', { inviteCode });
                }
            } else if (path?.startsWith('profile/')) {
                console.log('profile invite found');
                console.log(deeplinkURL);
                
                const inviteCode = path.substr('profile/'.length);
                if (inviteCode) {
                    navigation.navigate('UserProfileFromLinkScreen', { inviteCode });
                }
            }else if (path?.startsWith('topic/')) {
                console.log('topic deeplink found');
                console.log(deeplinkURL);
                
                const inviteCode = path.substr('topic/'.length);
                console.log("inviteCode",inviteCode)
                if (inviteCode) {
                    openTopicAtReelay(inviteCode)
                    // navigation.navigate('UserProfileFromLinkScreen', { inviteCode });
                }
            } else if (path?.startsWith('list/')) {
                console.log('List found');
                console.log(deeplinkURL);
                
                const inviteCode = path.substr('list/'.length);
                console.log('inviteCode',inviteCode);
                if (inviteCode) {
                    getCustomFromCodes(inviteCode);
                }
            } else if (path?.length === UUID_LENGTH) {
                // assume it's a reelay sub -- not entirely sure why it's cutting
                // off 'reelay/' from the front of path, but that's what we're seeing
                const reelaySub = path;
                navigation.navigate('SingleReelayScreen', { reelaySub });
            }
        }
    }, [deeplinkURL]);

    const getCustomFromCodes = async(inviteCode) =>{
        const listData =  await getCustomFromCode(inviteCode,reelayDBUser?.sub)
        const navigation = navigationRef?.current;
        console.log('listData',listData);
        if(listData){
            const listNew = {
                id:listData?.listId,
                listName:listData?.listName,
                description:listData?.description,
                creatorName:listData?.creatorName,
            }
            navigation.navigate('ListMovieScreen',{listData:listNew, fromList:true, fromDeeplink:true})
            
            const postData ={
                listName : listData?.listName,
                creatorSub : listData?.creatorSub,
                creatorName : listData?.creatorName,
                shareSub : reelayDBUser?.sub,
                shareName : reelayDBUser?.username,
                sharedListId:listData.listId
            }
            await shareList(postData);
            await getListss();
        }
    }

    const getListss = async() =>{
        dispatch({ type: 'setListData', payload: [] });
        const GetListData = await getLists({reqUserSub:reelayDBUser?.sub});
        dispatch({ type: 'setListData', payload: GetListData });
    }

    const openTopicAtReelay = async (reelaySub) => {
        const navigation = navigationRef?.current;

        const singleReelay = await getReelay(reelaySub);
        const findReelayInTopic = (nextReelay) => nextReelay?.sub === reelaySub;
        const fetchedTopicWithReelays = await getSingleTopic({ 
            authSession, 
            reqUserSub: reelayDBUser?.sub,
            topicID: reelaySub//singleReelay.topicID//reelaySub, 
        });
        
        // if (!fetchedTopicWithReelays?.reelays?.length) return;
        // let reelayIndex = fetchedTopicWithReelays.reelays.findIndex(findReelayInTopic);
        navigation.navigate('SingleTopicScreen', {
            // initReelayIndex: reelayIndex,
            topic: fetchedTopicWithReelays,
        });  
    }

    // handling reelay uploads here, rather than on the upload screen or
    // entirely in the UploadAPI file, because we need access to redux state
    // to prepare the request and trigger responses at each stage. When leaving
    // the upload screen we dismount the component, and the upload API has no
    // direct access to redux, since it's not a react component


    const publishReelay = async () => {
        try {
            dispatch({ type: 'setUploadStage', payload: 'uploading' });
            uploadRequest.authSession = authSession;
            uploadRequest.s3Client = s3Client;
            uploadRequest.setUploadProgress = setUploadProgress;
            uploadRequest.setUploadStage = setUploadStage;
            uploadRequest.clearUploadRequest = clearUploadRequest;
            await uploadReelay(uploadRequest);    

            if (uploadRequest.reelayTopic) {
                const removeTopic = (nextTopic) => (nextTopic.id !== uploadRequest.reelayTopic.id);
                const nextEmptyGlobalTopics = emptyGlobalTopics.filter(removeTopic);
                if (nextEmptyGlobalTopics.length !== emptyGlobalTopics.length) {
                    dispatch({ type: 'setEmptyGlobalTopics', payload: nextEmptyGlobalTopics });
                }

                const topics = await getTopics({ 
                    authSession: uploadRequest.authSession,
                    page: 0,
                    reqUserSub: reelayDBUser?.sub,
                    source: 'discover',
                });

                if (topics?.length > 0) {
                    dispatch({ type: 'setTopics', payload: { discover: topics }});
                }
            }
        } catch (error) {
            return { error };
        }
    }

    useEffect(() => {
        const uploadReadyToStart = (
            uploadRequest && 
            uploadRequest?.reelayDBBody && 
            uploadStage === 'upload-ready'
        );
        if (uploadReadyToStart) {
            publishReelay();
        }
    }, [uploadRequest, uploadStage]);

    // useEffect=(()=>{
    // },[])
    
    const checkFirsttimeVisit = async() => {
        try {
            const firstTime = await AsyncStorage.getItem('checkFirstTimeLogin');
            if (!firstTime) {
                setcheckFirstTimeLogin(false)
                dispatch({ type: 'setFirstTimeLogin', payload: false });
            }else{
                setcheckFirstTimeLogin(true)
                dispatch({ type: 'setFirstTimeLogin', payload: true });
            }
        } catch (error) {
            console.log("firstTime",error);
            return true;
        }

    }
    
    return (
        <NavigationContainer ref={navigationRef}
            linking={LinkingConfiguration}
            theme={DarkTheme}>
            {checkFirstTimeLogin !== null &&
            <RootNavigator firstTime={checkFirstTimeLogin} />}
        </NavigationContainer>
    );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator();

const RootNavigator = ({firstTime}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const signedIn = useSelector(state => state.signedIn);
    const firstTimeLoginScreen = useSelector(state => state.firstTimeLoginScreen);
    let isCurrentlyBanned = false;
    if (reelayDBUser?.isBanned) {
        isCurrentlyBanned = (moment(reelayDBUser?.banExpiryAt).diff(moment(), 'minutes') > 0);
    }
    // const firstTime = false;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            { !signedIn && !firstTimeLoginScreen && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} initialParams={{redirect:"LandingScreen"}}/> }
            { signedIn && isCurrentlyBanned && <Stack.Screen name="Suspended" component={AccountSuspendedScreen} /> }
            { signedIn && !isCurrentlyBanned && <Stack.Screen name="Authenticated" component={AuthenticatedNavigator} /> }
            { !signedIn && firstTimeLoginScreen  && <Stack.Screen name="Unauthenticated" component={UnauthenticatedNavigator} initialParams={{redirect:"SignedOutScreen"}}/> }
        </Stack.Navigator>
    );
}
