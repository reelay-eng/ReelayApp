import React, { createRef, useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';

import BackButton from '../../components/utils/BackButton';

import * as Amplitude from 'expo-analytics-amplitude';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

export default SignUpScreen2 = ({ navigation, route }) => {
    const ReelayPicture = styled(Image)`
        align-self: center;
        justify-content: center;
        margin-top: 20px;
        margin-bottom: 20px;
        height: 192px;
        width: 192px;
    ` 
    const SignUpContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        justify-content: flex-start;
    `

    const SIGN_UP_ERROR_MESSAGE = "Couldn't create an account. Try a different username?";

    const { email, username } = route.params;
    const authContext = useContext(AuthContext);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountCreationAttemptCount, setAccountCreationAttemptCount] = useState(0);

    const passwordsMatch = () => (password == confirmPassword);
    const passwordLongEnough = () => (password.length >= 8);

    const showPasswordError = passwordsMatch() && !passwordLongEnough() && password.length > 0;
    const showConfirmPasswordError = !passwordsMatch() && confirmPassword.length >= password.length;
    const createAccountDisabled = !(passwordsMatch() && passwordLongEnough());

    const createAccount = async () => {

        console.log('Attempting account creation');
        try {
            const signUpResult = await Auth.signUp({
                username: inputUsername,
                password: password,
                attributes: {
                    email: email,
                },
            }); 
            authContext.setUsername(inputUsername);
            navigation.push('ConfirmEmailScreen');
            Amplitude.logEventWithPropertiesAsync('signUp', {
                username: inputUsername,
            });
        } catch (error) {
            console.log('Couldn\'t sign up user');
            console.log(error);
            showErrorToast(SIGN_UP_ERROR_MESSAGE);
        }
    }

    const AccountForm = () => {
        const InputContainer = styled(View)`
        `
        const AuthInput = styled(Input)`
            color: white;
            font-family: System;
            font-size: 16px;
            font-weight: 600;
        ` 
        const AuthInputContainerStyle = {
            alignSelf: 'center',
            margin: 16,
            paddingLeft: 32,
            paddingRight: 32,
        }
        const CTAButton = styled(Button)`
            align-self: center;
            margin-top: 10px;
            width: 75%;
        `
        const ErrorMessageStyle = {
            fontFamily: 'System',
            fontSize: 16,
            fontWeight: 400,
            color: ReelayColors.reelayBlue,
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 10,
        }

        return (
            <InputContainer>
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    errorMessage={showPasswordError && "Passwords must be at least 8 characters."}
                    errorProps={ErrorMessageStyle}
                    placeholder={'Enter password'} 
                    onChangeText={(password) => setPassword(password)}
                    rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                    secureTextEntry={true}
                />
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    errorMessage={showConfirmPasswordError && "Passwords don't match!" }
                    errorProps={ErrorMessageStyle}
                    placeholder={'Re-enter password'} 
                    onChangeText={(password) => setConfirmPassword(password)}
                    rightIcon={{type: 'ionicon', name: 'eye-outline'}}
                    secureTextEntry={true}
                />
                <CTAButton title='Create Account' type='solid' 
                    buttonStyle={{ backgroundColor: ReelayColors.reelayRed }}
                    disabled={createAccountDisabled}
                    onPress={createAccount}  />
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
            <KeyboardAvoidingView behavior='position'>
                <TopBar />
                <ReelayPicture source={REELAY_ICON_SOURCE}  />
                <AccountForm />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}