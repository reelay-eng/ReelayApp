import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import styled from 'styled-components';

import HomeHeader from './HomeHeader';
import InTheaters from './InTheaters';
import FriendsAreWatching from './FriendsAreWatching';
import OnMyStreamingServices from './OnMyStreamingServices';

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
    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            <ScrollContainer>
                {/* <Announcements /> */}
                <InTheaters navigation={navigation} />
                <FriendsAreWatching navigation={navigation} />
                <OnMyStreamingServices navigation={navigation} />
                {/* <FilmFestivalsBadge navigation={navigation} /> */} 
                <Spacer height={80} />
            </ScrollContainer>
        </HomeContainer>
    )
}

const Announcements = ({ navigation }) => {
 // fill once we start using
}

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;