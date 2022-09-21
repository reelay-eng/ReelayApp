import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, TouchableOpacity, View } from "react-native";
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

const ButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.backgroundColor ?? 'black'};
    border-radius: 10px;
    height: 100%;
    justify-content: center;
    width: 100%;
`
const ButtonContainer = styled(View)`
    align-items: center;
	height: 56px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: 100%;
`
const ButtonsFlexContainer = styled(View)`
    height: 85%;
    width: 95%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const ButtonGradient = styled(LinearGradient)`
    border-radius: 10px;
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
const SignUpIsVisible = false && process.env.NODE_ENV !== 'production';

export default SignedOutScreen = ({ navigation, route }) => {
    // const autoSignInAsGuest = route?.params?.autoSignInAsGuest ?? false;
    const { setCognitoUser } = useContext(AuthContext);
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(false);
    const signUpFromGuest = useSelector(state => state.signUpFromGuest);
    const dispatch = useDispatch();

    const SignUpButton = () => (
        <ButtonContainer>
            <ButtonPressable backgroundColor={ReelayColors.reelayGreen} onPress={() => navigation.push('SignUpScreen')}>
                <ButtonText color='white'>{'[Dev] – Sign up'}</ButtonText>
            </ButtonPressable>
        </ButtonContainer>
    );

    const LogInButton = () => (
		<ButtonContainer>
            <ButtonPressable backgroundColor='transparent' activeOpacity={0.7} onPress={() => navigation.push('SignInScreen')}>
                <ButtonText fontSize="17px">{'I already have a password'}</ButtonText>
            </ButtonPressable>
		</ButtonContainer>
	);

    const JustShowMeButton = () => (
		<ButtonContainer>
            <ButtonPressable onPress={justShowMeLogin} activeOpacity={0.8}>
                <ButtonGradient 
                    colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <ButtonOverlineText color='white'>{'Just show me the app'}</ButtonOverlineText>
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
        } catch (error) {
            console.log(error);
            showErrorToast('Oh no! We couldn\'t guest you in. Try again or contact support@reelay.app');
            setSigningInJustShowMe(false);
        }
    }

    // useEffect(() => {
    //     if (autoSignInAsGuest) justShowMeLogin();
    // }, []);

    useEffect(() => {
        if (signUpFromGuest) {
            navigation.push('SignUpScreen');
            dispatch({ type: 'setSignUpFromGuest', payload: false });
        }
    });

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
                        />
                        <Spacer height='20px' />
                        <BarHeader />
                        <Spacer height='20px' />
                        { SignUpIsVisible && <SignUpButton /> }
                        <JustShowMeButton />
                    </ButtonsFlexContainer>
                    <LogInButton />
                </>
            )}
        </Container>
)
}



