import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, RefreshControl } from 'react-native'
import styled from 'styled-components';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnStreaming from './OnStreaming';

const HomeContainer = styled.SafeAreaView`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`
const ScrollContainer = styled.ScrollView`
    width: 100%;
    height: auto;
`
const Spacer = styled.View`
    height: ${props => props.height + "px" ?? "50px"};
`

const HomeComponent = ({ navigation }) => {

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    const onRefresh = async () => {
        setRefreshing(true);
        // todo
        setTimeout(() => setRefreshing(false), 2000);
    }

    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            <ScrollContainer refreshControl={refreshControl}>
                {/* <Announcements /> */}
                <FriendsAreWatching navigation={navigation} />
                <InTheaters navigation={navigation} />
                <OnStreaming navigation={navigation} />
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