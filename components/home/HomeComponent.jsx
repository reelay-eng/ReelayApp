import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';

import { getReelaysByVenue, getStacksByVenue } from '../../api/ReelayDBApi';

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
const InTheatersPosterRowContainer = styled.ScrollView`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    border: solid 1px yellow;
`

const InTheaters = ({ navigation }) => {

    const [theaterStacks, setTheaterStacks] = useState([[]]); // [[]]
    const [displayPosterReelays, setDisplayPosterReelays] = useState([]);

    useEffect(() => {
        (async () => {
            const nextTheaterStacks = await getStacksByVenue(['theaters']);
            // const flattenedPosterReelays = nextTheaterStacks.map(stack => stack[0]);
            // const cleanedPosterReelays = flattenedPosterReelays.map(reelay => {
            //     delete reelay.comments; 
            //     delete reelay.likes; 
            //     return reelay;
            // })
            setTheaterStacks(nextTheaterStacks);
            // setDisplayPosterReelays(cleanedPosterReelays);
        })();
    }, [setTheaterStacks])

    // const goToReelay = (index) => {
	// 	if (topReelays.length === 0) return;
	// 	navigation.push("TitleFeedScreen", {
	// 		initialStackPos: index,
	// 		fixedStackList: [topReelays],
	// 	});
	// 	logAmplitudeEventProd('openTitleFeed', {
	// 		username: cognitoUser?.username,
	// 		title: titleObj?.title?.display,
	// 		source: 'titlePage',
	// 		});
	// };
    
    return (
        <InTheatersContainer>
            <InTheatersHeader>In Theaters Now</InTheatersHeader>
            <InTheatersPosterRowContainer horizontal={true}>
                { theaterStacks.map((stack, index) => {
                    return (
                        <InTheatersPoster key={`feedIndex${index}`} /**data={stack} *//>
                    )
                })}
            </InTheatersPosterRowContainer>
        </InTheatersContainer>
    )
}

const InTheatersPoster = styled.Pressable`
    width: 45%;
    height: 80%;
    border-width: 1px;
    border-color: blue;
    border-radius: 20px;
`

// const InTheatersPoster = ({ navigation }) => {

// }

const WhatMyFriendsAreWatching = ({ navigation }) => {

}

const OnMyStreamingServices = ({ navigation }) => {
    
}

const FilmFestivalsBadge = ({ navigation }) => {

}

export default HomeComponent;