import React, { memo, useContext, useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';

const InTheatersContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
`
const InTheatersHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
`
const InTheatersElementRowContainer = styled.ScrollView`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
    padding-bottom: 10px;
`

const InTheaters = memo(({ navigation }) => {

    const { reelayDBUser, myStacksInTheaters } = useContext(AuthContext);

    const goToReelay = (index, titleObj) => {
		if (myStacksInTheaters.length === 0) return;
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
            <InTheatersHeader>{'In theaters'}</InTheatersHeader>
                { myStacksInTheaters.length > 0 && (
                    <InTheatersElementRowContainer horizontal>
                        { myStacksInTheaters.map((stack, index) => {
                            return (
                                <InTheatersElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                            )
                        })}
                    </InTheatersElementRowContainer>
                )}
        </InTheatersContainer>
    )
});

const InTheatersElementContainer = styled(Pressable)`
    margin-right: 16px;
    display: flex;
    width: 120px;
`
const ReelayCount = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`
const TitlePoster = styled(Image)`
    width: 120px;
    height: 180px;
    border-radius: 8px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    font-size: 16px;
    margin-top: 10px;
    color: white;
    opacity: 1;
`
const TitleYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`

const InTheatersElement = ({ onPress, stack }) => {
    return (
        <InTheatersElementContainer onPress={onPress}>
            <TitlePoster source={ stack[0].title.posterSource } />
            <TitleInfoLine>
                <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
            </TitleInfoLine>
            <TitleText>{stack[0].title.display}</TitleText>
        </InTheatersElementContainer>
    )
}

export default InTheaters;