import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import ProfilePicture from '../global/ProfilePicture';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import ClubPicture from '../global/ClubPicture';
import { ClubsIconSVG } from '../global/SVGs';

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

export default MyClubsSelector = ({ navigation }) => {
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
        <Fragment>
            <HeaderContainer>
                {/* <FontAwesomeIcon icon={faUserPlus} color='white' size={24} /> */}
                <ClubsIconSVG size={24} />
                <HeaderText>{'My Clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { myClubs.map(renderClubOption) }
            </RowContainer>
        </Fragment>
    )
}