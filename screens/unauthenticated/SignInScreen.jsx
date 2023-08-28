import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, SafeAreaView, Pressable, View, ActivityIndicator } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd, firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';

import { getInputUsername } from '../../components/utils/usernameOrEmail';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserByUsername } from '../../api/ReelayDBApi';

const DEFAULT_USERNAME_LOGIN_ERROR_TEXT = "Username/email is incorrect";
const DEFAULT_PASSWORD_LOGIN_ERROR_TEXT = "Password is incorrect";

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
const ErrorText = styled(ReelayText.Body1)`
    color: ${ReelayColors.reelayRed};
    text-align: left;
    padding: 20px;
`
const FullScreenBlackContainer = styled(SafeAreaView)`
    background-color: ${ReelayColors.reelayBlack};
    height: 100%;
    width: 100%;
`;
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
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <FullScreenBlackContainer>
                {children}
            </FullScreenBlackContainer>
        </TouchableWithoutFeedback>
    )
};


export default SignInScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('SignIn screen mounted');
        const { setCognitoUser } = useContext(AuthContext);
        const [signingIn, setSigningIn] = useState(false);
        const dispatch = useDispatch();


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
            const [usernameOrEmail, setUsernameOrEmail] = useState('');
            const [password, setPassword] = useState('');

            const usernameLoginError = useSelector(state => state.usernameLoginError);
            const passwordLoginError = useSelector(state => state.passwordLoginError);
            const hidePassword = useSelector(state => state.loginPasswordHidden);

            const badUsername = usernameLoginError.length > 0;
            const badPassword = passwordLoginError.length > 0;

            const setUsernameLoginError = (next) => { dispatch({ type: 'setUsernameLoginError', payload: next }) }
            const setPasswordLoginError = (next) => { dispatch({ type: 'setPasswordLoginError', payload: next }) }
            const setHidePassword = (next) => { dispatch({ type: 'setLoginPasswordHidden', payload: next }) }

            const changeUsernameInput = (text) => {
                setUsernameOrEmail(text);
                if (badUsername) setUsernameLoginError("");
            }

            const changePasswordText = (text) => {
                setPassword(text);
                if (badPassword) setPasswordLoginError("");
            }

            const handleBadUsername = () => {
                setUsernameLoginError(DEFAULT_USERNAME_LOGIN_ERROR_TEXT);
                setSigningIn(false);
                logAmplitudeEventProd('signInFailedBadUsername', { usernameOrEmail });
            }

            const handleBadPassword = () => {
                setPasswordLoginError(DEFAULT_PASSWORD_LOGIN_ERROR_TEXT);
                setSigningIn(false);
                logAmplitudeEventProd('signInFailedBadPassword', { usernameOrEmail });
            }

            const handleUnconfirmedUser = async () => {
                const username = await getInputUsername(usernameOrEmail);
                await Auth.resendSignUp(username);
                const { email } = await getUserByUsername(username);
                navigation.push('ConfirmEmailScreen', { username, email, password });
                logAmplitudeEventProd('signInFailedUnconfirmedEmail', { username });
            }

            const handleBadInput = () => {
                if (usernameOrEmail.includes(" ")) setUsernameLoginError("Username/email cannot contain spaces");
                else showErrorToast("One or more fields contain invalid characters.");
                setSigningIn(false);
                logAmplitudeEventProd('signInFailedBadInput', { usernameOrEmail });
            }

            const handleOtherErrors = (error) => {
                showErrorToast("Something went wrong. Please try again. If the issue persists, please email support@reelay.app", "top")
                setSigningIn(false);
                logAmplitudeEventProd('signInFailedOtherReason', { usernameOrEmail, error });
            }

            const signInWithUsernameAndPassword = async () => {
                console.log('Attempting user sign in');
                try {
                    setSigningIn(true);
                    const username = await getInputUsername(usernameOrEmail);
                    if (!username.length) {
                        // entered an invalid email
                        handleBadUsername();
                        return;
                    }
                    else if (!password.length) {
                        // entered an invalid password
                        handleBadPassword();
                        return;
                    }

                    const creator = await getUserByUsername(username);
                    const cognitoUser = await Auth.signIn(creator.originalUsername, password);
                    const cognitoSession = await Auth.currentSession();
                    dispatch({ type: 'setAuthSessionFromCognito', payload: cognitoSession });
                    setCognitoUser(cognitoUser);

                    console.log('Signed in user successfully');
                    logAmplitudeEventProd('signInSuccess', {
                        username,
                        Device: Platform.OS,
                    });
                } catch (error) {
                    console.log('Received error');
                    console.log(`${error?.code}: `);
                    console.log(error);

                    if (error.code === 'UserNotConfirmedException') {
                        await handleUnconfirmedUser();
                    } else if (error.code === 'NotAuthorizedException') {
                        handleBadPassword();
                    } else if (error.code === 'UserNotFoundException') {
                        handleBadUsername();
                    } else if (error.code === "InvalidParameterException") {
                        handleBadInput();
                    }
                    else {
                        handleOtherErrors(error);
                    }
                    setSigningIn(false);
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
                            autoCorrect={false}
                            autoComplete='none'
                            autoCapitalize="none"
                            containerStyle={AuthInputContainerStyle}
                            leftIcon={AuthInputUsernameIconStyle}
                            placeholder={"Enter username or email"}
                            errorMessage={usernameLoginError}
                            onChangeText={changeUsernameInput}
                            rightIcon={badUsername ? AuthInputWarningIconStyle : null}
                            textContentType='emailAddress'
                            value={usernameOrEmail}
                        />
                        <AuthInput
                            containerStyle={AuthInputContainerStyle}
                            placeholder={"Enter password"}
                            errorMessage={passwordLoginError}
                            leftIcon={PasswordIconComponent}
                            onChangeText={changePasswordText}
                            secureTextEntry={hidePassword}
                            rightIcon={badPassword ? AuthInputWarningIconStyle : null}
                            textContentType='password'
                            value={password}
                            onSubmitEditing={signInWithUsernameAndPassword}
                        />
                        <ForgotPassword />
                    </InputContainer>
                    <BottomButtonsContainer>
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
                                {!signingIn && 'Log in'}
                                {signingIn && 'Logging you in...'}
                            </HeaderText>
                            <SublineText>
                                {!signingIn && 'Get back into the mix'}
                                {signingIn && 'Just a moment'}
                            </SublineText>
                        </TextContainer>
                    </TopBarContainer>
                </Container>
            );
        };

        return (
            <KeyboardHidingBlackContainer>
                <TopBar />
                <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
                    {!signingIn && <UsernameAndPassword />}
                    {signingIn && <ActivityIndicator />}
                </KeyboardAvoidingView>
            </KeyboardHidingBlackContainer>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}