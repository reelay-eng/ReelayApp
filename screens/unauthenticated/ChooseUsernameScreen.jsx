import React, { useContext, useState } from 'react';
import { Input } from 'react-native-elements';
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
    TouchableWithoutFeedback, 
    View, 
} from 'react-native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { registerSocialAuthAccount, saveAndRegisterSocialAuthSession } from '../../api/ReelayUserApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { showErrorToast } from '../../components/utils/toasts';
import { checkUsername } from '../../components/utils/ValidUsernameCheck';

const FullScreenBlackContainer = styled(SafeAreaView)`
    background-color: ${ReelayColors.reelayBlack};
    height: 100%;
    width: 100%;
`
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
`
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
const Container = styled(View)`
    width: 100%;
    height: 20%;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 20px;
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
`
const TextContainer = styled(View)`
    margin-bottom: 20px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    margin-bottom: 10px;
`
const SublineText = styled(ReelayText.Caption)`
    color: white;
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

export default ChooseUsernameScreen = ({ navigation, route }) => {    
    const authSession = route?.params?.authSession;
    const { method, email, fullName, googleUserID, appleUserID, password } = route?.params;
    const [signingIn, setSigningIn] = useState(false);
    const { setReelayDBUserID } = useContext(AuthContext);
    
    const UsernameInput = () => {
        const [inputText, setInputText] = useState('');
        const usernameHasValidForm = checkUsername(inputText);

        const changeInputText = async (inputUsername) => {
            setInputText(inputUsername);
        }

        const isUsernameValid = async (username) => {
            if (!usernameHasValidForm) {
                showErrorToast('Ruh roh! Username has an invalid format. See instructions below');
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
            setSigningIn(true);
            const canSignUp = await isUsernameValid(username);
            if (!canSignUp) {
                setSigningIn(false);
                return;
            }

            logAmplitudeEventProd('signUp', { email, username });
            console.log('Signing up...');

            if (method === 'apple' || method === 'google') {
                const authAccountObj = await registerSocialAuthAccount({ method, email, fullName, googleUserID, appleUserID });    
                const { reelayDBUserID } = authAccountObj;
                const completeSignUpResult = await registerUser({ email, username, sub: reelayDBUserID });
                console.log('complete signup result: ', completeSignUpResult);
    
                setReelayDBUserID(reelayDBUserID);
                await saveAndRegisterSocialAuthSession({ authSession, method, reelayDBUserID });
            } else if (method === 'cognito') {
                const signUpResult = await Auth.signUp({
                    username: username,
                    password: password,
                    attributes: { email: email.toLowerCase() },
                }); 

                const dbResult = await registerUser({
                    email: email.toLowerCase(),
                    username: username,
                    sub: signUpResult?.userSub,
                });

                navigation.push('ConfirmEmailScreen', { 
                    username,
                    email: email.toLowerCase(), 
                    password,
                });
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
                            {'Usernames must be between 4 and 16 characters, \
                                alphanumeric, and start with letters. Separators .+_- are okay'}
                        </InstructionText>
                    </InstructionContainer>
                </TopContainer>
				<SignupButtonContainer>
					<Button
						text={signingIn ? "Registering..." : "Continue (2/3)"}
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