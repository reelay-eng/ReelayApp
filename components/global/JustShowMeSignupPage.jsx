import React, { Fragment, useContext, useEffect } from 'react';
import { Image, Pressable, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import BackButton from '../utils/BackButton';
import styled from 'styled-components/native';
import * as ReelayText from './Text';
import ReelayColors from '../../constants/ReelayColors';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { clearLocalUserData } from '../../api/ReelayUserApi';

import { logAmplitudeEventProd } from '../utils/EventLogger';

export default JustShowMeSignupPage = ({ fullPage = true, headerText = 'Join Reelay' }) => {
    const { 
        reelayDBUser,
        setReelayDBUserID, 
        setSignedIn,
        setSignUpFromGuest,
        signUpFromGuest,
    } = useContext(AuthContext);

    const BottomContainer = styled(View)`
        align-items: center;
        width: 100%;
    `
    const DogWithGlassesImage = styled(Image)`
        height: 200px;
        width: 200px;
    `
    const DogWithGlassesContainer = styled(View)`
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        width: 100%;
    `
    const ExplainText = styled(ReelayText.Body2Emphasized)`
        color: white;
        margin-bottom: 20px;
        text-align: center;
        width: 75%;
    `
    const HeaderText = styled(ReelayText.H5)`
        color: white;
        text-align: center;
    `
    const JustShowMeContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: space-around;
        display: flex;
        height: 100%;
        margin: 10px;
    `
    const ExitButton = styled(Pressable)`
        align-items: center;
        background-color: white;
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        margin-top: 10px;
        width: 90%;
    `
    const ExitText = styled(ReelayText.CaptionEmphasized)`
        color: black;
        text-align: center;
    `
    const SignUpButton = styled(Pressable)`
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        margin-bottom: ${(fullPage) ? 0 : 40}px;
        width: 90%;
    `
    const SignUpText = styled(ReelayText.CaptionEmphasized)`
        color: white;
        text-align: center;
    `
    const TopContainer = styled(View)`
        align-items: center;
        justify-content: center;
        width: 100%;
    `

    const goToSignUp = async () => {
        try {
            logAmplitudeEventProd('guestGoToSignUp', {
                username: reelayDBUser?.username,
                email: reelayDBUser?.email,
            });
    
            if (!signUpFromGuest) setSignUpFromGuest(true);
            const signOutResult = await Auth.signOut();
            setSignedIn(false);
            setReelayDBUserID(null);
            // todo: deregister for push tokens
            // todo: deregister cognito user
            console.log(signOutResult);
            await clearLocalUserData();
        } catch (error) {
            console.log(error);
        }
    }

    const exitGuestAccount = async () => {
        try {
            logAmplitudeEventProd('guestExit', {
                username: reelayDBUser?.username,
                email: reelayDBUser?.email,
            });
    
            if (signUpFromGuest) setSignUpFromGuest(false);
            const signOutResult = await Auth.signOut();
            setSignedIn(false);
            setReelayDBUserID(null);
            console.log(signOutResult);
            await clearLocalUserData();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={{ justifyContent: 'center', flex: 1 }}>
            <JustShowMeContainer>
                <TopContainer>
                    <HeaderText>{headerText}</HeaderText>
                    <DogWithGlassesContainer>
                        <DogWithGlassesImage source={DogWithGlasses} />
                    </DogWithGlassesContainer>
                    <ExplainText>
                        {'For this feature to work, we need to sign you up. It takes seconds!'}
                    </ExplainText>
                </TopContainer>
                <BottomContainer>
                    <SignUpButton onPress={goToSignUp}>
                        <SignUpText>{'Sign up'}</SignUpText>
                    </SignUpButton>
                    { fullPage && (
                        <ExitButton onPress={exitGuestAccount}>
                            <ExitText>{'Exit'}</ExitText>
                        </ExitButton>
                    )}
                </BottomContainer>
            </JustShowMeContainer>
        </View>
    );
}