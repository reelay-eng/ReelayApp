import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';

import * as Amplitude from 'expo-analytics-amplitude';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

// test it here: https://regex101.com/
const VALID_USERNAME_REGEX = /^([a-zA-z0-9]+(?:[.-_+][a-zA-Z0-9]+)*)$/g; 
// const VALID_USERNAME_REGEX = /^([a-zA-Z0-9.-_+]{3,})$/g;
// general idea is that a username consists of one or more alphanumeric phrases
// optionally separated by . - _ or +

export default SignUpUsernameScreen = ({ navigation, route }) => {

    const { email } = route.params;

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const SignUpContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        width: 100%;
    `
    const CTAButton = styled(Button)`
        align-self: center;
        margin-top: 10px;
        width: 75%;
    `
    const AuthInput = styled(Input)`
        color: white;
        font-family: System;
        font-size: 16px;
        font-weight: 600;
    ` 
    const ReelayPicture = styled(Image)`
        align-self: center;
        justify-content: center;
        margin-top: 20px;
        margin-bottom: 20px;
        height: 192px;
        width: 192px;
    ` 
    const AuthInputContainerStyle = {
        alignSelf: 'center',
        margin: 10,
        paddingLeft: 32,
        paddingRight: 32,
    }
    const AuthInputRightIconStyle = {
        color: 'white',
        name: 'person',
        type: 'ionicon', 
        size: 24,
    }

    const EmailInput = () => {
        
        const [inputUsername, setInputUsername] = useState('');

        const validUsernameLength = inputUsername.length > 2 && inputUsername.length < 26;
        const validUsernameRegex = VALID_USERNAME_REGEX.test(inputUsername);
        const validUsername = validUsernameLength && validUsernameRegex;

        const continueToCreateAccount = async () => {
            if (!validUsername) {
                handleInvalidUsername();
                return;
            }

            navigation.push('SignUpScreen', { 
                email: email,
                username: inputUsername,
            });
            Amplitude.logEventWithPropertiesAsync('signUpSelectedUsername', {
                email: email,
                username: inputUsername,
            })
        }

        const handleInvalidUsername = () => {
            console.log('Username invalid');
            if (!validUsernameLength) {
                showErrorToast('Usernames must be between 3 and 25 characters');
            } else {
                showErrorToast('Usernames should be alphanumeric. Separators .+_- are okay');
            }
        }

        return (
            <InputContainer>
                <AuthInput
                    autoCapitalize='none'
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Pick a username'} 
                    onChangeText={setInputUsername}
                    rightIcon={AuthInputRightIconStyle}
                    value={inputUsername}
                />
                <CTAButton title='Continue' type='solid' 
                    onPress={continueToCreateAccount} 
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
                        height: 56,
                    }} 
                    titleStyle={{
                        fontWeight: 'bold',
                    }}
                />
                <CTAButton title='Login' type='clear' 
                    onPress={() => navigation.push('SignInScreen')}
                    titleStyle={{ 
                        color: ReelayColors.reelayRed,
                        fontWeight: 'bold',
                    }}
                />
            </InputContainer>
        );
    }

    const TopBar = () => {
        const BackButtonContainer = styled(View)`
            position: absolute;
            left: 0px;
            top: 0px;
        `
        const TopBarContainer = styled(View)`
            flex-direction: row;
            justify-content: center;
        `
        return (
            <TopBarContainer>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
            </TopBarContainer>
        );
    }

    return (
        <SignUpContainer>
            <TopBar />
            <ReelayPicture source={REELAY_ICON_SOURCE} />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <EmailInput />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}