import React, { useContext, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Text} from 'react-native';
import { Button, Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { showMessageToast, showErrorToast } from '../../components/utils/toasts';
import BackButton from '../../components/utils/BackButton';

import { KeyboardHidingBlackContainer } from './SignInScreen';

import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';

export default ForgotPasswordSubmitScreen = ({ navigation, route }) => {

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const CTAButton = styled(Button)`
        align-self: center;
        margin-top: 10px;
        width: 75%;
        margin-bottom: 10px;
    `
    const AuthInput = styled(Input)`
        color: white;
        font-family: System;
        font-size: 16px;
        font-weight: 600;
    ` 

    const AuthInputContainerStyle = {
        alignSelf: 'center',
        margin: 4,
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

    const NotMatchingText = styled(Text)`
        margin-left: 20px;
        color: white;
        font-size: 20px;
        margin-bottom: 10px;
    `
    
    const { username } = route.params;

    const PasswordInput = () => {
        const [confirmationCode, setConfirmationCode] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmNewPassword, setConfirmNewPassword] = useState('');

        const RESEND_FORGOT_PW_EMAIL_MESSAGE = 'Check your email for another confirmation code'
        const FORGOT_PW_EMAIL_ERROR_MESSAGE = 'Couldn\'t resend forgot password email';
        const FORGOT_PW_SUBMIT_ERROR_MESSAGE = 'Could not reset password. Check or resend confirmation code to try again.';

        const passwordsMatch = () => (newPassword == confirmNewPassword);

        const forgotPasswordSubmit = async () => {
            console.log('Attempting to reset password');

            try {
                const forgotPasswordSubmitResult = await Auth.forgotPasswordSubmit(
                    username,
                    confirmationCode,
                    newPassword
                );    

                console.log('Reset password successfully');
                console.log(forgotPasswordSubmitResult);
                navigation.push('ForgotPasswordAffirmScreen');
            } catch (error) {
                console.log(FORGOT_PW_SUBMIT_ERROR_MESSAGE);
                console.log(error);
                showErrorToast(FORGOT_PW_SUBMIT_ERROR_MESSAGE);
            }
        }

        const resendForgotPasswordEmail = async () => {
            console.log('Attempting to resend forgot password email');

            try {
                const resendForgotPasswordResult = await Auth.forgotPassword(username);
                console.log(resendForgotPasswordResult);
                showMessageToast(RESEND_FORGOT_PW_EMAIL_MESSAGE);    
            } catch (error) {
                console.log(FORGOT_PW_EMAIL_ERROR_MESSAGE);
                console.log(error);
                showErrorToast(FORGOT_PW_EMAIL_ERROR_MESSAGE);
            }
        }


        return (
            <InputContainer>
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Enter verification code'} 
                    onChangeText={setConfirmationCode}
                />
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Enter new password'} 
                    onChangeText={setNewPassword}
                    rightIcon={{type: 'ionicon', name: 'eye-outline', color: 'white'}}
                    secureTextEntry={true}
                />
                <AuthInput 
                    containerStyle={AuthInputContainerStyle}
                    placeholder={'Confirm new password'} 
                    onChangeText={setConfirmNewPassword}
                    rightIcon={{type: 'ionicon', name: 'eye-outline', color: 'white'}}
                    secureTextEntry={true}
                />
                
                <CTAButton title={passwordsMatch() ? 'Reset password' : 'Passwords must match'} type='solid' disabled={!passwordsMatch()}
                    onPress={forgotPasswordSubmit}
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
                        height: 56,
                    }} 
                    titleStyle={{
                        fontWeight: 'bold',
                    }} />

                <CTAButton title="Didn't receive a code? Let's try again." type='clear' 
                    onPress={resendForgotPasswordEmail}
                    titleStyle={{color: '#db1f2e'}} />
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
                <PasswordInput />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );

}