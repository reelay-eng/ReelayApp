import React, { useContext, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Pressable} from 'react-native';
import { Input, Icon } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { showMessageToast, showErrorToast } from '../../components/utils/toasts';
import BackButton from '../../components/utils/BackButton';

import { KeyboardHidingBlackContainer } from './SignInScreen';

import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { Button } from '../../components/global/Buttons';

export default ForgotPasswordSubmitScreen = ({ navigation, route }) => {

    const AuthInput = styled(Input)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
		margin-left: 8px;
	`;
	const AuthInputContainerStyle = {
		alignSelf: "left",
		marginBottom: -5,
		width: "100%",
	};
	const AuthInputCodeIconStyle = {
		color: "white",
		name: "finger-print-outline",
		type: "ionicon",
	};
	const AuthInputWarningIconStyle = {
		color: ReelayColors.reelayRed,
		name: "warning",
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

	const CTAButton = styled(Button)`
		align-self: center;
		margin-bottom: 40px;
		width: 75%;
	`;
	const InputContainer = styled(View)`
		margin-bottom: 60px;
		width: 90%;
		height: 60%;
		display: flex;
		flex-direction: column;
	`;
	const AlignmentContainer = styled(View)`
		width: 100%;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	`;

	const CTAButtonContainer = styled(View)`
		margin-top: 10px;
		width: 95%;
		height: 56px;
	`;
    
    const { username } = route.params;

    const PasswordInput = () => {
        const [confirmationCode, setConfirmationCode] = useState('');
        const codeLongEnough = confirmationCode.length > 0;
        const [codeError, setCodeError] = useState("");

        const [newPassword, setNewPassword] = useState('');
        const passwordLongEnough = newPassword.length >= 8;
        const [newPasswordError, setNewPasswordError] = useState("");

        const [confirmNewPassword, setConfirmNewPassword] = useState('');
        const passwordsMatch = newPassword == confirmNewPassword;

        const [hidePassword, setHidePassword] = useState(false);

        const RESEND_FORGOT_PW_EMAIL_MESSAGE = 'Check your email for another confirmation code'
        const FORGOT_PW_EMAIL_ERROR_MESSAGE = 'Couldn\'t resend forgot password email';
        const FORGOT_PW_SUBMIT_ERROR_MESSAGE = 'Could not reset password. Check or resend confirmation code to try again.';

        const changeCode = (text) => {
            setConfirmationCode(text);
			if (!!codeError.length) setCodeError("");
        }

        const handleBadCode = () => {
            setCodeError("Please enter a verification code.");
        }

        const changeNewPasswordText = (text) => {
            setNewPassword(text);
            if (!!newPasswordError.length && text.length >= 8) setNewPasswordError("");
        }

        const handleBadPassword = () => {
            setNewPasswordError("Password must be 8+ characters long");
        }

        const forgotPasswordSubmit = async () => {
            console.log('Attempting to reset password');

            if (!codeLongEnough) {
                handleBadCode();
                return;
            }
            if (!passwordLongEnough) {
                handleBadPassword();
                return;
            }

            try {
                const forgotPasswordSubmitResult = await Auth.forgotPasswordSubmit(
                    username,
                    confirmationCode,
                    newPassword
                );    

                console.log('Reset password successfully');
                console.log(forgotPasswordSubmitResult);
                navigation.popToTop();
                navigation.push("SignInScreen");
            } catch (error) {
                if (error?.code == "CodeMismatchException") {
                    setCodeError("The code you provided was invalid. Please try again.");
                    return;
				}
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
                        keyboardType="numeric"
						containerStyle={AuthInputContainerStyle}
						placeholder={"Enter verification code"}
						onChangeText={changeCode}
						leftIcon={AuthInputCodeIconStyle}
						rightIcon={!!codeError ? AuthInputWarningIconStyle : null}
						errorMessage={codeError}
					/>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle}
						placeholder={"Enter new password"}
						onChangeText={changeNewPasswordText}
						secureTextEntry={hidePassword}
						leftIcon={PasswordIconComponent}
						rightIcon={!!newPasswordError ? AuthInputWarningIconStyle : null}
						errorMessage={newPasswordError}
						textContentType='newPassword'
						value={newPassword}
					/>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle}
						placeholder={"Confirm new password"}
						onChangeText={setConfirmNewPassword}
						secureTextEntry={hidePassword}
						leftIcon={
							passwordsMatch ? AuthInputLockedIconStyle : AuthInputUnlockedIconStyle
						}
						rightIcon={!passwordsMatch ? AuthInputWarningIconStyle : null}
						errorMessage={!passwordsMatch && "Passwords do not match"}
						secureTextEntry={true}
						textContentType='newPassword'
						value={confirmNewPassword}
					/>

					<CTAButtonContainer>
						<Button
							text={"Reset password"}
							onPress={forgotPasswordSubmit}
							disabled={!passwordsMatch || !passwordLongEnough}
							backgroundColor={ReelayColors.reelayBlue}
							fontColor="white"
							borderRadius="26px"
						/>
					</CTAButtonContainer>

					<CTAButtonContainer>
						<Button
							text={"Resend confirmation email"}
							onPress={resendForgotPasswordEmail}
							backgroundColor="transparent"
							fontColor={ReelayColors.reelayBlue}
							// border={`solid 1px ${ReelayColors.reelayBlue}`}
							borderRadius="26px"
						/>
					</CTAButtonContainer>
				</InputContainer>
			</AlignmentContainer>
		);
    }

    const TopBar = () => {
		const Container = styled(View)`
			width: 100%;
			height: 20%;
			flex-direction: row;
			justify-content: center;
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
			margin-bottom: 4px;
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
						<HeaderText>Reset Password</HeaderText>
						<SublineText>A confirmation code was sent to your email</SublineText>
					</TextContainer>
				</TopBarContainer>
			</Container>
		);
	};

    return (
        <KeyboardHidingBlackContainer>
            <TopBar />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <PasswordInput />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );

}