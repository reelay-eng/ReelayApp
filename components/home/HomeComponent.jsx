import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import styled from 'styled-components';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnStreaming from './OnStreaming';
import AtFestivals from './AtFestivals';
import GlobalTopics from '../topics/GlobalTopics';

import { getFeed, getFollowing, getLatestAnnouncement, getStreamingSubscriptions } from '../../api/ReelayDBApi';
import { getAllMyNotifications } from '../../api/NotificationsApi';
import { AuthContext } from '../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import { getGlobalTopics } from '../../api/TopicsApi';
import TopOfTheWeek from './TopOfTheWeek';
import { useFocusEffect } from '@react-navigation/native';
import NoticeOverlay from '../overlay/NoticeOverlay';

const HomeContainer = styled(SafeAreaView)`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`
const ScrollContainer = styled(ScrollView)`
    width: 100%;
    height: auto;
`
const Spacer = styled.View`
    height: ${props => props.height + "px" ?? "50px"};
`

const HomeComponent = ({ navigation }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const authSession = useSelector(state => state.authSession);
    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const scrollRef = useRef(null);

    const isGuestUser = reelayDBUser?.username === 'be_our_guest';
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const showNotice = latestNotice && !latestNoticeDismissed;

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
        const unsubscribe = navigation.getParent().addListener('tabPress', e => {
            e.preventDefault();
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ y: 0, animated: true });
                onRefresh();
            }
        });
        return () => unsubscribe();
    })

    const onRefresh = async () => {
        setRefreshing(true);
        const reqUserSub = reelayDBUser?.sub;
        const [
            myFollowingLoaded,
            myNotifications,
            myStreamingSubscriptions,
            globalTopics,
            latestAnnouncement,
            topOfTheWeek,
            myStacksFollowing,
            myStacksInTheaters,
            myStacksOnStreaming,
            myStacksAtFestivals,
        ] = await Promise.all([
            getFollowing(reelayDBUser?.sub),
            getAllMyNotifications(reelayDBUser?.sub),
            getStreamingSubscriptions(reelayDBUser?.sub),
            getGlobalTopics({ reqUserSub, page: 0 }),
            getLatestAnnouncement({ authSession, reqUserSub, page: 0 }),
            getFeed({ reqUserSub, feedSource: 'trending', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'following', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'theaters', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'streaming', page: 0 }),
            getFeed({ reqUserSub, feedSource: 'festivals', page: 0 }),
        ]);
        
        dispatch({ type: 'setGlobalTopics', payload: globalTopics });
        dispatch({ type: 'setLatestAnnouncement', payload: latestAnnouncement });
        dispatch({ type: 'setTopOfTheWeek', payload: topOfTheWeek });
        dispatch({ type: 'setMyFollowing', payload: myFollowingLoaded });
        dispatch({ type: 'setMyNotifications', payload: myNotifications });
        dispatch({ type: 'setMyStreamingSubscriptions', payload: myStreamingSubscriptions });
        dispatch({ type: 'setMyStacksFollowing', payload: myStacksFollowing });
        dispatch({ type: 'setMyStacksInTheaters', payload: myStacksInTheaters });
        dispatch({ type: 'setMyStacksOnStreaming', payload: myStacksOnStreaming });        
        dispatch({ type: 'myStacksAtFestivals', payload: myStacksAtFestivals });
        setRefreshing(false);
    }

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    useEffect(() => {
        if (latestNoticeDismissed) {
            setTimeout(() => dispatch({ type: 'setLatestNoticeDismissed', payload: false }), 5000);
        }
    }, [latestNoticeDismissed]);
    
    useEffect(() => {
        dispatch({ type: 'setLatestNotice', payload: null });
    }, []);

    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            <ScrollContainer ref={scrollRef} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                {/* <Announcements /> */}
                <TopOfTheWeek navigation={navigation} />
                <FriendsAreWatching navigation={navigation} />
                <GlobalTopics navigation={navigation} />
                <OnStreaming navigation={navigation} />
                <InTheaters navigation={navigation} />
                <AtFestivals navigation={navigation} />
                <Spacer height={80} />
            </ScrollContainer>
            <BottomBar />
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
            { showNotice && (
                <NoticeOverlay navigation={navigation} /> 
            )}
        </HomeContainer>
    )
}

const Announcements = ({ navigation }) => {
 // fill once we start using
}

const BottomBar = styled(View)`
    background-color: black;
    height: 100px;
    width: 100%;
    position: absolute;
    bottom: 0px;
`

export default HomeComponent;