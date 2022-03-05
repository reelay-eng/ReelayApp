import React, { useContext } from 'react';
import { View, Text } from 'react-native'
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';

import HomeHeader from './HomeHeader';

const HomeContainer = styled.SafeAreaView`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const HomeComponent = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    console.log(reelayDBUser);
    return (
        <HomeContainer>
            <HomeHeader navigation={navigation} />
            {/* <Announcements /> */}
            <InTheaters navigation={navigation} />
            {/* <WhatMyFriendsAreWatching navigation={navigation} />
            <OnMyStreamingServices navigation={navigation} />
            <FilmFestivalsBadge navigation={navigation} /> */}
        </HomeContainer>
    )
}

const Announcements = ({ navigation }) => {
 // fill once we start using
}

const InTheaters = ({ navigation }) => {
    return (
        <View />
    )
}

const WhatMyFriendsAreWatching = ({ navigation }) => {

}

const OnMyStreamingServices = ({ navigation }) => {
    
}

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;