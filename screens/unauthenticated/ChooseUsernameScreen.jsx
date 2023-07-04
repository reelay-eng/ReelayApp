import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, KeyboardAvoidingView, Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { Icon, Input } from 'react-native-elements';

import { Auth } from 'aws-amplify';
import { checkUsername } from '../../components/utils/ValidUsernameCheck';
import { getUserByReferral, registerUser, searchUsers } from '../../api/ReelayDBApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerSocialAuthAccount, saveAndRegisterSocialAuthSession } from '../../api/ReelayUserApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { showErrorToast } from '../../components/utils/toasts';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { KeyboardHidingBlackContainer } from './SignInScreen';

const { height, width } = Dimensions.get('window');

const ContinuePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 24px;
    height: 48px;
    margin;bottom:10px;
    justify-content: center;
    width: ${width - 16}px;
`
const ContinueText = styled(ReelayText.Overline)`
    color: black;
    font-size: 12px;
`
const ContinueWrapper = styled(KeyboardAvoidingView)`
    align-items: center;
    background-color: black;
    bottom: 24px;
    padding-top: 12px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    position: absolute;
    width: 100%;
`
const InputView = styled(View)`
    align-items: center;
    height: 84px;
    width: 100%;
`
const KeyboardDismisser = styled(Pressable)`
    display: flex;
    flex: 1;
`
const UsernameTextInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Bold;
    font-size: 28px;
    font-style: bold;
    letter-spacing: 0.15px;
    line-height: 36px;
    padding: 24px;
`
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
const AuthInputFirstNameIconStyle = {
    color: "white",
    name: "person-outline",
    type: "ionicon",
};
const AuthInputUserIconStyle = {
    color: "white",
    name: "person-circle-outline",
    type: "ionicon",
};
const AuthInputReferIconStyle = {
    color: "white",
    name: "person-add-outline",
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
const Spacer = styled(View)`
    height:20%;
`

export default ChooseUsernameScreen = ({ navigation, route }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const topOffset = useSafeAreaInsets().top + 16;

    const { authSession, method, email, fullName, googleUserID, appleUserID, password } = route?.params;
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const { setReelayDBUserID } = useContext(AuthContext);
    const [firstName, setFirstName] = useState(fullName ? fullName.givenName : '');
    const [firstnameFieldActive, setFirstNameFieldActive] = useState(false);
    const showFirstNameError = firstName.length < 0;

    const [lastName, setLastName] = useState(fullName ? fullName.familyName : '');
    const [lastnameFieldActive, setLastNameFieldActive] = useState(false);
    const showLasttNameError = lastName.length < 0;

    const [userName, setUserName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [usernameFieldActive, setUserNameFieldActive] = useState(false);
    const [referralFieldActive, setReferralFieldActive] = useState(false);
    const showUserNameError = userName.length < 0;

    const inputUsernameRef = useRef('');

    const continueSignUp = async () => {
        setIsCheckingUsername(true);
        const canSignUp = await isUsernameValid();
        if (!canSignUp) {
            setIsCheckingUsername(false);
            return;
        }
        if(referralCode !== ""){
            const matchingReferral = await getUserByReferral(referralCode);
            if (matchingReferral?.error) {
                if(matchingReferral?.error == "Referralcode not found"){
                    setIsCheckingUsername(false);
                    showErrorToast('Ruh roh! Referral code you entered is incorrect');
                    return false;
                }
            }
        }
                setIsCheckingUsername(false);
                // navigation.push('SelectMyStreamingScreen', {
                //     appleUserID,
                //     authSession,
                //     email,
                //     fullName,
                //     googleUserID,
                //     method,
                //     password,
                //     // username: inputUsernameRef.current,
                //     username: userName,
                //     firstName,
                //     lastName,
                //     referralCode
                // });
                navigation.push('OnboardHouseRulesScreen', {
                    appleUserID,
                    authSession,
                    email,
                    fullName,
                    googleUserID,
                    method,
                    password,
                    selectedVenues: [],
                    username: userName,
                    firstName,
                    lastName,
                    referralCode
                });
    }

    const isUsernameValid = async () => {
        // const usernameToCheck = inputUsernameRef.current;
        if (firstName == "") {
            showErrorToast('Ruh roh! FirstName has an invalid format. It should not be blank');
            return false;
        }
        if (lastName == "") {
            showErrorToast('Ruh roh! LastName has an invalid format. It should not be blank');
            return false;
        }
        const usernameHasValidForm = checkUsername(userName);
        if (!usernameHasValidForm) {
            showErrorToast('Ruh roh! Username has an invalid format. See instructions below');
            return false;
        }
        const partialMatchingUsers = await searchUsers(userName);
        if (partialMatchingUsers?.error) {
            return false;
        }

        const usernamesMatch = (userObj) => {
            const matchUsernameUpper = userObj.username.toUpperCase();
            const checkUsernameUpper = userName.toUpperCase();
            return (checkUsernameUpper === matchUsernameUpper);
        }
        const fullMatchIndex = await partialMatchingUsers.findIndex(usernamesMatch);
        if (fullMatchIndex === -1) {
            return true;
        } else {
            showErrorToast('Ruh roh! That username is already taken');
            return false;
        }
    }


    return (
        <KeyboardHidingBlackContainer onPress={Keyboard.dismiss}>
                <HeaderWithBackButton navigation={navigation} text={'sign up'} />
                <Spacer />
                <KeyboardAvoidingView behavior='padding' style={{flex: 1 }} bottomOffset={bottomOffset}>
                <AlignmentContainer>
				<InputContainer>
                <AuthInput
						autoComplete="firstname"
						containerStyle={AuthInputContainerStyle(firstnameFieldActive || showFirstNameError)}
						onFocus={() => setFirstNameFieldActive(true)}
						onBlur={() => setFirstNameFieldActive(false)}
						placeholder={"First name"}
						onChangeText={setFirstName}
						leftIcon={AuthInputFirstNameIconStyle}
						rightIcon={showFirstNameError ? AuthInputWarningIconStyle : null}
                        textContentType='firstname'
						value={firstName}
					/>
                    <AuthInput
						autoComplete="lastname"
						containerStyle={AuthInputContainerStyle(lastnameFieldActive || showLasttNameError)}
						onFocus={() => setLastNameFieldActive(true)}
						onBlur={() => setLastNameFieldActive(false)}
						placeholder={"Last name"}
						onChangeText={setLastName}
						leftIcon={AuthInputFirstNameIconStyle}
						rightIcon={showLasttNameError ? AuthInputWarningIconStyle : null}
                        textContentType='lastname'
						value={lastName}
					/>
                    <AuthInput
						autoComplete="username"
						containerStyle={AuthInputContainerStyle(usernameFieldActive || showUserNameError)}
						onFocus={() => setUserNameFieldActive(true)}
						onBlur={() => setUserNameFieldActive(false)}
						placeholder={"User name"}
						onChangeText={setUserName}
						leftIcon={AuthInputUserIconStyle}
						rightIcon={showUserNameError ? AuthInputWarningIconStyle : null}
                        textContentType='username'
						value={userName}
					/>
                    <AuthInput
						autoComplete="referralcode"
						containerStyle={AuthInputContainerStyle(referralFieldActive)}
						onFocus={() => setReferralFieldActive(true)}
						onBlur={() => setReferralFieldActive(false)}
						placeholder={"Referral Code"}
						onChangeText={setReferralCode}
						leftIcon={AuthInputReferIconStyle}
						rightIcon={showUserNameError ? AuthInputWarningIconStyle : null}
                        textContentType='referralcode'
						value={referralCode}
					/>
                     {/* <AuthInput
						autoComplete="username"
						containerStyle={AuthInputContainerStyle(usernameFieldActive || showUserNameError)}
						onFocus={() => setUserNameFieldActive(true)}
						onBlur={() => setUserNameFieldActive(false)}
						placeholder={"Referral Code"}
						onChangeText={setUserName}
						leftIcon={AuthInputUserIconStyle}
						rightIcon={showUserNameError ? AuthInputWarningIconStyle : null}
                        textContentType='username'
						value={userName}
					/> */}
                    </InputContainer>

                    <ContinuePressable onPress={continueSignUp} disabled={isCheckingUsername}>
                        { !isCheckingUsername && <ContinueText>{'Continue'}</ContinueText> }
                        { isCheckingUsername && <ActivityIndicator /> }
                    </ContinuePressable>
                    </AlignmentContainer>
                </KeyboardAvoidingView>

        </KeyboardHidingBlackContainer>
    );
}