import React, { Fragment, useContext, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components';

import AtFestivals from './AtFestivals';
import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import TopicsCarousel from '../topics/TopicsCarousel';
import OnStreaming from './OnStreaming';
import PeopleToFollow from './PeopleToFollow';

import { getFollowing, getHomeContent, getLatestAnnouncement } from '../../api/ReelayDBApi';
import { getAllMyNotifications } from '../../api/NotificationsApi';
import { AuthContext } from '../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import TopOfTheWeek from './TopOfTheWeek';
import { useFocusEffect } from '@react-navigation/native';
import NoticeOverlay from '../overlay/NoticeOverlay';
import AnnouncementsAndNotices from './AnnouncementsAndNotices';
import PopularTitles from './PopularTitles';

import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';

const BottomBar = styled(LinearGradient)`
    height: 100px;
    width: 100%;
    position: absolute;
    bottom: 0px;
`
const HomeContainer = styled(View)`
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
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const authSession = useSelector(state => state.authSession);
    const scrollRef = useRef(null);

    const isNewUser = moment().diff(moment(reelayDBUser?.createdAt), 'hours') > 24;
    const [selectedTab, setSelectedTab] = useState(isNewUser ? 'discover' : 'following');
    const tabOptions = ['discover', 'following'];

    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const latestNoticeSkipped = useSelector(state => state.latestNoticeSkipped);
    const showNoticeAsOverlay = latestNotice && !latestNoticeSkipped && !latestNoticeDismissed && !isGuestUser;
    
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
            latestAnnouncement,
            myHomeContent,
            myFollowingLoaded,
            myNotifications,
        ] = await Promise.all([
            getLatestAnnouncement({ authSession, reqUserSub, page: 0 }),
            getHomeContent({ authSession, reqUserSub }),
            getFollowing(reelayDBUser?.sub),
            getAllMyNotifications(reelayDBUser?.sub),
        ]);

        const myClubs = myHomeContent?.clubs;
        const myFollowing = myHomeContent?.profile?.myFollowing;
        const myStreamingSubscriptions = myHomeContent?.profile?.myStreamingSubscriptions;
        
        dispatch({ type: 'setLatestAnnouncement', payload: latestAnnouncement });
        dispatch({ type: 'setMyHomeContent', payload: myHomeContent });
        dispatch({ type: 'setMyFollowing', payload: myFollowingLoaded });
        dispatch({ type: 'setMyNotifications', payload: myNotifications });
        dispatch({ type: 'setMyStreamingSubscriptions', payload: myStreamingSubscriptions });

        dispatch({ type: 'setMyClubs', payload: myClubs ?? [] });
        dispatch({ type: 'setMyFollowing', payload: myFollowing });
        dispatch({ type: 'setMyStreamingSubscriptions', payload: myStreamingSubscriptions });

        setRefreshing(false);
    }

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    return (
        <HomeContainer selectedTab={selectedTab}>
            <SafeAreaView>
                <HomeHeader 
                    navigation={navigation} 
                    selectedTab={selectedTab} 
                    setSelectedTab={setSelectedTab} 
                    tabOptions={tabOptions} 
                />
                </SafeAreaView>
            <ScrollContainer ref={scrollRef} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                <AnnouncementsAndNotices navigation={navigation} />
                { selectedTab === 'discover' && (
                    <Fragment>
                        <PopularTitles navigation={navigation} tab='discover' />
                        <TopOfTheWeek navigation={navigation} />
                        <TopicsCarousel navigation={navigation} source='discoverPopular' /> 
                        <PeopleToFollow navigation={navigation} /> 
                        <OnStreaming navigation={navigation} source='discover' />
                        <TopicsCarousel navigation={navigation} source='discoverNew' /> 
                        <InTheaters navigation={navigation} /> 
                        <AtFestivals navigation={navigation} /> 
                    </Fragment>
                )}
                { selectedTab === 'following' && (
                    <Fragment>
                        <FriendsAreWatching navigation={navigation} />
                        {/* <PopularTitles navigation={navigation} tab='following' /> */}
                        <OnStreaming navigation={navigation} source='following' />
                        {/* <InMyClubs navigation={navigation} />
                        <ActiveClubs navigation={navigation} /> */}
                        <TopicsCarousel navigation={navigation} source='followingNew' /> 
                    </Fragment>  
                )}
                <Spacer height={80} />
            </ScrollContainer>
            <BottomBar 
                colors={["transparent", "#000000"]} 
                locations={[0.05, 0.95]}
                end={{ x: 0.5, y: 1}}
            />
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
            { showNoticeAsOverlay && <NoticeOverlay navigation={navigation} /> }
        </HomeContainer>
    )
}

export default HomeComponent;