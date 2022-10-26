import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, TouchableOpacity, View } from "react-native";
import { Auth } from "aws-amplify";
import { Button } from '../../components/global/Buttons';
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from '../../components/global/Text';
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import SocialLoginBar from "../../components/auth/SocialLoginBar";

import ReelayLogoText from "../../assets/images/reelay-logo-text-with-dog.png"

import { AuthContext } from "../../context/AuthContext";
import { showErrorToast } from "../../components/utils/toasts";
import { useDispatch, useSelector } from "react-redux";
import ModalMenu from "../../components/global/ModalMenu";

const ButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.backgroundColor ?? 'black'};
    border-radius: 24px;
    height: 100%;
    justify-content: center;
    width: 100%;
`
const ButtonContainer = styled(View)`
    align-items: center;
	height: 48px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: 100%;
`
const ButtonsFlexContainer = styled(View)`
    height: 85%;
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const ButtonGradient = styled(LinearGradient)`
    border-radius: 24px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ButtonText = styled(ReelayText.Body2Emphasized)`
    font-family: Outfit-Medium;
    color: ${props => props.color ?? ReelayColors.reelayBlue};
    font-size: ${props => props.fontSize ?? "14px"};
`

const ButtonOverlineText = styled(ReelayText.Overline)`
    color: ${props => props.color ?? ReelayColors.reelayBlue};
    font-size: 13px;
`

const LoadingContainer = styled(View)`
    position: absolute;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
`

const Container = styled(View)`
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: black;
`

const BarHeaderContainer = styled(View)`
    display: flex;
    flex-direction: row;
    width: 90%;
    align-items: center;
    justify-content: space-between;
    opacity: 0.6;
`

const Bar = styled(View)`
    background-color: white;
    height: 1px;
    width: 30%;
`

const BarText = styled(ReelayText.Overline)`
    color: white;
`

const BarHeader = () => {
    return (
        <BarHeaderContainer>
            <Bar />
            <BarText>OR</BarText>
            <Bar />
        </BarHeaderContainer>
    )
}

const Spacer = styled(View)`
    height: ${props => props.height ?? "40px"};
`
const DevSignUpIsVisible = process.env.NODE_ENV !== 'production';

const SigningInOuterContainer = styled(View)`
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    justify-content: center;
    align-items: center;
`
const SigningInContainer = styled(View)`
    background-color: #0d0d0d;
    border-radius: 20px;
    width: 80%;
    justify-content: center;
    align-items: center;
`
const SigningInIndicator = () => {
    return (
        <SigningInOuterContainer>
            <SigningInContainer>
                <ButtonText color='white' style={{fontSize: 20, lineHeight: 24}}>Just a moment</ButtonText>
                <Spacer height='15%' />
                <ActivityIndicator size="large" color='white' />
            </SigningInContainer>
        </SigningInOuterContainer>
    )
}

export default SignedOutScreen = ({ navigation, route }) => {
    // const autoSignInAsGuest = route?.params?.autoSignInAsGuest ?? false;
    const { setCognitoUser } = useContext(AuthContext);
    const [passwordMenuVisible, setPasswordMenuVisible] = useState(false);
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(false);
    const [signingInSocial, setSigningInSocial] = useState(false);
    const dispatch = useDispatch();


    const LogInButton = () => (
		<ButtonContainer>
            <ButtonPressable backgroundColor='transparent' activeOpacity={0.7} onPress={() => setPasswordMenuVisible(true)}>
                <ButtonText fontSize="17px">{'Use a password'}</ButtonText>
            </ButtonPressable>
		</ButtonContainer>
	);

    const JustShowMeButton = () => (
		<ButtonContainer>
            <ButtonPressable onPress={justShowMeLogin} activeOpacity={0.8}>
                <ButtonGradient 
                    colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <ButtonOverlineText color='white'>{'Just show me the app'}</ButtonOverlineText>
            </ButtonPressable>
		</ButtonContainer>
	);
    
    const justShowMeLogin = async () => {
        try {
            setSigningInJustShowMe(true);
            const guestCognitoUser = await Auth.signIn('be_our_guest', 'candelabra');                 
            const cognitoSession = await Auth.currentSession();
            setCognitoUser(guestCognitoUser);
            dispatch({ type: 'setAuthSessionFromCognito', payload: cognitoSession });
        } catch (error) {
            console.log(error);
            showErrorToast('Oh no! We couldn\'t guest you in. Try again or contact support@reelay.app');
            setSigningInJustShowMe(false);
        }
    }

    const closePasswordMenu = () => setPasswordMenuVisible(false);
    const signUpWithPassword = () => {
        closePasswordMenu();
        navigation.push('SignUpScreen');
    }
    const signInWithPassword = () => {
        closePasswordMenu();
        navigation.push('SignInScreen');
    }

    return (
        <Container>
            { signingInJustShowMe && (
                <LoadingContainer>
                    <ActivityIndicator color={'white'} /> 
                </LoadingContainer>
            )}
            { !signingInJustShowMe && (
                <>
                    <ButtonsFlexContainer>
                        <Image source={ReelayLogoText} style={{height: '25%'}} resizeMode="contain"/>
                        <Spacer height="10%" />
                        <SocialLoginBar 
                            navigation={navigation}
                            setSigningIn={setSigningInSocial}
                        />
                        <Spacer height='20px' />
                        <BarHeader />
                        <Spacer height='20px' />
                        <JustShowMeButton />
                    </ButtonsFlexContainer>
                    { !passwordMenuVisible && <LogInButton /> }
                    { passwordMenuVisible && (
                        <ModalMenu
                            closeMenu={closePasswordMenu}
                            menuOptions={[
                                { text: 'Sign up with password', action: signUpWithPassword},
                                { text: 'I already have a password', action: signInWithPassword},
                            ]}
                        />
                    )}
                </>
            )}
            { (signingInSocial || signingInJustShowMe) && <SigningInIndicator />}
        </Container>
)
}



