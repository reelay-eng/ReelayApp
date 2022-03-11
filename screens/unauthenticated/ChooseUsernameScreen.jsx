import React, { useContext, useEffect, useState } from 'react';
import { Icon, Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';
import { registerUser, searchUsers } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';

import { 
    ActivityIndicator,
    Keyboard, 
    KeyboardAvoidingView, 
    SafeAreaView, 
    Pressable, 
    TouchableWithoutFeedback, 
    View, 
} from 'react-native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { registerSocialAuthAccount, saveAndRegisterSocialAuthToken } from '../../api/ReelayUserApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { showErrorToast } from '../../components/utils/toasts';

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

export default ChooseUsernameScreen = ({ navigation, route }) => {    
    const AuthInput = styled(Input)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
		margin-left: 8px;
	`;
	const AuthInputContainerStyle = {
        marginBottom: -5,
        width: "100%",
    };
    const AuthInputAtIconStyle = {
		color: "white",
		name: "at",
		type: "ionicon",
        size: 20,
    };
    const AlignmentContainer = styled(View)`
		width: 100%;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	`;
    const TopContainer = styled(View)`
        align-items: center;
        justify-content: center;
        width: 100%;
    `
    const InputContainer = styled(View)`
        flex-direction: column;
        margin-bottom: 30px;
        width: 90%;
    `;
    const InstructionText = styled(ReelayText.Body2)`
        color: white;
        margin-left: 10px;
        text-align: left;
    `
    const InstructionContainer = styled(View)`
        align-items: flex-start;
        width: 90%;
    `
	const SignupButtonContainer = styled(View)`
		margin-bottom: 40px;
		height: 56px;
        width: 95%;
	`

    const { method, email, fullName, googleUserID, appleUserID, password } = route?.params;
    const [signingIn, setSigningIn] = useState(false);
    const { setReelayDBUserID } = useContext(AuthContext);
    
    const UsernameInput = () => {
        const [inputText, setInputText] = useState('');
        const newValidUsernameRegex = /^([a-zA-z]+[a-zA-z0-9]*(?:[.\-_+][a-zA-Z0-9]+)*)$/g;
        const validUsernameLength = inputText.length > 3 && inputText.length < 26;
        const usernamePassesRegex = newValidUsernameRegex.test(inputText);
        const usernameHasValidForm = validUsernameLength && usernamePassesRegex;

        console.log('Username is valid? ', usernameHasValidForm);

        const changeInputText = async (inputUsername) => {
            setInputText(inputUsername);
        }

        const isUsernameValid = async (username) => {
            if (!usernameHasValidForm) {
                showErrorToast('Usernames must be between 4 and 25 characters, alphanumeric. Separators .+_- are okay');
                return false;
            }
            const partialMatchingUsers = await searchUsers(username);
            if (partialMatchingUsers?.error) {
                return false;
            }

            const usernamesMatch = (userObj) => (userObj.username === username);
            const fullMatchIndex = await partialMatchingUsers.findIndex(usernamesMatch);
            if (fullMatchIndex === -1) {
                return true;
            } else {
                showErrorToast('That username is already taken');
                return false;
            }
        }

        const completeSignUp = async () => {
            const username = inputText;
            const canSignUp = await isUsernameValid(username);
            if (!canSignUp) return;

            setSigningIn(true);
            logAmplitudeEventProd('signUp', { email, username });
            console.log('Signing up...');

            if (method === 'apple' || method === 'google') {
                const authAccountObj = await registerSocialAuthAccount({ method, email, fullName, googleUserID, appleUserID });
                console.log('Auth account register result: ', completeSignUpResult);
    
                const { reelayDBUserID } = authAccountObj;
                const completeSignUpResult = await registerUser({ email, username, sub: reelayDBUserID });
                console.log('Social sign up result: ', completeSignUpResult);
    
                saveAndRegisterSocialAuthToken(reelayDBUserID);
                setSigningIn(false);
                setReelayDBUserID(reelayDBUserID);    
            } else if (method === 'cognito') {
                const signUpResult = await Auth.signUp({
                    username: username,
                    password: password,
                    attributes: { email: email.toLowerCase() },
                }); 
                console.log('SIGN UP RESULT', signUpResult);
                navigation.push('ConfirmEmailScreen', { username, password });
            } else {
                console.log('No valid signup method specified');
            }
        }
        
        return (
			<AlignmentContainer>
                <TopContainer>
                    <InputContainer>
                        <AuthInput
                            autoComplete='none'
                            autoCapitalize="none"
                            containerStyle={AuthInputContainerStyle}
                            leftIcon={AuthInputAtIconStyle}
                            placeholder={"lukeskywalker"}
                            onChangeText={changeInputText}
                            textContentType='username'
                            value={inputText}
                        />
                    </InputContainer>
                    <InstructionContainer>
                        <InstructionText>
                            {'Usernames must be between 4 and 25 characters, \
                                alphanumeric, and start with letters. Separators .+_- are okay'}
                        </InstructionText>
                    </InstructionContainer>
                </TopContainer>
				<SignupButtonContainer>
					<Button
						text={signingIn ? "Beaming you in..." : "Complete sign up"}
						onPress={completeSignUp}
						disabled={signingIn || !usernameHasValidForm}
						backgroundColor={ReelayColors.reelayBlue}
						fontColor="white"
						borderRadius="26px"
					/>
				</SignupButtonContainer>
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
                            { !signingIn && 'Select a username'}
                            { signingIn && 'Getting you setup...'}
                        </HeaderText>
						<SublineText>
                            { !signingIn && 'What should we call you?'}
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
                { !signingIn && <UsernameInput /> }
                { signingIn && <ActivityIndicator /> }
            </KeyboardAvoidingView>
        </KeyboardHidingBlackContainer>
    );
}