import React, { Fragment } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import ClubPicture from '../global/ClubPicture';
import { ClubsIconSVG } from '../global/SVGs';

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
                <HeaderText>{'Active clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { myClubs.map(renderClubOption) }
            </RowContainer>
        </ActiveClubsContainer>
    )
}