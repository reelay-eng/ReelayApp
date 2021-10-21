import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';

import * as Amplitude from 'expo-analytics-amplitude';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

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
        margin: 16,
        paddingLeft: 32,
        paddingRight: 32,
    }
    const AuthInputRightIconStyle = {
        color: 'white',
        name: 'mail-outline',
        type: 'ionicon', 
    }

    const EmailInput = () => {
        
        const ErrorMessageStyle = {
            fontFamily: 'System',
            fontSize: 16,
            fontWeight: 400,
            color: ReelayColors.reelayBlue,
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 10,
        }

        const [inputUsername, setInputUsername] = useState('');

        const continueToCreateAccount = async () => {
            navigation.push('SignUpScreen', { 
                email: email,
                username: inputUsername,
            });
            Amplitude.logEventWithPropertiesAsync('signUpSelectedUsername', {
                email: email,
                username: inputUsername,
            })
        }

        const validateUsername = () => {
            const validUsernameRegex = /([a-zA-z0-9])+([.-_+][a-zA-Z0-9])*/;
            const validUsernameLength = inputUsername.length > 2 && inputUsername.length < 26;
            return validUsernameLength && validUsernameRegex.test(inputUsername);
        }

        // shouldn't show errors immediately. I want a more elegant way to do this
        const showUsernameError = !validateUsername() && inputUsername.length > 2;

        return (
            <InputContainer>
                <AuthInput
                    autoCapitalize='none'
                    containerStyle={AuthInputContainerStyle}
                    errorMessage={showUsernameError && "Username may be 3-25 characters: letters, numbers, and symbols +._-"}
                    errorProps={ErrorMessageStyle}
                    placeholder={'Pick a username'} 
                    onChangeText={setInputUsername}
                    rightIcon={AuthInputRightIconStyle}
                    value={inputUsername}
                />
                <CTAButton title='Continue' type='solid' 
                    disabled={!validateUsername()}
                    onPress={continueToCreateAccount} 
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
                    }} 
                />
                <CTAButton title='Login' type='clear' 
                    onPress={() => navigation.push('SignInScreen')}
                    titleStyle={{ color: ReelayColors.reelayRed }}
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