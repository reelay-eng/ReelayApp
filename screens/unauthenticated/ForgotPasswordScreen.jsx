import React, { useContext, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { showErrorToast } from '../../components/utils/toasts';
import styled from 'styled-components/native';

import BackButton from '../../components/utils/BackButton';
import { KeyboardHidingBlackContainer } from './SignInScreen';
import ReelayColors from '../../constants/ReelayColors';

import { getInputUsername } from '../../components/utils/usernameOrEmail';

export default ForgotPasswordScreen = ({ navigation }) => {

    const InputContainer = styled(View)`
        margin-bottom: 60px;
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

    const AuthInputContainerStyle = {
        alignSelf: 'center',
        margin: 16,
        paddingLeft: 32,
        paddingRight: 32,
    }

    const TitleContainer = styled(View)`
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 60px;
        margin-bottom: 75px;
    `
    const TitleText = styled(Text)`
        font-size: 32px;
        color: white;
    `

    const EmailInput = () => {
        const [inputText, setInputText] = useState(true);

        const handleBadEmail = async () => {
            showErrorToast('Could not find email address. Retry?');
            Amplitude.logEventWithPropertiesAsync('signInFailedBadEmail', {
                email: inputText,
            });
        }

        const sendForgotPasswordEmail = async () => {
            const username = await getInputUsername(inputText);
            if (!username.length) {
                handleBadEmail();
                return;
            }

            try {
                const forgotPasswordResult = await Auth.forgotPassword(username);
                navigation.push('ForgotPasswordSubmitScreen', {
                    username: username
                });
                console.log(forgotPasswordResult);
            } catch (error) {
                showErrorToast('Could not send forgot password email. Retry?');
            }
        }
        
        return (
            <InputContainer>
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    autoCapitalize='none'
                    placeholder={'Enter username or email'} 
                    onChangeText={setInputText}
                    rightIcon={{type: 'ionicon', name: 'mail-outline', color: 'white'}}
                />
                <CTAButton title='Send me a reset link' type='solid' onPress={sendForgotPasswordEmail}
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
                        height: 56,
                    }} 
                    titleStyle={{
                        fontWeight: 'bold',
                    }} />
            </InputContainer>
        )
    }

    return (
        <KeyboardHidingBlackContainer>
            <BackButton navigation={navigation} />
            <TitleContainer>
                <TitleText>Forgot Password</TitleText>
            </TitleContainer>
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <EmailInput />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}