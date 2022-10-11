import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
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
    height: ${props => props.bottomOffset + 80}px;
    top: ${0}px;
    width: 100%;
`
const ContinueButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.saySkip ? 'white' : ReelayColors.reelayBlue};
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const ContinueButtonOuterView = styled(KeyboardAvoidingView)`
    align-items: center;
    bottom: ${props => props.bottomOffset + 50}px;
    padding-bottom: ${props => props.bottomOffset}px;
    position: absolute;
    width: 100%;
`
const ContinueText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.saySkip ? 'black' : 'white'};
    font-size: 15px;
`
const CreateScreenView = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderView = styled(View)`
    margin-bottom: 16px;
`
const SectionView = styled(View)`
    margin-left: 12px;
    margin-right: 12px;
    margin-top: 16px;
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
        const [numFollowsToSend, setNumFollowsToSend] = useState(followsToSend?.current?.length);
        const saySkip = (numFollowsToSend === 0);

        const onPress = () => {
            navigation.push('CreateClubPart3Screen', { 
                clubVisibility, 
                followsToSend: followsToSend?.current,
            });
        }

        useEffect(() => {
            const numFollowsInterval = setInterval(() => {
                if (numFollowsToSend !== followsToSend?.current?.length) {
                    setNumFollowsToSend(followsToSend?.current?.length);
                }
            }, 200);
            return () => clearInterval(numFollowsInterval);
        }, [numFollowsToSend]);

        return (
            <ContinueButtonOuterView behavior='padding' bottomOffset={bottomOffset}>
                <BottomGradient 
                    bottomOffset={bottomOffset} 
                    colors={["transparent", "#0d0d0d"]} 
                    start={{ x: 0, y: -1}}
                    end={{ x: 0, y: 0 }}
                />
                <ContinueButtonView onPress={onPress} saySkip={saySkip}>
                    <ContinueText saySkip={saySkip}>{(saySkip) ? 'Skip' : 'Continue'}</ContinueText>
                </ContinueButtonView>
            </ContinueButtonOuterView>
        );
    }

    const InviteFollowsPrompt = () => {
        return (
            <SectionView>
                <InviteMyFollowsList clubMembers={[]} followsToSend={followsToSend} />
            </SectionView> 
        );
    }

    const Header = () => {
        return (
            <HeaderView>
                <HeaderWithBackButton navigation={navigation} text={'new chat'} />
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
