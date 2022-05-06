import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import ClubBanner from '../../components/clubs/ClubBanner';
import NoTitlesYetPrompt from '../../components/clubs/NoTitlesYetPrompt';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ActivityScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`

export default ClubActivityScreen = ({ navigation, route }) => {
    const { club } = route.params;
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
        <ActivityScreenContainer>
            { (!club.titles || club.titles.length < 1) &&
                <NoTitlesYetPrompt />
            } 
            <ClubBanner club={club} navigation={navigation} />
            <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
                <AddTitleButtonContainer onPress={() => {}}>
                    <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
                    <AddTitleButtonText>{'Add a title'}</AddTitleButtonText>
                </AddTitleButtonContainer>
            </AddTitleButtonOuterContainer>
        </ActivityScreenContainer>
    );
}