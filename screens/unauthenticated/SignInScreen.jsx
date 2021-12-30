import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, SafeAreaView, Pressable, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { getInputUsername } from '../../components/utils/usernameOrEmail';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { getRegisteredUser } from '../../api/ReelayDBApi';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');

export const KeyboardHidingBlackContainer = ({ children }) => {
    const FullScreenBlackContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        width: 100%;
    `;
    return ( 
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <FullScreenBlackContainer>
                {children}
            </FullScreenBlackContainer>
        </TouchableWithoutFeedback>
    )
};


export default SignInScreen = ({ navigation, route }) => {
    const AltOptionsRowContainer = styled(View)`
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
    `
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
    

    const { 
        setCognitoUser, 
        setReelayDBUser, 
        setUsername, 
        setSignedIn,
    } = useContext(AuthContext);

    const AltOptions = ({ hidePassword, setHidePassword }) => {
        const handleForgotPassword = async () => {
            navigation.push('ForgotPasswordScreen');
        }

        const hideShowPassword = async () => setHidePassword(!hidePassword);
        const hideShowPasswordPrompt = hidePassword ? 'Show Password' : 'Hide Password';

        return (
            <AltOptionsRowContainer>
                <CTAButton title='Forgot Password?' type='clear' 
                    onPress={handleForgotPassword}
                    titleStyle={{ 
                        color: ReelayColors.reelayRed,
                        fontWeight: 'bold',
                    }}
                />
                <CTAButton title={hideShowPasswordPrompt} type='clear' 
                    onPress={hideShowPassword}
                    titleStyle={{ 
                        color: ReelayColors.reelayRed,
                        fontWeight: 'bold',
                    }}
                />
            </AltOptionsRowContainer>
        );
    }

    const UsernameAndPassword = () => {

        const [inputText, setInputText] = useState('');
        const [password, setPassword] = useState('');
        const [hidePassword, setHidePassword] = useState(true);
    
        const signInDisabled = false;    

        const handleBadEmail = async () => {
            showErrorToast('Incorrect account or password');
            logAmplitudeEventProd('signInFailedBadEmail', {
                email: inputText,
            });
        }

        const handleBadPassword = async () => {
            showErrorToast('Incorrect account or password'); 
            logAmplitudeEventProd('signInFailedBadPassword', {
                username: inputText,
            });
        }

        const handleUnconfirmedUser = async () => {
            navigation.push('ConfirmEmailScreen', { username: inputText });
            logAmplitudeEventProd('signInFailedUnconfirmedEmail', {
                username: inputText,
            });
        }

        const handleOtherErrors = async (error) => {
            showErrorToast(
                "Something went wrong. Please reach out to the Reelay team"
            ); 
            logAmplitudeEventProd('signInFailedOtherReason', {
                username: inputText,
                error: error,
            });
        }

        const signInUser = async () => {
            console.log('Attempting user sign in');
            try {
                const username = await getInputUsername(inputText);
                console.log('username: ', username);
                if (!username.length) {
                    // entered an invalid email
                    handleBadEmail();
                    return;
                }

                const cognitoUser = await Auth.signIn(username, password);
                console.log('Received sign in result');
                console.log(cognitoUser);    

                setCognitoUser(cognitoUser);
                setUsername(cognitoUser.username);
                const reelayDBUser = await getRegisteredUser(cognitoUser?.attributes?.sub);
                setReelayDBUser(reelayDBUser);
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
                    handleOtherErrors(error);
                }
            }
        }

        return (
            <InputContainer>
                    <AuthInput 
                        autoCapitalize='none'
                        containerStyle={AuthInputContainerStyle}
                        placeholder={'Enter username or email'} 
                        onChangeText={setInputText}
                        value={inputText}
                    />
                    <AuthInput 
                        containerStyle={AuthInputContainerStyle}
                        placeholder={'Enter password'} 
                        onChangeText={setPassword}
                        secureTextEntry={hidePassword}
                        value={password}
                    />
                    <CTAButton title='Login to Reelay' type='solid' 
                        disabled={signInDisabled}
                        onPress={signInUser} 
                        titleStyle={{
                            fontWeight: 'bold',
                        }}
                        buttonStyle={{ 
                            backgroundColor: ReelayColors.reelayRed,
                            borderRadius: 36,
                            height: 56,
                        }} 
                    />
                    <AltOptions hidePassword={hidePassword} setHidePassword={setHidePassword} />
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
        <KeyboardHidingBlackContainer>
            <TopBar />
            <ReelayPicture source={REELAY_ICON_SOURCE} />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <UsernameAndPassword />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}