import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';

import { Auth } from 'aws-amplify';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

export default ConfirmEmailScreen = ({ navigation, route }) => {

    const { username } = route.params;
    console.log(username);

    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const ScreenContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        width: 100%;
    `
    const CTAButton = styled(Button)`
        align-self: center;
        margin-bottom: 20px;
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
        marginBottom: 40,
        paddingLeft: 32,
        paddingRight: 32,
    }
    const AuthInputRightIconStyle = {
        color: 'white',
        name: 'mail-outline',
        type: 'ionicon', 
    }

    const ConfirmationCodeInput = () => {

        const [confirmationCode, setConfirmationCode] = useState('');
        
        const confirmEmail = async () => {
            console.log('Attempting email confirmation');
            await Auth.confirmSignUp(
                username, 
                confirmationCode
            ).then((result) => {
                console.log('Email confirmed');
                console.log(result);
                navigation.pop();
                navigation.push('SignInScreen');
            }).catch((error) => {
                console.log('Could not confirm email address');
                console.log(error);
                showErrorToast('Could not confirm email address');
            });
        }
    
        const resendConfirmationCode = async () => {
            console.log('Attempting to resend confirmation code');
            try {
                const resendResult = await Auth.resendSignUp(username);
                console.log('Confirmation code resent');
                showMessageToast('Confirmation code resent');
            } catch (error) {
                console.log('Could not resend confirmation code');
                console.log(error);
                showErrorToast('Could not resend confirmation code');
            }

        }

        return (
            <InputContainer>
                <AuthInput
                    autoCapitalize='none'
                    containerStyle={AuthInputContainerStyle}
                    keyboardType='number-pad'
                    placeholder={'Enter your confirmation code'} 
                    onChangeText={setConfirmationCode}
                    rightIcon={AuthInputRightIconStyle}
                    value={confirmationCode}
                />
                <CTAButton title='Confirm' type='solid' 
                    onPress={confirmEmail} 
                    buttonStyle={{ 
                        backgroundColor: ReelayColors.reelayRed,
                        borderRadius: 36,
                    }} 
                />
                <CTAButton title='Resend confirmation code' type='clear' 
                    onPress={resendConfirmationCode} 
                    buttonStyle={{ borderRadius: 36 }} 
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
        <ScreenContainer>
            <TopBar />
            <ReelayPicture source={REELAY_ICON_SOURCE} />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <ConfirmationCodeInput />
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}