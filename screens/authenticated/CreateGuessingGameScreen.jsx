import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    Dimensions,
    Keyboard, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { HeaderWithBackButton } from '../../components/global/Headers';
import { GamesIconSVG } from '../../components/global/SVGs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ContinueButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.disabled ? 'white' : ReelayColors.reelayBlue};
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const ContinueText = styled(ReelayText.Overline)`
    color: ${props => props.disabled ? 'gray' : 'white'};;
    font-size: 12px;
`
const CreateScreenView = styled(View)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    margin-bottom: 16px;
`
const TitleInputField = styled(TextInput)`
    background-color: #1a1a1a;
    border-radius: 16px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 18px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 16px;
    padding-left: 20px;
    padding-right: 20px;
`
const PromptText = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    flex: 1;
    font-size: 24px;
    line-height: 32px;
`
const PromptView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 40px;
    margin-bottom: 12px;
`
const SectionView = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
`
const SectionViewBottom = styled(SectionView)`
    align-items: center;
    bottom: ${props => props.bottomOffset}px;
`
const GAME_TITLE_MIN_LENGTH = 10;
const GAME_TITLE_MAX_LENGTH = 140;

export default CreateGuessingGameScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;
    const club = route?.params?.club ?? null;

    const dispatch = useDispatch();
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef('');

    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    const ContinueButton = () => {
        const advanceToSelectCorrectGuessScreen = () => {
            navigation.push('SelectCorrectGuessScreen', {
                gameTitle: titleTextRef.current
            })
        }
        return (
            <ContinueButtonPressable onPress={advanceToSelectCorrectGuessScreen}>
                <ContinueText>{'Continue'}</ContinueText>
            </ContinueButtonPressable>
        );
    }

    const Header = () => {
        const headerText = (club) ? club?.name : 'back';
        return (
            <HeaderView topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text={headerText} />
            </HeaderView>
        );
    }

    const TitleInput = () => {
        const changeTitleText = (text) => {
            titleTextRef.current = text;
        }    
        return (
            <SectionView>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={GAME_TITLE_MAX_LENGTH}
                        multiline
                        defaultValue={titleTextRef.current}
                        placeholder={"What terrible netflix movie was like..."}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onSubmitEditing={Keyboard.dismiss}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionView> 
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const CreatePrompt = () => {
        return (
            <PromptView>
                {/* <GamesIconSVG /> */}
                <PromptText>{'Write a prompt for your guessing game'}</PromptText>
            </PromptView> 
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <CreateScreenView>
                <View style={{ display: 'flex' }}>
                    <Header />
                    <CreatePrompt />
                    <TitleInput />
                </View>
                <SectionViewBottom bottomOffset={bottomOffset}>
                    <ContinueButton />
                </SectionViewBottom>
            </CreateScreenView>
        </TouchableWithoutFeedback>
    );
};