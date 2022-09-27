import React, { useContext, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, KeyboardAvoidingView, Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from '../../components/global/Headers';

import { Auth } from 'aws-amplify';
import { checkUsername } from '../../components/utils/ValidUsernameCheck';
import { registerUser, searchUsers } from '../../api/ReelayDBApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerSocialAuthAccount, saveAndRegisterSocialAuthSession } from '../../api/ReelayUserApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { showErrorToast } from '../../components/utils/toasts';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

const ContinuePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 24px;
    height: 48px;
    justify-content: center;
    width: ${width - 16}px;
`
const ContinueText = styled(ReelayText.Overline)`
    color: black;
    font-size: 12px;
`
const ContinueWrapper = styled(View)`
    align-items: center;
    background-color: black;
    bottom: 0px;
    padding-top: 12px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    position: absolute;
    width: 100%;
`
const InputView = styled(View)`
    align-items: center;
    height: 84px;
    width: 100%;
`
const KeyboardDismisser = styled(Pressable)`
    display: flex;
    flex: 1;
`
const UsernameTextInput = styled(TextInput)`
    color: ${props => props.default ? 'gray' : 'white'};
    font-family: Outfit-Bold;
    font-size: 28px;
    font-style: bold;
    letter-spacing: 0.15px;
    line-height: 36px;
    padding: 24px;
`
const UsernameText = styled(ReelayText.H5Bold)`
    color: ${props => props.default ? 'gray' : 'white'};
`
const ProgressDot = styled(View)`
    background-color: ${props => props.completed ? ReelayColors.reelayBlue : 'gray'};
    border-radius: 4px;
    height: 8px;
    margin: 4px;
    width: 8px;
`
const ProgressDotsView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const ScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: ${props => props.topOffset}px;
`

const ProgressDots = () => {
    return (
        <ProgressDotsView>
            <ProgressDot completed={true} />
            <ProgressDot completed={false} />
            <ProgressDot completed={false} />
        </ProgressDotsView>
    );
}

export default ChooseUsernameScreen = ({ navigation, route }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const topOffset = useSafeAreaInsets().top + 16;

    const { authSession, method, email, fullName, googleUserID, appleUserID, password } = route?.params;
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const { setReelayDBUserID } = useContext(AuthContext);

    const inputUsernameRef = useRef('');

    const continueSignUp = async () => {
        setIsCheckingUsername(true);
        const canSignUp = await isUsernameValid();
        if (!canSignUp) {
            setIsCheckingUsername(false);
            return;
        }
        setIsCheckingUsername(false);

        navigation.push('SelectMyStreamingScreen', {
            appleUserID,
            authSession,
            email,
            fullName,
            googleUserID,
            method,
            password,
            username: inputUsernameRef.current,
        });
    }

    const isUsernameValid = async () => {
        const usernameToCheck = inputUsernameRef.current;
        const usernameHasValidForm = checkUsername(usernameToCheck);
        if (!usernameHasValidForm) {
            showErrorToast('Ruh roh! Username has an invalid format. See instructions below');
            return false;
        }
        const partialMatchingUsers = await searchUsers(usernameToCheck);
        if (partialMatchingUsers?.error) {
            return false;
        }

        const usernamesMatch = (userObj) => (userObj.username === usernameToCheck);
        const fullMatchIndex = await partialMatchingUsers.findIndex(usernamesMatch);
        if (fullMatchIndex === -1) {
            return true;
        } else {
            showErrorToast('Ruh roh! That username is already taken');
            return false;
        }
    }

    const UsernameInput = () => {
        const [inputUsername, setInputUsername] = useState(inputUsernameRef.current);

        const changeInputUsername = async (nextInputUsername) => {
            inputUsernameRef.current = nextInputUsername;
            setInputUsername(nextInputUsername);
        }

        return (
            <InputView>
                <UsernameTextInput
                    autoComplete='none'
                    autoCapitalize="none"
                    placeholder={"Enter username"}
                    onChangeText={changeInputUsername}
                    textContentType='username'
                    value={inputUsername}
                />
            </InputView>
        );
    }

    return (
        <KeyboardDismisser onPress={Keyboard.dismiss}>
            <ScreenView>
                <Spacer topOffset={topOffset} />
                <HeaderWithBackButton navigation={navigation} text={'sign up'} />
                <ProgressDots />
                <Spacer topOffset={topOffset + 60} />
                <UsernameInput />
                
                <ContinueWrapper behavior='padding' bottomOffset={bottomOffset}>
                    <ContinuePressable onPress={continueSignUp} disabled={isCheckingUsername}>
                        { !isCheckingUsername && <ContinueText>{'Continue'}</ContinueText> }
                        { isCheckingUsername && <ActivityIndicator /> }
                    </ContinuePressable>
                </ContinueWrapper>
                <View style={{ height: 24 }} />
            </ScreenView>
        </KeyboardDismisser>
    );
}