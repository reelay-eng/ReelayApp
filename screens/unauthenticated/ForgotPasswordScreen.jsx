import React, { useContext, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { showErrorToast } from '../../components/utils/toasts';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';

import { AuthButton, AuthInput, AuthHeaderLeft, AuthHeaderView } from '../../components/utils/AuthComponents';
import BackButton from '../../components/utils/BackButton';
import { KeyboardHidingBlackContainer } from './SignInScreen';
import ReelayColors from '../../constants/ReelayColors';

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

        const authContext = useContext(AuthContext);

        const [username, setUsername] = useState(true);
        const FORGOT_PW_EMAIL_ERROR_MESSAGE = 'Couldn\'t send forgot password email';

        const sendForgotPasswordEmail = async () => {
            console.log('Attempting to send forgot password email');
            Auth.forgotPassword(
                username
            ).then((result) => {
                console.log('Sent forgot password email');
                console.log(result);
                authContext.setUsername(username);
                navigation.push('ForgotPasswordSubmitScreen');
            }).catch((error) => {
                console.log(FORGOT_PW_EMAIL_ERROR_MESSAGE);
                console.log(error);
                showErrorToast(FORGOT_PW_EMAIL_ERROR_MESSAGE);
            });
        }
        
        return (
            <InputContainer>
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    autoCapitalize='none'
                    placeholder={'Enter username'} 
                    onChangeText={setUsername}
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