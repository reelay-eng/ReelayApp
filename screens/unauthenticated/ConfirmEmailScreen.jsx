import React, { useContext, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, SafeAreaView, View } from 'react-native';
import { Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';

import { Auth } from 'aws-amplify';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { HeaderWithBackButton } from '../../components/global/Headers';

const AuthInput = styled(Input)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
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

const BackButtonContainer = styled(View)`
    margin-left: 20px;
    margin-top: 20px;
`
const CTAButtonContainer = styled(View)`
    margin-bottom: 16px;
    width: 95%;
    height: 56px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin-top: 40px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
    text-align: center;
`
const InputContainer = styled(View)`
    align-items: center;
    margin-bottom: 60px;
`
const LoadingContainer = styled(View)`
    align-items: center;
    margin-top: 40px;
    justify-content: center;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: ${ReelayColors.reelayBlack};
    height: 100%;
    width: 100%;
`
const TopBarContainer = styled(View)`
    flex-direction: row;
    justify-content: flex-start;
`

export default ConfirmEmailScreen = ({ navigation, route }) => {
    const { username, email, password } = route.params;
    const { setCognitoUser } = useContext(AuthContext);
    const [confirming, setConfirming] = useState(false);
    const dispatch = useDispatch();

    const ConfirmationCodeInput = () => {
        const [confirmationCode, setConfirmationCode] = useState('');
        
        const confirmEmail = async () => {
            setConfirming(true);
            try {
                console.log('Attempting email confirmation');
                const signUpResult = await Auth.confirmSignUp(username, confirmationCode);
                const newCognitoUser = await Auth.signIn(username, password);
                const cognitoSession = await Auth.currentSession();
                dispatch({ type: 'setAuthSessionFromCognito', payload: cognitoSession });
                setCognitoUser(newCognitoUser);
            } catch (error) {
                setConfirming(false);
                console.log(error);
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
						text="Complete signup"
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

    const Header = () => {
        const message = (confirming) 
            ? `Just a moment` 
            : `We've sent a confirmation code to ${email}`;
        return (
            <HeaderContainer>
                <HeaderText>{message}</HeaderText>
            </HeaderContainer>
        );
    }

    const TopBar = () => {
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
            <Header />
            { !confirming && (
                <KeyboardAvoidingView behavior='padding' style={{flex: 1, justifyContent: 'center'}}>
                    <ConfirmationCodeInput />
                </KeyboardAvoidingView>    
            )}
            { confirming && (
                <LoadingContainer>
                    <ActivityIndicator /> 
                </LoadingContainer>
            )}
        </ScreenContainer>
    );
}