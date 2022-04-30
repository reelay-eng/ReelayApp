import React, { memo, useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import styled from 'styled-components';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnStreaming from './OnStreaming';
import AtFestivals from './AtFestivals';

import { getFeed, getFollowing, getStreamingSubscriptions } from '../../api/ReelayDBApi';
import { getAllMyNotifications } from '../../api/NotificationsApi';
import { AuthContext } from '../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import TopOfTheWeek from './TopOfTheWeek';

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
    const { reelayDBUserID } = useContext(AuthContext);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    useEffect(() => {
        checkForUnseenGlobalReelays();
    }, [])

    const checkForUnseenGlobalReelays = async () => {
        const globalFeed = await getFeed({ reelayDBUserID, feedSource: 'global', page: 0 });
        if (globalFeed) {
            const lastReelayPostTime = globalFeed[0][0].postedDateTime;
            const lastOnGlobal = await AsyncStorage.getItem('lastOnGlobalFeed');
            dispatch({ type: 'setHasUnseenGlobalReelays', payload: lastOnGlobal ? (lastOnGlobal<lastReelayPostTime) : true});
        }
    }

    const onRefresh = async () => {
        await checkForUnseenGlobalReelays();

        setRefreshing(true);
        const myFollowingLoaded = await getFollowing(reelayDBUserID);
        const myNotifications = await getAllMyNotifications(reelayDBUserID);
        const myStreamingSubscriptions = await getStreamingSubscriptions(reelayDBUserID);

        const reqUserSub = reelayDBUserID;
        const myStacksFollowing = await getFeed({ reqUserSub, feedSource: 'following', page: 0 });
        const myStacksInTheaters = await getFeed({ reqUserSub, feedSource: 'theaters', page: 0 });
        const myStacksOnStreaming = await getFeed({ reqUserSub, feedSource: 'streaming', page: 0 });
        const myStacksAtFestivals = await getFeed({ reqUserSub, feedSource: 'festivals', page: 0 });
        
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

    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            <ScrollContainer refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                {/* <Announcements /> */}
                <TopOfTheWeek navigation={navigation} />
                <FriendsAreWatching navigation={navigation} />
                <OnStreaming navigation={navigation} refreshing={refreshing} setRefreshing={setRefreshing} />
                <InTheaters navigation={navigation} />
                <AtFestivals navigation={navigation} />
                <Spacer height={80} />
            </ScrollContainer>
            <BottomBar />
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
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