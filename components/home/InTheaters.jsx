import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { getFeed } from '../../api/ReelayDBApi';

const InTheatersContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
`
const InTheatersHeader = styled(ReelayText.H5Bold)`
    padding-left: 15px;
    padding-top: 15px;
    color: white;
`
const InTheatersElementRowContainer = styled.ScrollView`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 10px;
`

const InTheaters = memo(({ navigation }) => {

    const { reelayDBUser } = useContext(AuthContext);
    const [theaterStacks, setTheaterStacks] = useState([]);

    useEffect(() => {
        (async () => {
            let nextTheaterStacks = await getFeed({ reqUserSub: reelayDBUser?.sub, feedSource: "theaters", page: 0 });
            setTheaterStacks(nextTheaterStacks);
        })();
    }, [])

    const goToReelay = (index, titleObj) => {
		if (theaterStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'theaters',
            isOnFeedTab: false
		});

		logAmplitudeEventProd('openTheatersFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};
    
    return (
        <InTheatersContainer>
            <InTheatersHeader>In Theaters Now</InTheatersHeader>
            
                { theaterStacks.length > 0 && (
                    <InTheatersElementRowContainer horizontal>
                        { theaterStacks.map((stack, index) => {
                            return (
                                <InTheatersElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                            )
                        })}
                    </InTheatersElementRowContainer>
                )}
        </InTheatersContainer>
    )
});

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
    return (
        <InTheatersElementContainer onPress={onPress}>
            <InTheatersPoster source={ stack[0].title.posterSource } />
            <InTheatersReleaseYear>{stack[0].title.releaseYear}</InTheatersReleaseYear>
            <InTheatersTitle>{stack[0].title.display}</InTheatersTitle>
        </InTheatersElementContainer>
    )
}

export default InTheaters;