import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, SafeAreaView, Pressable, View, ActivityIndicator } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { getInputUsername } from '../../components/utils/usernameOrEmail';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import SocialLoginBar from '../../components/auth/SocialLoginBar';

const AuthInput = styled(Input)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
`
const AuthInputContainerStyle = {
    marginBottom: -5,
    width: "100%",
};

const AuthInputUsernameIconStyle = {
    color: "white",
    name: "person-outline",
    type: "ionicon",
};

const AuthInputWarningIconStyle = {
    color: ReelayColors.reelayRed,
    name: "warning",
    type: "ionicon",
};

const AlignmentContainer = styled(View)`
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const BottomButtonsContainer = styled(View)`
    width: 100%;
    margin-bottom: 24px;
    flex-direction: column;
    align-items: center;
`
const ErrorContainer = styled(View)`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
const ErrorText = styled(ReelayText.H6Emphasized)`
    color: ${ReelayColors.reelayRed};
    text-align: center;
`
const ForgotPasswordContainer = styled(View)`
    flex-direction: row;
    align-items: center;
    margin-left: 10px;
    width: 100%;
`
const InputContainer = styled(View)`
    margin-bottom: 30px;
    width: 90%;
    display: flex;
    flex-direction: column;
`
const SignInButtonContainer = styled(View)`
    width: 90%;
    height: 56px;
    margin: 20px;
`


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
    const [signingIn, setSigningIn] = useState(false);
    const { setCognitoUser, setSignedIn } = useContext(AuthContext);
    
    const ForgotPassword = () => {
		const ForgotPasswordText = styled(ReelayText.Subtitle1)`
			color: ${ReelayColors.reelayBlue};
            opacity: ${props => props.pressed ? 0.7 : 1};
		`;
        const handleForgotPassword = async () => {
            navigation.push('ForgotPasswordScreen');
        }

        return (
			<ForgotPasswordContainer>
				<Pressable onPress={handleForgotPassword}>
					{({ pressed }) => <ForgotPasswordText pressed={pressed}>Forgot Password?</ForgotPasswordText>}
				</Pressable>
			</ForgotPasswordContainer>
		);
    }

    const UsernameAndPassword = () => {
        const [inputText, setInputText] = useState('');
        const [badEmail, setBadEmail] = useState(false);
        const [password, setPassword] = useState('');
        const [badPassword, setBadPassword] = useState(false);
        const [hidePassword, setHidePassword] = useState(true);
        const [otherError, setOtherError] = useState(false);
            
        const changeInputText = (text) => {
            setInputText(text);
            if (badEmail) setBadEmail(false);
        }

        const handleBadEmail = async () => {
            setBadEmail(true);
            setSigningIn(false);
            logAmplitudeEventProd('signInFailedBadEmail', {
                email: inputText,
            });
        }

        const handleBadPassword = async () => {
            setBadPassword(true);
            setSigningIn(false);
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
            setOtherError(true);
            setSigningIn(false);
            logAmplitudeEventProd('signInFailedOtherReason', {
                username: inputText,
                error: error,
            });
        }

        const signInWithUsernameAndPassword = async () => {
            console.log('Attempting user sign in');
            try {
                setSigningIn(true);
                if (otherError) setOtherError(false);
                const username = await getInputUsername(inputText);
                if (!username.length) {
                    // entered an invalid email
                    handleBadEmail();
                    return;
                }
                else if (!password.length) {
                    // entered an invalid password
                    handleBadPassword();
                    return;
                }

                const cognitoUser = await Auth.signIn(username, password);
                console.log('Received sign in result: ', cognitoUser);
                setCognitoUser(cognitoUser);
                console.log('Signed in user successfully');
                setSignedIn(true);
                logAmplitudeEventProd('signInSuccess', {
                    username: username,
                    inputText: inputText,
                    Device: Platform.OS,
                });
            } catch (error) {
                console.log('Received error');
                console.log(error);
 
                if (error.code === 'UserNotConfirmedException') {
                    handleUnconfirmedUser();
                } else if (error.code === 'NotAuthorizedException') {
                    handleBadPassword();
                } else if (error.code === 'UserNotFoundException') {
                    handleBadEmail();
                } else {
                    handleOtherErrors(error);
                }
            }
        }

        const PasswordIconComponent = () => {
			if (hidePassword)
				return (
					<Pressable onPress={() => setHidePassword(!hidePassword)}>
						<Icon type="ionicon" name="eye-off-outline" color="white" />
					</Pressable>
				);
			else
				return (
					<Pressable onPress={() => setHidePassword(!hidePassword)}>
						<Icon type="ionicon" name="eye-outline" color="white" />
					</Pressable>
				);
        };

        return (
			<AlignmentContainer>
				<InputContainer>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle}
						leftIcon={AuthInputUsernameIconStyle}
						placeholder={"Enter username or email"}
						errorMessage={badEmail && "Incorrect email"}
						onChangeText={changeInputText}
						rightIcon={badEmail ? AuthInputWarningIconStyle : null}
                        textContentType='emailAddress'
						value={inputText}
					/>
					<AuthInput
						containerStyle={AuthInputContainerStyle}
						placeholder={"Enter password"}
						errorMessage={badPassword && "Incorrect password"}
						leftIcon={PasswordIconComponent}
						onChangeText={setPassword}
						secureTextEntry={hidePassword}
						rightIcon={badPassword ? AuthInputWarningIconStyle : null}
                        textContentType='password'
						value={password}
					/>
					<ForgotPassword />
				</InputContainer>
				{otherError && (
					<ErrorContainer>
						<ErrorText>
							Something went wrong. Please reach out to the Reelay team
						</ErrorText>
					</ErrorContainer>
				)}
                <BottomButtonsContainer>
                    {/* <SocialLoginBar 
                        navigation={navigation} 
                        signingIn={signingIn} 
                        setSigningIn={setSigningIn} 
                    /> */}
                    <SignInButtonContainer>
                        <Button
                            text={signingIn ? "Logging in..." : "Log in"}
                            onPress={signInWithUsernameAndPassword}
                            disabled={signingIn}
                            backgroundColor={ReelayColors.reelayBlue}
                            fontColor="white"
                            borderRadius="26px"
                        />
                    </SignInButtonContainer>
                </BottomButtonsContainer>
			</AlignmentContainer>
		);
    }

    const TopBar = () => {
		const Container = styled(View)`
			width: 100%;
			height: 20%;
			flex-direction: row;
			justify-content: center;
            margin-bottom: 20px;
		`;
		const TopBarContainer = styled(View)`
			width: 85%;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			margin-bottom: 10px;
		`;
		const BackButtonContainer = styled(View)`
			margin-left: -10px;
			margin-bottom: 50px;
		`;

		const TextContainer = styled(View)`
			margin-bottom: 20px;
		`;
		const HeaderText = styled(ReelayText.H5Bold)`
			color: white;
			margin-bottom: 10px;
		`;
		const SublineText = styled(ReelayText.Caption)`
			color: white;
		`;

		return (
			<Container>
				<TopBarContainer>
					<BackButtonContainer>
						<BackButton navigation={navigation} />
					</BackButtonContainer>
					<TextContainer>
						<HeaderText>
                            { !signingIn && 'Log in'}
                            { signingIn && 'Logging you in...'}
                        </HeaderText>
						<SublineText>
                            { !signingIn && 'Get back into the mix'}
                            { signingIn && 'Just a moment'}
                        </SublineText>
					</TextContainer>
				</TopBarContainer>
			</Container>
		);
	};

    return (
        <KeyboardHidingBlackContainer>
            <TopBar />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                { !signingIn && <UsernameAndPassword /> }
                { signingIn && <ActivityIndicator /> }
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}