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
    const authContext = useContext(AuthContext);
    // normally we should write this as:
    // const { setUsername } = useContext(AuthContext);
    // but that adds confusion, since input username != authcontext username

    const AuthInput = styled(Input)`
        color: white;
        font-family: System;
        font-size: 16px;
        font-weight: 600;
    ` 
    const AuthInputContainerStyle = {
        alignSelf: 'center',
        marginBottom: 16,
        width: '80%',
        paddingLeft: 32,
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

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const IconPressable = styled(Pressable)`
        align-self: flex-start;
        justify-content: center;
        margin: 10px;
    `
    const PasswordInputRow = styled(View)`
        flex-direction: row;
        justify-content: center;
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
                authContext.setUsername(username);
                navigation.push('ConfirmEmailScreen');
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

        const hideShowPassword = async () => setHidePassword(!hidePassword);
        const hideShowConfirmPassword = async () => setHideConfirmPassword(!hideConfirmPassword)

        const hideShowPasswordIconType = hidePassword ? 'eye-outline' : 'eye-off';
        const hideShowConfirmPasswordIconType = hideConfirmPassword ? 'eye-outline' : 'eye-off';

        return (
            <InputContainer>
                <PasswordInputRow>
                    <AuthInput 
                        containerStyle={AuthInputContainerStyle}
                        errorMessage={showPasswordError && "Passwords must be at least 8 characters."}
                        errorProps={ErrorMessageStyle}
                        placeholder={'Enter password'} 
                        onChangeText={setPassword}
                        secureTextEntry={hidePassword}
                        value={password}
                    />
                    <IconPressable onPress={hideShowPassword}>
                        <Icon type='ionicon' name={hideShowPasswordIconType} color={'white'} size={24} />
                    </IconPressable>
                </PasswordInputRow>
                <PasswordInputRow>
                    <AuthInput 
                        containerStyle={AuthInputContainerStyle}
                        errorMessage={showConfirmPasswordError && "Passwords don't match!" }
                        errorProps={ErrorMessageStyle}
                        placeholder={'Re-enter password'} 
                        onChangeText={setConfirmPassword}
                        secureTextEntry={hideConfirmPassword}
                        value={confirmPassword}
                    />
                    <IconPressable onPress={hideShowConfirmPassword}>
                        <Icon type='ionicon' name={hideShowConfirmPasswordIconType} color={'white'} size={24} />
                    </IconPressable>
                </PasswordInputRow>
                <CTAButton title='Create Account' type='solid' 
                    disabled={createAccountDisabled}
                    onPress={createAccount} 
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
                <PasswordInput />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}