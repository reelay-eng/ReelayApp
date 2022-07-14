import React, { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import ClubPicture from '../global/ClubPicture';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const PressableContainer = styled(Pressable)`
    flex-direction: row;
    margin: 5px;
    margin-left: 20px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    margin-left: 12px;
    margin-right: 20px;
`;
const ClubNameText = styled(ReelayText.H6Emphasized)`
    color: white;
    padding-bottom: 2px;
`
const ClubDescriptionText = styled(ReelayText.CaptionEmphasized)`
    color: #ffffff;
    line-height: 18px;
    opacity: 0.5;
`
const ClubRowArrowView = styled(View)`
    align-items: center;
    flex-direction: row;
    padding: 16px;
`

export default ClubSearchResultItem = ({ navigation, result }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const club = result;

    const advanceToClubActivityScreen = () => {
        navigation.push('ClubActivityScreen', { club });
    }

    return (
        <PressableContainer key={club?.id} onPress={advanceToClubActivityScreen}>
            <ClubPicture club={club} size={64} />
            <TitleLineContainer>
                <ClubNameText>{club?.name}</ClubNameText>
                <ClubDescriptionText numberOfLines={2}>{club?.description}</ClubDescriptionText>
            </TitleLineContainer>
            <ClubRowArrowView>
                <FontAwesomeIcon icon={faChevronRight} color='white' size={18} />
            </ClubRowArrowView>
        </PressableContainer>
    );
};