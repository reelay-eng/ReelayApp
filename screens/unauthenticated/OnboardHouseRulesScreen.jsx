import React, { useContext, useState } from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import HouseRules from '../../components/global/HouseRules';
import { HeaderWithBackButton } from '../../components/global/Headers';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { registerUser, searchUsers } from '../../api/ReelayDBApi';
import { showErrorToast } from '../../components/utils/toasts';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { registerSocialAuthAccount, saveAndRegisterSocialAuthSession } from '../../api/ReelayUserApi';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
const { width } = Dimensions.get('window');

const HouseRulesWrapper = styled(View)`
    padding-left: 20px;
    padding-right: 20px;
`
const JoinPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 24px;
    height: 48px;
    justify-content: center;
    width: ${width - 16}px;
`
const JoinText = styled(ReelayText.Overline)`
    color: black;
    font-size: 12px;
`
const JoinWrapper = styled(View)`
    align-items: center;
    background-color: black;
    bottom: ${props => props.bottomOffset}px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: absolute;
    width: 100%;
`
const ProgressDot = styled(View)`
    background-color: ${props => props.completed ? ReelayColors.reelayBlue : 'gray'};
    border-radius: 4px;
    height: 8px;
    margin: 4px;
    width: 8px;
`
const ProgressDotsView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const ScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: ${props => props.topOffset}px;
`

const ProgressDots = () => {
    return (
        <ProgressDotsView>
            <ProgressDot completed={true} />
            <ProgressDot completed={true} />
            <ProgressDot completed={true} />
        </ProgressDotsView>
    );
}

export default OnboardHouseRulesScreen = ({ navigation, route }) => {
    const { 
        appleUserID, 
        authSession, 
        email, 
        fullName, 
        googleUserID, 
        method, 
        password, 
        selectedVenues, 
        username,
    } = route?.params;

    const { setReelayDBUserID } = useContext(AuthContext);
    const [signingIn, setSigningIn] = useState(false);
    const bottomOffset = useSafeAreaInsets().bottom;
    const topOffset = useSafeAreaInsets().top + 16;

    // todo: register streaming services

    const completeSignUp = async () => {
        setSigningIn(true);
        const canSignUp = await confirmUsernameNotTaken(username);
        if (!canSignUp) {
            setSigningIn(false);
            return;
        }

        logAmplitudeEventProd('signUp', { email, username });
        console.log('Signing up...');

        if (method === 'apple' || method === 'google') {
            await completeSignUpSocial();
        } else if (method === 'cognito') {
            await completeSignUpCognito();
        } else {
            console.log('No valid signup method specified');
        }
    }

    const completeSignUpCognito = async () => {
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
    }

    const completeSignUpSocial = async () => {
        const authAccountObj = await registerSocialAuthAccount({ 
            appleUserID,
            email, 
            fullName, 
            googleUserID, 
            method, 
        });    
        const { reelayDBUserID } = authAccountObj;
        const completeSignUpResult = await registerUser({ email, username, sub: reelayDBUserID });
        console.log('complete signup result: ', completeSignUpResult);

        setReelayDBUserID(reelayDBUserID);
        await saveAndRegisterSocialAuthSession({ authSession, method, reelayDBUserID });
    }

    const confirmUsernameNotTaken = async () => {
        const partialMatchingUsers = await searchUsers(username);
        if (partialMatchingUsers?.error) {
            return false;
        }

        const usernamesMatch = (userObj) => (userObj.username === username);
        const fullMatchIndex = await partialMatchingUsers.findIndex(usernamesMatch);
        if (fullMatchIndex === -1) {
            return true;
        } else {
            showErrorToast('Ruh roh! That username is already taken');
            return false;
        }
    }

    return (
        <ScreenView>
            <Spacer topOffset={topOffset} />
            <HeaderWithBackButton navigation={navigation} text={'back'} />
            <ProgressDots />
            <Spacer topOffset={20} />

            <HouseRulesWrapper>
                <HouseRules />
            </HouseRulesWrapper>

            <JoinWrapper bottomOffset={bottomOffset}>
                <JoinPressable onPress={completeSignUp} disabled={signingIn}>
                    { !signingIn && <JoinText>{'Join Reelay'}</JoinText> }
                    { signingIn && <ActivityIndicator /> }
                </JoinPressable>
            </JoinWrapper>
        </ScreenView>
    )
}