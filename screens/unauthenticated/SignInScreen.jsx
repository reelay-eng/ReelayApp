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

export default SignInScreen = ({ navigation, route }) => {

    const { setUser, setUsername, setSignedIn } = useContext(AuthContext);

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

    const UsernameAndPassword = () => {

        const [inputUsername, setInputUsername] = useState('');
        const [password, setPassword] = useState('');
        const [hidePassword, setHidePassword] = useState(true);

        const signInDisabled = false;

        const handleBadPassword = async () => {
            showErrorToast(
                'Couldn\'t sign in. Your username or password may be incorrect'
            ); 
            Amplitude.logEventWithPropertiesAsync('signInFailedBadPassword', {
                username: inputUsername,
            });
        }

        const handleUnconfirmedUser = async () => {
            navigation.push('ConfirmEmailScreen', { username: inputUsername });
            Amplitude.logEventWithPropertiesAsync('signInFailedUnconfirmedEmail', {
                username: inputUsername,
            });
        }

        const handleOtherErrors = async () => {
            showErrorToast(
                "Something went wrong. Please reach out to the Reelay team."
            ); 
            Amplitude.logEventWithPropertiesAsync('signInFailedOtherReason', {
                username: inputUsername,
            });
        }

        const hideShowPassword = async () => setHidePassword(!hidePassword);

        const signInUser = async () => {
            console.log('Attempting user sign in');
            try {
                const user = await Auth.signIn(inputUsername, password);
                console.log('Received sign in result');
                console.log(user);    

                setUser(user);
                setUsername(user.username);
                setSignedIn(true);
                console.log('Signed in user successfully');

            } catch (error) {
                console.log('Received error');
                console.log(error);
                if (error.code === 'UserNotConfirmedException') {
                    handleUnconfirmedUser();
                } else if (error.code === 'NotAuthorizedException') {
                    handleBadPassword();
                } else {
                    handleOtherErrors();
                }
            }
        }

        return (
            <InputContainer>
                <AuthInput 
                    autoCapitalize='none'
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Enter username'} 
                    onChangeText={setInputUsername}
                    value={inputUsername}
                />
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Enter password'} 
                    onChangeText={setPassword}
                    secureTextEntry={hidePassword}
                    value={password}
                />
                <CTAButton title='Show Password' type='clear' 
                    onPress={hideShowPassword}
                    titleStyle={{ color: ReelayColors.reelayRed }}
                />
                <CTAButton title='Login to Reelay' type='solid' 
                    disabled={signInDisabled}
                    onPress={signInUser} 
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
                <UsernameAndPassword />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}