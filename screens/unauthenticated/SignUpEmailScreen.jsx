import React, { createRef, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { validate } from 'validate.js';
import constraints from '../../components/utils/EmailValidationConstraints';

import { showErrorToast } from '../../components/utils/toasts';
import * as Amplitude from 'expo-analytics-amplitude';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

export default SignUpEmailScreen = ({ navigation }) => {

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const SignUpContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        justify-content: center;
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

        const [email, setEmail] = useState('');
        const continueToSignUp = async () => {
            // validate result is undef if there are no errors
            const errors = validate({ emailAddress: email }, constraints);
            if (!errors) {
                navigation.push('SignUpUsernameScreen', { email: email });
                Amplitude.logEventWithPropertiesAsync('signUpStarted', {
                    email: email,
                });
            } else {
                if (errors.emailAddress && errors.emailAddress[0]) {
                    showErrorToast(errors.emailAddress[0], 'top');
                }
            }
        }    

        return (
            <InputContainer>
                <AuthInput
                    autoCapitalize='none'
                    autoComplete='email'
                    containerStyle={AuthInputContainerStyle}
                    keyboardType='email-address'
                    placeholder={'Email'} 
                    onChangeText={setEmail}
                    rightIcon={AuthInputRightIconStyle}
                    value={email}
                />
                <CTAButton title='Join Reelay' type='solid' 
                    onPress={continueToSignUp} 
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
                    onPress={() => navigation.push('SignInScreen', { username: '' })}
                    titleStyle={{ 
                        color: ReelayColors.reelayRed,
                        fontWeight: 'bold',
                    }}
                />
            </InputContainer>
        );
    }

    return (
        <SignUpContainer>
            <ReelayPicture source={REELAY_ICON_SOURCE} />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <EmailInput />
            </KeyboardAvoidingView>
        </SignUpContainer>
    );
}