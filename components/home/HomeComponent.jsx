import React, { memo, useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import styled from 'styled-components';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnStreaming from './OnStreaming';
import AtFestivals from './AtFestivals';

import { 
    loadMyFollowing,
    loadMyNotifications,
    loadMyStreamingSubscriptions,
} from '../../api/ReelayUserApi';
import { getFeed } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { useDispatch } from 'react-redux';

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
    const { justShowMeSignupVisible } = useContext(FeedContext);

    const onRefresh = async () => {
        setRefreshing(true);
        const myFollowingLoaded = await loadMyFollowing(reelayDBUserID);
        const myNotifications = await loadMyNotifications(reelayDBUserID);
        const myStreamingSubscriptions = await loadMyStreamingSubscriptions(reelayDBUserID);

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
            <ScrollContainer refreshControl={refreshControl}>
                {/* <Announcements /> */}
                <FriendsAreWatching navigation={navigation} />
                <InTheaters navigation={navigation} />
                <OnStreaming navigation={navigation} onRefresh={onRefresh} />
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