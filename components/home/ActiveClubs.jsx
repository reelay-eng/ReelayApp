import React, { Fragment } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import ClubPicture from '../global/ClubPicture';
import { ClubsIconSVG } from '../global/SVGs';

import moment from 'moment';

const ActiveClubsContainer = styled(View)`
    margin-bottom: 10px;
`
const ClubNameText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 6px;
`
const OptionContainer = styled(TouchableOpacity)`
    align-items: center;
    height: 120px;
    margin: 6px;
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
const RowContainer = styled(ScrollView)`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
`

export default ActiveClubs = ({ navigation }) => {
    const myClubs = useSelector(state => state.myClubs);
    const byMostRecent = (club0, club1) => {
        try {
            const lastActivity0 = moment(club0.lastActivityAt);
            const lastActivity1 = moment(club1.lastActivityAt); 
            return lastActivity1.diff(lastActivity0, 'seconds');
        } catch (error) {
            console.log(error);
            return 1;
        }
    }

    const displayClubs = myClubs.sort(byMostRecent);
    
    const renderClubOption = (club) => {
        const advanceToClubActivityScreen = () => navigation.navigate('ClubActivityScreen', { club })
        return (
            <OptionContainer key={club?.id} onPress={advanceToClubActivityScreen}>
                <ClubPicture navigation={navigation} size={100} club={club} />
                <ClubNameText>{club?.name}</ClubNameText>
            </OptionContainer>
        )
    }

    return (
        <ActiveClubsContainer>
            <HeaderContainer>
                <ClubsIconSVG size={24} />
                <HeaderText>{'My clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { displayClubs.map(renderClubOption) }
            </RowContainer>
        </ActiveClubsContainer>
    )
}