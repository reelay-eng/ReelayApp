import React, { useContext, useRef, useState } from "react";
import { View, Keyboard, Pressable } from "react-native";
import { Input } from 'react-native-elements';
import { Button } from '../../components/global/Buttons';

// Context
import { AuthContext } from '../../context/AuthContext';

// API
import { searchUsers, updateUsername } from "../../api/ReelayDBApi";

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { showErrorToast, showMessageToast } from "../utils/toasts";
import { checkUsername } from "../utils/ValidUsernameCheck"

const AlignmentContainer = styled(View)`
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
`
const UsernameInstructionText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 10px;
    text-align: left;
`
const UsernameInstructionContainer = styled(View)`
    align-items: flex-start;
    width: 90%;
`
const SectionTitleText = styled(ReelayText.Body2Bold)`
	align-self: flex-start;
	color: grey;
`;
const SectionTitleContainer = styled(View)`
	align-self: center;
	width: 85%;
`;
const UsernameInput = styled(Input)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-left: 8px;
`;
const InputContainer = styled(Pressable)`
    width: 90%;
    display: flex;
    flex-direction: column;
`
const SaveInfoButtonContainer = styled(View)`
    width: 90%;
    height: 45px;
    margin: 6px;
`
const BottomButtonsContainer = styled(View)`
    width: 100%;
    position: absolute;
    bottom: 80px;
    flex-direction: column;
    align-items: center;
`

export default AccountInfo = ({ navigation, refreshProfile }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const ViewContainer = styled(View)`
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
    `

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
        <ViewContainer>
            <HeaderWithBackButton navigation={navigation} text="Edit Account"/>
            <AccountInfoWrapper 
                navigation={navigation} 
                reelayDBUser={reelayDBUser} 
                refreshProfile={refreshProfile} 
            />
        </ViewContainer>
    )
}

const AccountInfoWrapper = ({ navigation, reelayDBUser, refreshProfile }) => {
    const AccountInfoContainer = styled(View)`
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `
    const Divider = styled(View)`
        border-bottom-width: 1px;
        border-bottom-color: #2e2e2e;
        border-style: solid;
        height: 1px;
        opacity: 0.7;
        width: 98%;
        margin-bottom: 15px;
    `

	const initUsername = reelayDBUser.username;
	const usernameRef = useRef(initUsername);
	const usernameInputRef = useRef(null);
	const currentFocus = useRef("");
    const [savingInfo, setSavingInfo] = useState(false);

    const isUsernameValid = async (username) => {
        const usernameHasValidForm = checkUsername(username);

        if (!usernameHasValidForm) {
            console.log('Usernames must be between 4 and 16 characters, alphanumeric. Separators .+_- are okay');
            showErrorToast('Invalid username');
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
        } else if (username!==reelayDBUser.username) {
            console.log('That username is already taken');
            showErrorToast('That username is already taken');
            return false;
        }
    }

    const saveInfo = async () => {
        setSavingInfo(true);
        const usernameIsValid = await isUsernameValid(usernameRef.current.trim());
		if (usernameIsValid && initUsername !== usernameRef.current.trim() && usernameRef.current.trim() !== "") {
			const usernameUpdatedSuccessfully = await updateUsername(reelayDBUser.sub, usernameRef.current.trim());
			if (!usernameUpdatedSuccessfully) {
                setSavingInfo(false);
				return false;
			}
            logAmplitudeEventProd('changedUsername', {
                userSub: reelayDBUser.sub,
                oldUsername: reelayDBUser.username,
                newUsername: usernameRef.current.trim(),
            });
			reelayDBUser.username = usernameRef.current.trim();
            navigation.goBack();
            refreshProfile();
		} else if (!usernameIsValid && initUsername !== usernameRef.current.trim() && usernameRef.current.trim() !== "") {
            setSavingInfo(false);
			return false;
		}
        showMessageToast("Account information saved!")
        setSavingInfo(false);
        return true;
    }
    const cancelOnPress = () => {
        navigation.pop();
    }

    return (
        <AccountInfoContainer>
            <Divider />
            <AlignmentContainer>
                <EditUsername usernameRef={usernameRef} usernameInputRef={usernameInputRef} currentFocus={currentFocus} />
            </AlignmentContainer>
            <BottomButtonsContainer>
                <SaveButton saveInfo={saveInfo} savingInfo={savingInfo} />
                <CancelButton cancelOnPress={cancelOnPress} />
            </BottomButtonsContainer>
        </AccountInfoContainer>
    )
}


const EditUsername = ({ usernameRef, usernameInputRef, currentFocus }) => {
    const UsernameInputContainerStyle = {
        marginBottom: -5,
        width: "100%",
    };
    const AuthInputAtIconStyle = {
        color: "white",
        name: "at",
        type: "ionicon",
        size: 20,
    };

	const changeInputText = async (text) => {
		usernameRef.current=text;
	};

	const usernameOnPress = () => {
		usernameInputRef.current.focus(); 
		currentFocus.current='username';
	}

	return (
        <>
            <SectionTitleContainer>
                <SectionTitleText>{"Username"}</SectionTitleText>
            </SectionTitleContainer>

            <InputContainer onPress={usernameOnPress}>
                <UsernameInput
                    autoCorrect={false}
                    autoComplete='none'
                    autoCapitalize="none"
                    containerStyle={UsernameInputContainerStyle}
                    leftIcon={AuthInputAtIconStyle}
                    ref={usernameInputRef}
                    maxLength={25}
                    defaultValue={usernameRef.current}
                    placeholder={"lukeskywalker"}
                    placeholderTextColor={"gray"}
                    onChangeText={changeInputText}
                    onPressOut={Keyboard.dismiss()}
                    returnKeyLabel="return"
                    returnKeyType="default"
                />  
            </InputContainer>

            <UsernameInstructionContainer>
                <UsernameInstructionText>
                    {'Usernames must be between 4 and 16 characters, \
                        alphanumeric, and start with letters. Separators \
                        \n.+_- are okay.'}
                </UsernameInstructionText>
            </UsernameInstructionContainer>
        </>
  );
};

const SaveButton = ({saveInfo, savingInfo}) => {
    return (
        <SaveInfoButtonContainer>
            <Button
                text={savingInfo ? "Saving..." : "Save"}
                onPress={saveInfo}
                disabled={savingInfo}
                backgroundColor={ReelayColors.reelayBlue}
                fontColor="white"
                borderRadius="26px"
            />
        </SaveInfoButtonContainer>
    )
}

const CancelButton = ({cancelOnPress}) => {
    return (
        <SaveInfoButtonContainer>
            <Button
                text={"Cancel"}
                onPress={cancelOnPress}
                backgroundColor="white"
                fontColor={ReelayColors.reelayBlack}
                borderRadius="26px"
            />
        </SaveInfoButtonContainer>
    )
}
