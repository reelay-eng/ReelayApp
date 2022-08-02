import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, TouchableOpacity, View } from "react-native";
import { Button } from '../../components/global/Buttons';
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from '../../components/global/Text';
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import ReelaySplashBackground from "../../assets/images/reelay-splash-with-dog-black.png";

import { AuthContext } from "../../context/AuthContext";
import { showErrorToast } from "../../components/utils/toasts";
import { useDispatch, useSelector } from "react-redux";

const ButtonContainer = styled(View)`
    align-items: center;
	height: 56px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: 100%;
`
const ButtonsFlexContainer = styled(View)`
    position: absolute;
    height: 100%;
    padding-bottom: 50px;
    width: 95%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
`
const ButtonGradient = styled(LinearGradient)`
    border-radius: 30px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.backgroundColor ?? 'black'};
    border-radius: 30px;
    height: 60px;
    justify-content: center;
    width: 100%;
`
const ButtonText = styled(ReelayText.Body2Emphasized)`
    color: ${props => props.color ?? ReelayColors.reelayBlue};
    font-size: ${props => props.fontSize ?? 14}px;
`
const LoadingContainer = styled(View)`
    position: absolute;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;
`
const ReelayBackground = styled(ImageBackground)`
    align-items: center;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: 40px;
`

export default SignedOutScreen = ({ navigation, route }) => {
    const autoSignInAsGuest = route?.params?.autoSignInAsGuest ?? false;
    const { setCognitoUser } = useContext(AuthContext);
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(autoSignInAsGuest);
    const signUpFromGuest = useSelector(state => state.signUpFromGuest);
    const dispatch = useDispatch();

    const SignUpButton = () => (
        <ButtonContainer>
            <ButtonPressable onPress={() => navigation.push('SignUpScreen')}>
                <ButtonGradient 
                    colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <ButtonText color='white'>{'Sign up'}</ButtonText>
            </ButtonPressable>
        </ButtonContainer>
    );

    const LogInButton = () => (
		<ButtonContainer>
            <ButtonPressable backgroundColor='transparent' onPress={() => navigation.push('SignInScreen')}>
                <ButtonText fontSize={16}>{'Log in'}</ButtonText>
            </ButtonPressable>
		</ButtonContainer>
	);

    const JustShowMeButton = () => (
		<ButtonContainer>
            <ButtonPressable backgroundColor='white' onPress={justShowMeLogin}>
                <ButtonText>{'Just show me the app'}</ButtonText>
            </ButtonPressable>
		</ButtonContainer>
	);
    
    const justShowMeLogin = async () => {
        try {
            setSigningInJustShowMe(true);
            const guestCognitoUser = {
                username: 'be_our_guest',
                attributes: {
                    sub: '1cc34e07-36b3-49b8-afc8-f39f827a7600',
                    email: 'support@reelay.app',
                },
            };
            setCognitoUser(guestCognitoUser);
            console.log('Just show me completing: ', guestCognitoUser);
        } catch (error) {
            console.log(error);
            showErrorToast('Oh no! We couldn\'t guest you in. Try again or contact support@reelay.app');
            setSigningInJustShowMe(false);
        }
    }

    useEffect(() => {
        if (autoSignInAsGuest) justShowMeLogin();
    }, []);

    useEffect(() => {
        if (signUpFromGuest) {
            navigation.push('SignUpScreen');
            dispatch({ type: 'setSignUpFromGuest', payload: false });
        }
    });

    return (
        <ReelayBackground source={ReelaySplashBackground} resizeMode="cover">
            { signingInJustShowMe && (
                <LoadingContainer>
                <ActivityIndicator color={'white'} /> 
                </LoadingContainer>
            )}
            { !signingInJustShowMe && (
                <ButtonsFlexContainer>
                    <LogInButton />
                    <Spacer />
                    <SignUpButton />
                    <JustShowMeButton />
                </ButtonsFlexContainer>
            )}
        </ReelayBackground>
)
}



