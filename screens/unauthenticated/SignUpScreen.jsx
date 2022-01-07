import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, Pressable, View } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';
import { validate } from "validate.js";
import * as ReelayText from '../../components/global/Text';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import * as Amplitude from 'expo-analytics-amplitude';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { KeyboardHidingBlackContainer } from "./SignInScreen";
import constraints from '../../components/utils/EmailValidationConstraints';
import { Button } from '../../components/global/Buttons';

const REELAY_ICON_SOURCE = require('../../assets/icons/reelay-icon.png');
const SIGN_UP_ERROR_MESSAGE = "Couldn't create an account. Try a different username?";

export default SignUpScreen = ({ navigation, route }) => {

    const AuthInput = styled(Input)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
        margin-left: 8px;
	`; 
    const AuthInputContainerStyle = (active) => {
        return {
			alignSelf: "left",
			marginBottom: -5,
            width: "100%",
            opacity: active ? 1 : 0.7,
		}
    }
    const AuthInputWarningIconStyle = {
		color: ReelayColors.reelayRed,
		name: "warning",
		type: "ionicon",
	};
    const AuthInputEmailIconStyle = {
		color: "white",
		name: "mail-outline",
		type: "ionicon",
    };
    const AuthInputUsernameIconStyle = {
		color: "white",
		name: "person-outline",
		type: "ionicon",
    };
    const AuthInputLockedIconStyle = {
		color: "white",
		name: "lock-closed-outline",
		type: "ionicon",
    };
    const AuthInputUnlockedIconStyle = {
        color: "white",
        name: "lock-open-outline",
        type: "ionicon",
    };

    const ErrorMessageStyle = {
        fontFamily: 'Outfit',
        fontSize: 16,
        fontWeight: 400,
        color: ReelayColors.reelayBlue,
        paddingLeft: 32,
        paddingRight: 32,
        paddingBottom: 10,
    }

    const InputContainer = styled(View)`
        margin-bottom: 60px;
        width: 90%;
        height: 60%;
        display: flex;
        flex-direction: column;
    `
    const AlignmentContainer = styled(View)`
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    `

    const CTAButtonContainer = styled(View)`
        margin-bottom: 40px;
        width: 95%;
        height: 56px;
    `


    const SignUpInputs = () => {

        const [email, setEmail] = useState("");
        const emailInvalid = validate({ emailAddress: email }, constraints);
        const showEmailError = email.length > 0 && !!emailInvalid;
        const [emailFieldActive, setEmailFieldActive] = useState(false);


        const [username, setUsername] = useState("");
        const newValidUsernameRegex = /^([a-zA-z0-9]+(?:[.-_+][a-zA-Z0-9]+)*)$/g;
        const validUsernameLength = username.length > 2 && username.length < 26;
        const usernamePassesRegex = newValidUsernameRegex.test(username);
        const validUsername = validUsernameLength && usernamePassesRegex;
        const showUsernameError = username.length > 0 && !usernamePassesRegex;
        const [usernameFieldActive, setUsernameFieldActive] = useState(false);

        const [password, setPassword] = useState('');
        const [passwordFieldActive, setPasswordFieldActive] = useState(false);

        const [confirmPassword, setConfirmPassword] = useState('');
        const [confirmPasswordFieldActive, setConfirmPasswordFieldActive] = useState(false);

        const [hidePassword, setHidePassword] = useState(true);
        const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
        const hideShowPasswordPrompt = hidePassword ? 'Show Password' : 'Hide Password';
        const passwordsMatch = (password === confirmPassword);
        const passwordLongEnough = (password.length >= 8);
        const showPasswordError = !passwordLongEnough && password.length > 0;
		const showConfirmPasswordError =
			!passwordsMatch && confirmPassword.length >= password.length;

        const createAccountDisabled = !(
			passwordsMatch &&
			passwordLongEnough &&
			!emailInvalid &&
			validUsername
		);
        

        const handleFailedAccountCreation = async () => {
            if (emailInvalid) {
				showErrorToast(emailInvalid.emailAddress[0], "top");
			} else if (!validUsername) {
				if (!validUsernameLength) {
					showErrorToast("Usernames must be between 3 and 25 characters");
				} else {
					showErrorToast("Usernames should be alphanumeric. Separators .+_- are okay");
				}
			} else if (!passwordLongEnough) {
				showErrorToast("Password not long enough");
			} else if (!passwordsMatch) {
				showErrorToast("Passwords do not match");
			}  
        }

        const hideShowPassword = async () => {
            setHidePassword(!hidePassword);
            setHideConfirmPassword(!hideConfirmPassword);
        }
    
        const createAccount = async () => {
            if (createAccountDisabled) {
                console.log('create account disabled');
                handleFailedAccountCreation();
                return;
            }

            console.log('Attempting account creation');
            try {
                const signUpResult = await Auth.signUp({
                    username: username,
                    password: password,
                    attributes: {
                        email: email.toLowerCase(),
                    },
                }); 
                navigation.push('ConfirmEmailScreen', { username });
                logAmplitudeEventProd('signUp', {
                    email: username,
                    username: username,
                });
            } catch (error) {
                console.log('Couldn\'t sign up user');
                console.log(error);
                showErrorToast(SIGN_UP_ERROR_MESSAGE);
            }
        }

        const PasswordIconComponent = () => {
            if (hidePassword) return (
                <Pressable onPress={() => hideShowPassword()}>
                    <Icon type="ionicon" name="eye-off-outline" color="white" />
                </Pressable>
            )
            else return (
				<Pressable onPress={() => hideShowPassword()}>
					<Icon type="ionicon" name="eye-outline" color="white" />
				</Pressable>
			);
        }

        return (
			<AlignmentContainer>
				<InputContainer>
					<AuthInput
						autoCapitalize="none"
						autoComplete="email"
						containerStyle={AuthInputContainerStyle(emailFieldActive || showEmailError)}
						onFocus={() => setEmailFieldActive(true)}
						onBlur={() => setEmailFieldActive(false)}
						keyboardType="email-address"
						placeholder={"Email"}
						onChangeText={setEmail}
						leftIcon={AuthInputEmailIconStyle}
						rightIcon={showEmailError ? AuthInputWarningIconStyle : null}
						value={email}
					/>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle(
							usernameFieldActive || showUsernameError
						)}
						onFocus={() => setUsernameFieldActive(true)}
						onBlur={() => setUsernameFieldActive(false)}
						placeholder={"Pick a username"}
						onChangeText={setUsername}
						leftIcon={AuthInputUsernameIconStyle}
						rightIcon={showUsernameError ? AuthInputWarningIconStyle : null}
						value={username}
					/>
					<AuthInput
						containerStyle={AuthInputContainerStyle(
							passwordFieldActive || showPasswordError
						)}
						onFocus={() => setPasswordFieldActive(true)}
						onBlur={() => setPasswordFieldActive(false)}
						errorMessage={
							showPasswordError && "Passwords must be at least 8 characters."
						}
						errorProps={ErrorMessageStyle}
						placeholder={"Enter password"}
						onChangeText={setPassword}
						leftIcon={PasswordIconComponent}
						rightIcon={showPasswordError ? AuthInputWarningIconStyle : null}
						secureTextEntry={hidePassword}
						value={password}
					/>
					<AuthInput
						containerStyle={AuthInputContainerStyle(
							confirmPasswordFieldActive || showConfirmPasswordError
						)}
						onFocus={() => setConfirmPasswordFieldActive(true)}
						onBlur={() => setConfirmPasswordFieldActive(false)}
						errorMessage={showConfirmPasswordError && "Passwords don't match!"}
						errorProps={ErrorMessageStyle}
						placeholder={"Re-enter password"}
						onChangeText={setConfirmPassword}
						secureTextEntry={hideConfirmPassword}
						leftIcon={
							passwordsMatch ? AuthInputLockedIconStyle : AuthInputUnlockedIconStyle
						}
						rightIcon={showConfirmPasswordError ? AuthInputWarningIconStyle : null}
						value={confirmPassword}
					/>
				</InputContainer>
				<CTAButtonContainer>
					<Button
						text="Sign Up"
						onPress={createAccount}
						backgroundColor={ReelayColors.reelayBlue}
						fontColor="white"
						borderRadius="26px"
					/>
				</CTAButtonContainer>
			</AlignmentContainer>
		);
    }

    const TopBar = () => {
        const Container = styled(View)`
            width: 100%;
            height: 20%;
            flex-direction: row;
            justify-content: center;
        `
        const TopBarContainer = styled(View)`
            width: 85%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            margin-bottom: 10px;
        `
        const BackButtonContainer = styled(View)`
            margin-left: -10px;
            margin-bottom: 50px;
		`;

        const TextContainer = styled(View)`
            margin-bottom: 20px;
        `
        const HeaderText = styled(ReelayText.H5Bold)`
            color: white;
            margin-bottom: 4px;
        `
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
						<HeaderText>Let's Get Started!</HeaderText>
						<SublineText>Fill out the form to continue</SublineText>
					</TextContainer>
				</TopBarContainer>
			</Container>
		);
    }

    return (
        <KeyboardHidingBlackContainer>
            <TopBar />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1, height: "80%"}}>
                <SignUpInputs />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}