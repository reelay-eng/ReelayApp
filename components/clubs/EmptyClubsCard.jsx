import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const CreateClubPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255,255,255,0.25);
    border-radius: 16px;
    height: 32px;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 12px;
    width: 140px;
`
const CreateClubText = styled(ReelayText.Body2Bold)`
    color: white;
    display: flex;
    text-align: center;
`
const EmptyClubsGradient = styled(LinearGradient)`
    border-radius: 8px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const EmptyClubsView = styled(View)`
    align-items: center;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 24px;
    width: ${width - 32}px;
`
const SectionBody = styled(ReelayText.Body2)`
    color: white;
    display: flex;
    margin-bottom: 12px;
    text-align: center;
`
const SectionHeader = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    text-align: center;
`
const SectionSpacer = styled(View)`
    height: 0px;
`
const SectionView = styled(View)`
    align-items: center;
    padding: 12px;
    padding-left: 30px;
    padding-right: 30px;
    width: 100%;
`
const TopAndBottomSpacer = styled(View)`
    height: 18px;
`

export default EmptyClubsCard = ({ navigation }) => {

    const CreateClubButton = () => {
        const advanceToCreateClubScreen = () => {
            navigation.push('CreateClubScreen');
        }

        return (
            <CreateClubPressable onPress={advanceToCreateClubScreen}>
                <Icon type='ionicon' name='add' color='white' size={20} />
                <CreateClubText>{'Create a Club'}</CreateClubText>
            </CreateClubPressable>
        );
    }

    return (
        <EmptyClubsView>
            <EmptyClubsGradient colors={['#FF4848', '#038AFF']} />
            <TopAndBottomSpacer />
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Clubs can be private or public'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Talk in private with friends, or build communities around genres, shows, etc.'}
                </SectionBody>
            </SectionView>
            <SectionSpacer />
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Invite friends'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Build shared watchlists'}
                </SectionBody>
            </SectionView>
            <SectionView>
                <SectionHeader numberOfLines={3}>
                    {'Or keep it solo'}
                </SectionHeader>
                <SectionBody numberOfLines={3}>
                    {'Use as your personal film diary'}
                </SectionBody>
            </SectionView>
            <CreateClubButton />
            <TopAndBottomSpacer />
        </EmptyClubsView>
    );
}