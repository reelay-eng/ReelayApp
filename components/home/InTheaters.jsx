import React, { memo, useContext, useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import SeeMore from '../global/SeeMore';
import { useSelector } from 'react-redux';

const InTheatersContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
`
const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 15px;
    margin-top: 15px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
const InTheatersRowContainer = styled.ScrollView`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
`

const InTheaters = memo(({ navigation }) => {

    const { reelayDBUser } = useContext(AuthContext);
    const myStacksInTheaters = useSelector(state => state.myStacksInTheaters);

    const goToReelay = (index, titleObj) => {
		if (myStacksInTheaters.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'theaters',
            isOnFeedTab: false,
            preloadedStackList: myStacksInTheaters,
		});

		logAmplitudeEventProd('openTheatersFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};
    
    return (
        <InTheatersContainer>
            <HeaderContainer>
                <Icon type='font-awesome' name='ticket' size={24} color='white' />
                <HeaderText>{'In theaters'}</HeaderText>
            </HeaderContainer>
            { myStacksInTheaters.length > 0 && (
                <InTheatersRowContainer horizontal showsHorizontalScrollIndicator={false}>
                    { myStacksInTheaters.map((stack, index) => {
                        return (
                            <InTheatersElement 
                                key={index}
                                index={index} 
                                onPress={() => goToReelay(index, stack[0].title)} 
                                stack={stack} 
                                length={myStacksInTheaters.length}/>
                        )
                    })}
                </InTheatersRowContainer>
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

const InTheatersElement = ({ index, onPress, stack, length }) => {
    const fullTitle = stack[0].title.display;
    const displayTitle = (fullTitle?.length > 26) 
        ? fullTitle.substring(0, 23) + "..."
        : fullTitle;

    if (index === length-1) {
        return (
        <InTheatersElementContainer>
            <SeeMore 
                display='poster'
                height={180} 
                onPress={onPress} 
                reelay={stack[0]} 
                width={117} 
            />
        </InTheatersElementContainer>
        )
    }

    return (
        <InTheatersElementContainer onPress={onPress}>
            <TitlePoster source={ stack[0].title.posterSource } />
            <TitleInfoLine>
                <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
            </TitleInfoLine>
            <TitleText>{displayTitle}</TitleText>
        </InTheatersElementContainer>
    )
}

export default InTheaters;