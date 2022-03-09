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
    height: auto;
    display: flex;
    flex-direction: column;
    padding-left: 15px;
    padding-top: 15px;
`
const InTheatersHeader = styled(ReelayText.H5Bold)`
    color: white;
`
const InTheatersElementRowContainer = styled.ScrollView`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 10px;
`

const InTheaters = ({ navigation }) => {

    const { reelayDBUser } = useContext(AuthContext);
    const [theaterStacks, setTheaterStacks] = useState([]);

    useEffect(() => {
        (async () => {
            let nextTheaterStacks = await getFeed({ reqUserSub: reelayDBUser?.sub, feedSource: "theaters", page: 0 });
            console.log("Next Theater Stacks Length:", nextTheaterStacks.length);
            setTheaterStacks(nextTheaterStacks);
        })();
    }, [])

    const goToReelay = (index, titleObj) => {
		if (theaterStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
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
                { theaterStacks.length > 0 && theaterStacks.map((stack, index) => {
                    return (
                        <InTheatersElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                    )
                })}
            </InTheatersElementRowContainer>
        </InTheatersContainer>
    )
}

const InTheatersElementContainer = styled.Pressable`
    margin-right: 16px;
    display: flex;
    width: 133px;
`

const InTheatersPoster = styled.Image`
    width: 133px;
    height: 200px;
    border-radius: 8px;
`

const InTheatersReleaseYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`

const InTheatersTitle = styled(ReelayText.H6)`
    margin-top: 10px;
    color: white;
    opacity: 1;
`

const InTheatersElement = ({ onPress, stack }) => {
    console.log(stack[0].title);
    return (
        <InTheatersElementContainer onPress={onPress}>
            <InTheatersPoster source={ stack[0].title.posterSource } />
            <InTheatersReleaseYear>{stack[0].title.releaseYear}</InTheatersReleaseYear>
            <InTheatersTitle>{stack[0].title.display}</InTheatersTitle>
        </InTheatersElementContainer>
    )
}

const WhatMyFriendsAreWatching = ({ navigation }) => {

}

const OnMyStreamingServices = ({ navigation }) => {
    
}

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;