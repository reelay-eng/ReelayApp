import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, TouchableWithoutFeedback, View, Linking, ActivityIndicator } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';
import { showErrorToast } from '../../components/utils/toasts';
import { validate } from "validate.js";
import * as ReelayText from '../../components/global/Text';

import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { KeyboardHidingBlackContainer } from "./SignInScreen";
import constraints from '../../components/utils/EmailValidationConstraints';
import { Button } from '../../components/global/Buttons';
import SocialLoginBar from '../../components/auth/SocialLoginBar';
import { registerUser } from '../../api/ReelayDBApi';
import { HeaderWithBackButton } from '../../components/global/Headers';

const AuthInput = styled(Input)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
`

const AuthInputContainerStyle = (active) => {
    return {
        marginBottom: -5,
        width: "100%",
        opacity: active ? 1 : 0.7,
    }
};
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
    width: 90%;
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
const BottomButtonsContainer = styled(View)`
    width: 100%;
    margin-bottom: 24px;
    flex-direction: column;
    align-items: center;
`
const SignUpButtonContainer = styled(View)`
    margin-bottom: 16px;
    width: 90%;
    height: 56px;
`
const SignUpDisclosure = styled(ReelayText.Caption)`
    color: white;
    text-align: center;
    width: 80%;
`
const Spacer = styled(View)`
    height: 20%;
`

export default SignUpScreen = ({ navigation, route }) => {
    // signingUp behavior activates when loading from social, but not cognito
    const [signingUp, setSigningUp] = useState(false);
    const SignUpDisclosureLink = ({ url, children }) => {
        const LinkText = styled(ReelayText.Caption)`
            color: white;
            text-decoration-line: underline;
            text-decoration-style: solid;
        `;
        const LinkPressable = styled(TouchableWithoutFeedback)``
        return (
            <LinkPressable onPress={() => Linking.openURL(url)}>
                <LinkText>{children}</LinkText>
            </LinkPressable>
        )
    }

    const SignUpInputs = () => {
        const [email, setEmail] = useState("");
        const emailInvalid = validate({ emailAddress: email }, constraints);
        const showEmailError = email.length > 0 && !!emailInvalid;
        const [emailFieldActive, setEmailFieldActive] = useState(false);

        const [password, setPassword] = useState('');
        const [passwordFieldActive, setPasswordFieldActive] = useState(false);

        const [confirmPassword, setConfirmPassword] = useState('');
        const [confirmPasswordFieldActive, setConfirmPasswordFieldActive] = useState(false);

        const [hidePassword, setHidePassword] = useState(true);
        const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

        // const hideShowPasswordPrompt = hidePassword ? 'Show Password' : 'Hide Password';
        const passwordsMatch = (password === confirmPassword);
        const passwordLongEnough = (password.length >= 8);
        const showPasswordError = !passwordLongEnough && password.length > 0;
		const showConfirmPasswordError = (!passwordsMatch && 
            (confirmPassword.length >= password.length));

        const createAccountDisabled = !(passwordsMatch && passwordLongEnough && !emailInvalid);

        const advanceToCreateUsername = () => {
            if (createAccountDisabled) {
                console.log('create account disabled');
                handleFailedAccountCreation();
                return;
            }

            navigation.push('ChooseUsernameScreen', { 
                method: 'cognito', email, password,
            });
        }

        const handleFailedAccountCreation = async () => {
            if (emailInvalid) {
				showErrorToast(emailInvalid.emailAddress[0], "top");
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
                        textContentType='emailAddress'
						value={email}
					/>
					<AuthInput
                        autoComplete='password-new'
                        blurOnSubmit={false}
						containerStyle={AuthInputContainerStyle(
							passwordFieldActive || showPasswordError
						)}
						onFocus={() => setPasswordFieldActive(true)}
						onBlur={() => setPasswordFieldActive(false)}
						errorMessage={
							showPasswordError && "Passwords must be at least 8 characters."
						}
						errorProps={ErrorMessageStyle}
                        passwordRules='minlength: 8;'
						placeholder={"Enter password"}
						onChangeText={setPassword}
						leftIcon={PasswordIconComponent}
						rightIcon={showPasswordError ? AuthInputWarningIconStyle : null}
						secureTextEntry={hidePassword}
                        textContentType='newPassword'
						value={password}
					/>
					<AuthInput
                        autoComplete='password-new'
                        blurOnSubmit={false}
						containerStyle={AuthInputContainerStyle(
							confirmPasswordFieldActive || showConfirmPasswordError
						)}
						onFocus={() => setConfirmPasswordFieldActive(true)}
						onBlur={() => setConfirmPasswordFieldActive(false)}
						errorMessage={showConfirmPasswordError && "Passwords don't match!"}
						errorProps={ErrorMessageStyle}
                        passwordRules='minlength: 8;'
						placeholder={"Re-enter password"}
						onChangeText={setConfirmPassword}
						secureTextEntry={hidePassword}
						leftIcon={
							passwordsMatch ? AuthInputLockedIconStyle : AuthInputUnlockedIconStyle
						}
						rightIcon={showConfirmPasswordError ? AuthInputWarningIconStyle : null}
                        textContentType='newPassword'
						value={confirmPassword}
					/>
				</InputContainer>
				<BottomButtonsContainer>
                    <SocialLoginBar 
                        navigation={navigation} 
                        signingIn={false} 
                        setSigningIn={() => {}} 
                    />
					<SignUpButtonContainer>
						<Button
							text="Continue (1/3)"
							onPress={advanceToCreateUsername}
							backgroundColor={ReelayColors.reelayBlue}
							fontColor="white"
							borderRadius="26px"
						/>
					</SignUpButtonContainer>
					<SignUpDisclosure>
						By Signing Up, you agree to the{" "}
						<SignUpDisclosureLink url="https://www.reelay.app/terms-of-use">
							Terms of Service
						</SignUpDisclosureLink>{" "}
						and{" "}
						<SignUpDisclosureLink url="https://www.reelay.app/privacy-policy">
							Privacy Policy
						</SignUpDisclosureLink>
					</SignUpDisclosure>
				</BottomButtonsContainer>
			</AlignmentContainer>
		);
    }

    return (
        <KeyboardHidingBlackContainer>
            <HeaderWithBackButton navigation={navigation} text={signingUp ? 'Getting ready...' : 'Sign up in seconds' } />
            <Spacer />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1 }}>
                { !signingUp && <SignUpInputs /> }
                { signingUp && <ActivityIndicator /> }
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}