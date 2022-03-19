import React, { memo, useContext, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import styled from 'styled-components';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnStreaming from './OnStreaming';

import { 
    loadMyFollowing,
    loadMyNotifications,
    loadMyStreamingSubscriptions,
} from '../../api/ReelayUserApi';
import { getFeed } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';

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
    const {
        reelayDBUserID,
        setMyFollowing,
        setMyNotifications,
        setMyStreamingSubscriptions,
        setMyStacksFollowing,
        setMyStacksInTheaters,
        setMyStacksOnStreaming,
    } = useContext(AuthContext);

    const onRefresh = async () => {
        setRefreshing(true);
        const myFollowingLoaded = await loadMyFollowing(reelayDBUserID);
        const myNotifications = await loadMyNotifications(reelayDBUserID);
        const myStreamingSubscriptions = await loadMyStreamingSubscriptions(reelayDBUserID);

        const reqUserSub = reelayDBUserID;
        const myStacksFollowing = await getFeed({ reqUserSub, feedSource: 'following', page: 0 });
        const myStacksInTheaters = await getFeed({ reqUserSub, feedSource: 'theaters', page: 0 });
        const myStacksOnStreaming = await getFeed({ reqUserSub, feedSource: 'streaming', page: 0 });

        setMyFollowing(myFollowingLoaded);
        setMyNotifications(myNotifications);
        setMyStreamingSubscriptions(myStreamingSubscriptions);
        setMyStacksFollowing(myStacksFollowing);
        setMyStacksInTheaters(myStacksInTheaters);
        setMyStacksOnStreaming(myStacksOnStreaming);

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
                {/* <FilmFestivalsBadge navigation={navigation} /> */} 
                <Spacer height={80} />
            </ScrollContainer>
            <BottomBar />
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

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;