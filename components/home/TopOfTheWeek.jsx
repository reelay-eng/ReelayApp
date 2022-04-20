import React, { useContext, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../global/Text';
import { VenueIcon } from '../utils/VenueIcon';
import ReelayThumbnail from '../global/ReelayThumbnail';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const IN_MARGIN_WIDTH = width - 30;
const MAJOR_REELAY_WIDTH = IN_MARGIN_WIDTH * 0.65;
const MAJOR_REELAY_HEIGHT = MAJOR_REELAY_WIDTH * 1.5;

const MINOR_REELAY_HEIGHT = (MAJOR_REELAY_HEIGHT / 2) - 5;
const MINOR_REELAY_WIDTH = MINOR_REELAY_HEIGHT / 1.5;

const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding: 15px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 15px;
    margin-top: 15px;
`
const TopOfTheWeekContainer = styled(View)`
    width: 100%;
    display: flex;
    margin-bottom: 10px;
`
const MajorReelayElementContainer = styled(View)`
    height: ${MAJOR_REELAY_HEIGHT}px;
    width: ${MAJOR_REELAY_WIDTH}px;
    margin-right: 10px;
`
const MinorReelayElementContainer = styled(View)`
    height: ${MINOR_REELAY_HEIGHT}px;
    width: ${MINOR_REELAY_WIDTH}px;
`
const MinorReelayGroupContainer = styled(View)`
    justify-content: space-between;
    height: ${MAJOR_REELAY_HEIGHT}px;  
`
const ThreeReelaysContainer = styled(View)`
    flex-direction: row;
    margin-left: 15px;
`

const ThreeReelays = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const topOfTheWeek = useSelector(state => state.topOfTheWeek);
    const topOfTheWeekStacks = topOfTheWeek.map(reelay => [reelay]);

    const goToReelay = (index) => {
		if (!topOfTheWeek?.length) return;

		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'trending',
            isOnFeedTab: false,
            preloadedStackList: topOfTheWeekStacks,
		});

		logAmplitudeEventProd('openTopOfTheWeek', {
			username: reelayDBUser?.username,
            title: topOfTheWeek[index].title?.display
		});
	};
    
    return (
        <ThreeReelaysContainer>
            <MajorReelayElementContainer>
                <ReelayThumbnail 
                    height={MAJOR_REELAY_HEIGHT} 
                    margin={0}
                    onPress={() => goToReelay(0)} 
                    reelay={topOfTheWeek[0]} 
                    width={MAJOR_REELAY_WIDTH} 
                />
            </MajorReelayElementContainer>
            <MinorReelayGroupContainer>
                <MinorReelayElementContainer>
                    <ReelayThumbnail 
                        height={MINOR_REELAY_HEIGHT} 
                        margin={0}
                        onPress={() => goToReelay(1)} 
                        reelay={topOfTheWeek[1]} 
                        width={MINOR_REELAY_WIDTH} 
                    />
                </MinorReelayElementContainer>
                <MinorReelayElementContainer>
                    <ReelayThumbnail 
                        height={MINOR_REELAY_HEIGHT} 
                        margin={0}
                        onPress={() => goToReelay(2)} 
                        reelay={topOfTheWeek[2]} 
                        width={MINOR_REELAY_WIDTH} 
                    />
                </MinorReelayElementContainer>
            </MinorReelayGroupContainer>
        </ThreeReelaysContainer>
    );
}

export default TopOfTheWeek = ({ navigation }) => {
    return (
        <TopOfTheWeekContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <Icon type='ionicon' name='ribbon' size={24} color='white' />
                    <HeaderText>{'Top of the week'}</HeaderText>
                </HeaderContainerLeft>
            </HeaderContainer>
            <ThreeReelays navigation={navigation} />
        </TopOfTheWeekContainer>
    )
}