import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger'

import { getFeed } from '../../api/ReelayDBApi';

import HomeHeader from './HomeHeader';

const HomeContainer = styled.SafeAreaView`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const HomeComponent = ({ navigation }) => {
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

const InTheatersContainer = styled.View`
    width: 100%;
    height: 45%
    display: flex;
    flex-direction: column;
    padding-left: 15px;
    padding-top: 15px;
    border: solid 1px red;
`
const InTheatersHeader = styled(ReelayText.H5Bold)`
    color: white;
`
const InTheatersElementRowContainer = styled.ScrollView`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    border: solid 1px yellow;
`

const InTheaters = ({ navigation }) => {

    const { reelayDBUser } = useContext(AuthContext);
    const [theaterStacks, setTheaterStacks] = useState([]); // [[]]
    const [displayPosterReelays, setDisplayPosterReelays] = useState([]);

    useEffect(() => {
        (async () => {
            let nextTheaterStacks = await getFeed({ reqUserSub: reelayDBUser?.sub, feedSource: "theaters", page: 0 });
            setTheaterStacks(nextTheaterStacks);
        })();
    }, [])

    const goToReelay = (index, titleObj) => {
		if (theaterStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialStackPos: index,
            initialFeedSource: 'theaters'
		});

		logAmplitudeEventProd('openTheatersFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};
    
    return (
        <InTheatersContainer>
            <InTheatersHeader>In Theaters Now</InTheatersHeader>
            <InTheatersElementRowContainer horizontal={true}>
                { theaterStacks.map((stack, index) => {
                    return (
                        <InTheatersElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                    )
                })}
            </InTheatersElementRowContainer>
        </InTheatersContainer>
    )
}

const InTheatersPosterContainer = styled.Pressable`
    width: 133px;
    height: 200px;
    border-width: 1px;
    border-color: blue;
    border-radius: 20px;
`

const InTheatersPoster = styled.Image`
    width: 100%;
    height: 100%;
    border-radius: 20px;
`

const InTheatersElement = ({ onPress, stack }) => {
    return (
        <InTheatersPosterContainer onPress={onPress}>
            <InTheatersPoster source={ stack[0].title.posterSource } />
        </InTheatersPosterContainer>
    )
}

const WhatMyFriendsAreWatching = ({ navigation }) => {

}

const OnMyStreamingServices = ({ navigation }) => {
    
}

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;