import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Pressable, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import * as Amplitude from 'expo-analytics-amplitude';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');
const SIGN_UP_ERROR_MESSAGE = "Couldn't create an account. Try a different username?";

export default SignUpScreen = ({ navigation, route }) => {

    const { email, username } = route.params;

    const AuthInput = styled(Input)`
        color: white;
        font-family: System;
        font-size: 16px;
        font-weight: 600;
    ` 
    const AuthInputContainerStyle = {
        alignSelf: 'center',
        marginBottom: 10,
        width: '80%',
    }

    const CTAButton = styled(Button)`
        align-self: center;
        margin-bottom: 40px;
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

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
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
        width: 100%;
    `

    const PasswordInput = () => {

        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');

        const [hidePassword, setHidePassword] = useState(true);
        const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    
        const passwordsMatch = () => (password == confirmPassword);
        const passwordLongEnough = () => (password.length >= 8);
    
        const showPasswordError = passwordsMatch() && !passwordLongEnough() && password.length > 0;
        const showConfirmPasswordError = !passwordsMatch() && confirmPassword.length >= password.length;
        const createAccountDisabled = !(passwordsMatch() && passwordLongEnough());

        const hideShowPassword = async () => {
            setHidePassword(!hidePassword);
            setHideConfirmPassword(!hideConfirmPassword);
        }
    
        const createAccount = async () => {
            console.log('Attempting account creation');
            try {
                const signUpResult = await Auth.signUp({
                    username: username,
                    password: password,
                    attributes: {
                        email: email,
                    },
                }); 
                navigation.push('ConfirmEmailScreen', { username });
                Amplitude.logEventWithPropertiesAsync('signUp', {
                    email: username,
                    username: username,
                });
            } catch (error) {
                console.log('Couldn\'t sign up user');
                console.log(error);
                showErrorToast(SIGN_UP_ERROR_MESSAGE);
            }
        }

        return (
            <InputContainer>
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    errorMessage={showPasswordError && 
                        "Passwords must be at least 8 characters."
                    }
                    errorProps={ErrorMessageStyle}
                    placeholder={'Enter password'} 
                    onChangeText={setPassword}
                    secureTextEntry={hidePassword}
                    value={password}
                />
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    errorMessage={showConfirmPasswordError && 
                        "Passwords don't match!" 
                    }
                    errorProps={ErrorMessageStyle}

                    placeholder={'Re-enter password'} 
                    onChangeText={setConfirmPassword}
                    secureTextEntry={hideConfirmPassword}
                    value={confirmPassword}
                />
                <CTAButton title='Show Password' type='clear' 
                    onPress={hideShowPassword}
                    titleStyle={{ color: ReelayColors.reelayRed }}
                />
                <CTAButton title='Create Account' type='solid' 
                    disabled={createAccountDisabled}
                    onPress={createAccount} 
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
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
                <PasswordInput />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}