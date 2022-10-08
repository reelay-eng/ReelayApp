import React, { useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { HeaderWithBackButton } from '../../components/global/Headers';
import InviteMyFollowsList from '../../components/clubs/InviteMyFollowsList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: ${props => props.bottomOffset + 40}px;
    width: 100%;
`
const ContinueButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const ContinueButtonOuterView = styled(View)`
    align-items: center;
    bottom: 0px;
    padding-bottom: ${props => props.bottomOffset}px;
    position: absolute;
    width: 100%;
`
const ContinueText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 15px;
`
const CreateScreenView = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 28px;
    line-height: 36px;
    padding: 12px;
`
const HeaderView = styled(View)`
    margin-bottom: 16px;
`
const SectionView = styled(View)`
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 16px;
`
const Spacer = styled(View)`
    height: 24px;
`

export default CreateClubPart2Screen = ({ navigation, route }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const clubVisibility = route?.params?.clubVisibility;
    const dispatch = useDispatch();
    const followsToSend = useRef([]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const ContinueButton = () => {
        const onPress = () => {
            navigation.push('CreateClubPart2Screen', { 
                clubVisibility, 
                followsToSend: followsToSend?.current,
            });
        }

        return (
            <ContinueButtonOuterView bottomOffset={bottomOffset}>
                <BottomGradient bottomOffset={bottomOffset} colors={["transparent", "#0d0d0d"]} />
                <ContinueButtonView onPress={onPress}>
                    <ContinueText>{'Continue'}</ContinueText>
                </ContinueButtonView>
            </ContinueButtonOuterView>
        );
    }

    const InviteFollowsPrompt = () => {
        return (
            <SectionView>
                <HeaderText>{'Invite friends'}</HeaderText>
                <InviteMyFollowsList clubMembers={[]} followsToSend={followsToSend} />
            </SectionView> 
        );
    }

    const Header = () => {
        return (
            <HeaderView>
                <HeaderWithBackButton navigation={navigation} text={'start a new chat'} />
            </HeaderView>
        );
    }

    return (
        <CreateScreenView>
            <View>
                <Header />
                <InviteFollowsPrompt />
            </View>
            <ContinueButton />
        </CreateScreenView>
    );
};
