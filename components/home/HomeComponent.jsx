import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
// import { Icon } from 'react-native-elements';
import styled from 'styled-components';
// import * as ReelayText from '../global/Text';

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
import Announcement from './Announcement';
import ReelayColors from '../../constants/ReelayColors';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const AnnouncementsContainer = styled(View)`
    margin-bottom: 10px;
`
const BottomBar = styled(View)`
    background-color: black;
    height: 100px;
    width: 100%;
    position: absolute;
    bottom: 0px;
`
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
    const scrollRef = useRef(null);

    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);
    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const latestNoticeSkipped = useSelector(state => state.latestNoticeSkipped);
    const showNoticeAsOverlay = latestNotice && !latestNoticeSkipped && !latestNoticeDismissed;
    
    const Announcements = () => {
        const latestAnnouncement = useSelector(state => state.latestAnnouncement);
        const latestAnnouncementDismissed = useSelector(state => state.latestAnnouncementDismissed);
        const showNoticeAsAnnouncement = latestNotice && latestNoticeSkipped && !latestNoticeDismissed;   

        const advanceToCreateScreen = async () => {
            navigation.navigate('Create');
        }

        const advanceToCreateClubScreen = async () => {
            navigation.navigate('CreateClubScreen');
        }

        const handleNoticeOnPress = () => {
            switch (latestNotice?.actionType) {
                case 'advanceToCreateScreen':
                    advanceToCreateScreen();
                    return;
                case 'advanceToCreateClubScreen':
                    advanceToCreateClubScreen();
                    return;
                default:
                    return;
            }
        }

        return (
            <AnnouncementsContainer>
                { !latestAnnouncementDismissed && <Announcement 
                    announcement={latestAnnouncement}
                    navigation={navigation} 
                    onDismiss={() => dispatch({ type: 'setLatestAnnouncementDismissed', payload: true })}
                /> }
                { showNoticeAsAnnouncement && <Announcement 
                    announcement={latestNotice} 
                    color={ReelayColors.reelayGreen}
                    icon={<FontAwesomeIcon icon={ faPlus } color='white' size={22} />}
                    navigation={navigation} 
                    onDismiss={() => dispatch({ type: 'setLatestNoticeDismissed', payload: true })}
                    onPress={handleNoticeOnPress}
                /> }
            </AnnouncementsContainer>
        );
    }

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
        dispatch({ type: 'setLatestNotice', payload: null });
    }, []);

    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            <ScrollContainer ref={scrollRef} refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                <Announcements />
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
            { showNoticeAsOverlay && <NoticeOverlay navigation={navigation} /> }
        </HomeContainer>
    )
}

export default HomeComponent;