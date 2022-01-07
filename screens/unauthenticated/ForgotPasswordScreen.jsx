import React, { useContext, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Text } from 'react-native';
import { Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { showErrorToast } from '../../components/utils/toasts';
import { Button } from '../../components/global/Buttons';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import BackButton from '../../components/utils/BackButton';
import { KeyboardHidingBlackContainer } from './SignInScreen';
import ReelayColors from '../../constants/ReelayColors';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { getInputUsername } from '../../components/utils/usernameOrEmail';

export default ForgotPasswordScreen = ({ navigation }) => {

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

    const EmailInput = () => {
        const [inputText, setInputText] = useState("");
		const [error, setError] = useState("");
		const [sending, setSending] = useState(false);

        const changeInputText = (text) => {
			setInputText(text);
            if (!!error.length) {
				setError("");
			}
		};

        const handleBadEmail = async () => {
            setError("Invalid username or email.");
            logAmplitudeEventProd('signInFailedBadEmail', {
                email: inputText,
            });
        }

        const sendForgotPasswordEmail = async () => {
            const username = await getInputUsername(inputText);
            if (!username.length) {
                handleBadEmail();
                return;
            }

			try {
				setSending(true);
				const forgotPasswordResult = await Auth.forgotPassword(username);
				setSending(false);
                navigation.push('ForgotPasswordSubmitScreen', {
                    username: username
                });
				console.log("Forgot Password", forgotPasswordResult);
            } catch (error) {
				setError("Something went wrong. Double-check and try again.");
				setSending(false);
				
            }
        }
        
        return (
			<AlignmentContainer>
				<InputContainer>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle}
						leftIcon={AuthInputUsernameIconStyle}
						placeholder={"Enter username or email"}
						errorMessage={!!error.length && error}
						onChangeText={changeInputText}
						rightIcon={!!error.length ? AuthInputWarningIconStyle : null}
						value={inputText}
					/>
					<CTAButtonContainer>
						<Button
							text={sending ? "Sending..." : "Send me a reset link"}
							onPress={sendForgotPasswordEmail}
							disabled={!!error.length || sending}
							backgroundColor={ReelayColors.reelayBlue}
							fontColor="white"
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
						<HeaderText>Forgot Password?</HeaderText>
						<SublineText>Let's see what we can do.</SublineText>
					</TextContainer>
				</TopBarContainer>
			</Container>
		);
	};

    return (
        <KeyboardHidingBlackContainer>
            <TopBar />
            <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
                <EmailInput />
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}