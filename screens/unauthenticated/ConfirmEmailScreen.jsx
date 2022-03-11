import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native';
import { Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';

import { Auth } from 'aws-amplify';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { registerUser } from '../../api/ReelayDBApi';

export default ConfirmEmailScreen = ({ navigation, route }) => {
    const { username, password } = route.params;
    const { setCognitoUser } = useContext(AuthContext);

    const InputContainer = styled(View)`
        margin-bottom: 60px;
        flex-direction: column;
        align-items: center;
    `
    const ScreenContainer = styled(SafeAreaView)`
        background-color: ${ReelayColors.reelayBlack};
        height: 100%;
        width: 100%;
    `
    const CTAButtonContainer = styled(View)`
		margin-bottom: 40px;
		width: 95%;
		height: 56px;
	`;
    const AuthInput = styled(Input)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
		margin-left: 8px;
	`; 
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
            try {
                console.log('Attempting email confirmation');
                const signUpResult = await Auth.confirmSignUp(username, confirmationCode);
                console.log('SIGN UP RESULT: ', signUpResult);    

                const newCognitoUser = await Auth.signIn(username, password);
                const dbResult = await registerUser({
                    email: newCognitoUser?.attributes?.email,
                    username: newCognitoUser?.username,
                    sub: newCognitoUser?.attributes?.sub,
                });
                console.log('DB SIGN UP RESULT: ', dbResult);
                setCognitoUser(newCognitoUser);
            } catch (error) {
                console.log('Could not confirm email address');
                showErrorToast('Could not confirm email address');
                return { error };
            }
        }
    
        const resendConfirmationCode = async () => {
            console.log('Attempting to resend confirmation code');
            try {
                const resendResult = await Auth.resendSignUp(username);
                console.log('Confirmation code resent: ', resendResult);
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
					autoCapitalize="none"
					containerStyle={AuthInputContainerStyle}
					keyboardType="number-pad"
					placeholder={"Enter your confirmation code"}
					onChangeText={setConfirmationCode}
					rightIcon={AuthInputRightIconStyle}
					value={confirmationCode}
				/>
				<CTAButtonContainer>
					<Button
						text="Confirm your email"
						onPress={confirmEmail}
						backgroundColor={ReelayColors.reelayBlue}
						fontColor="white"
						borderRadius="26px"
					/>
				</CTAButtonContainer>
				<CTAButtonContainer>
					<Button
						text="Resend confirmation code"
						onPress={resendConfirmationCode}
                        backgroundColor="transparent"
                        border={`solid 1px ${ReelayColors.reelayBlue}`}
                        pre
                        fontColor={ReelayColors.reelayBlue}
						borderRadius="26px"
					/>
				</CTAButtonContainer>
			</InputContainer>
		);
    }

    const TopBar = () => {
        const BackButtonContainer = styled(View)`
            margin-left: 20px;
            margin-top: 20px;
        `
        const TopBarContainer = styled(View)`
            flex-direction: row;
            justify-content: flex-start;
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
            <KeyboardAvoidingView behavior='padding' style={{flex: 1, justifyContent: 'center'}}>
                <ConfirmationCodeInput />
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}