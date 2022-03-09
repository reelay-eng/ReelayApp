import React, { useContext, useState } from 'react';
import { Icon, Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';
import BackButton from '../../components/utils/BackButton';
import { registerUser, searchUsers } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';

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
// import { registerReelayDBUser } from '../../api/ReelayUserApi';

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
    const AuthInputWarningIconStyle = {
		color: ReelayColors.reelayRed,
		name: "warning",
		type: "ionicon",
	};
    const InputContainer = styled(View)`
		margin-bottom: 60px;
		width: 90%;
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

	const SignupButtonContainer = styled(View)`
		margin-bottom: 40px;
		width: 95%;
		height: 56px;
	`

    const { method, email, googleUserID, appleUserID } = route?.params;
    const [signingIn, setSigningIn] = useState(false);
    // const { setReelayDBUserID } = useContext(AuthContext);
    
    const UsernameInput = () => {

        const [inputText, setInputText] = useState('');

        const newValidUsernameRegex = /^([a-zA-z0-9]+(?:[.-_+][a-zA-Z0-9]+)*)$/g;
        const validUsernameLength = inputText.length > 3 && inputText.length < 26;
        const usernamePassesRegex = newValidUsernameRegex.test(inputText);
        const usernameIsValid = validUsernameLength && usernamePassesRegex;

        console.log('Username is valid? ', usernameIsValid);

        const [canSignUp, setCanSignUp] = useState(false);
        const [errorText, setErrorText] = useState((usernameIsValid || inputText.length <= 3) ? '' :
            'Usernames must be between 4 and 25 characters, alphanumeric. Separators .+_- are okay'
        );

        const changeInputText = async (inputUsername) => {
            setInputText(inputUsername);
            // setIsCheckingUsername(true);
            await checkUsernameValid(inputUsername);
            // setIsCheckingUsername(false);
        }

        const checkUsernameValid = async (username) => {
            const partialMatchingUsers = await searchUsers(username);
            if (partialMatchingUsers?.error) {
                setErrorText('Error connecting to DB');
                setCan (false);
                return;
            }

            const usernamesMatch = (userObj) => (userObj.username === username);
            const fullMatchIndex = await partialMatchingUsers.findIndex(usernamesMatch);
            if (fullMatchIndex === -1 && usernameIsValid) {
                setCanSignUp(true);
                setErrorText('');
            } else {
                setErrorText('That username is already taken');
                setCanSignUp(false);
            }
        }

        const completeSignUp = async () => {
            setSigningIn(true);
            console.log('Signing up...');
            const authAccountObj = await registerSocialAuthAccount({ method, email, googleUserID, appleUserID });
            console.log('Auth account register result: ', completeSignUpResult);
            
            const { reelayDBUserID } = authAccountObj;
            const completeSignUpResult = await registerUser({ email, username: inputText, sub: reelayDBUserID });
            console.log('Social sign up result: ', completeSignUpResult);

            saveAndRegisterSocialAuthToken(reelayDBUserID);
            setSigningIn(false);
            setReelayDBUserID(reelayDBUserID);
        }
        
        return (
			<AlignmentContainer>
				<InputContainer>
					<AuthInput
						autoCapitalize="none"
						containerStyle={AuthInputContainerStyle}
						leftIcon={AuthInputAtIconStyle}
						placeholder={"lukeskywalker"}
						errorMessage={(!canSignUp && errorText)}
						onChangeText={changeInputText}
						rightIcon={(canSignUp || inputText.length <= 3) ? null : AuthInputWarningIconStyle}
						value={inputText}
					/>
				</InputContainer>
				<SignupButtonContainer>
					<Button
						text={signingIn ? "Beaming you in..." : "Complete sign up"}
						onPress={completeSignUp}
						disabled={!canSignUp || signingIn}
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