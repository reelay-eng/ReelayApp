import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, View } from "react-native";
import { Button } from '../../components/global/Buttons';
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from '../../components/global/Text';
import styled from "styled-components/native";

import ReelaySplashBackground from "../../assets/images/reelay-splash-background.png";
import ReelayLogoText from "../../assets/images/reelay-logo-text-with-dog.png";

import { AuthContext } from "../../context/AuthContext";
import { showErrorToast } from "../../components/utils/toasts";

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
const ButtonContainer = styled(View)`
	width: 90%;
	height: 56px;
    margin-top: 8px;
    margin-bottom: 8px;
`
const Container = styled(View)`
    width: 100%;
    height: 100%;
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
const ReelayLogoContainer = styled(View)`
    position: absolute;
    height: 70%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

export default SignedOutScreen = ({ navigation, route }) => {
    const autoSignInAsGuest = route?.params?.autoSignInAsGuest ?? false;
    const { setCognitoUser, signUpFromGuest, setSignUpFromGuest } = useContext(AuthContext);
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(autoSignInAsGuest);

    const SignUpButton = () => (
        <ButtonContainer>
            <Button
                text="Sign Up"
                onPress={() => navigation.push('SignUpScreen')}
                backgroundColor={'rgba(41, 119, 239, 0.9)'}
                pressedColor="#DCDCDC"
                fontColor={'white'}
                borderRadius="60px"
            />
        </ButtonContainer>
    );

    const LogInButton = () => (
		<ButtonContainer>
			<Button
				text="Log In"
				onPress={() => navigation.push('SignInScreen')}
                backgroundColor="white"
                pressedColor="#DCDCDC"
                fontColor={ReelayColors.reelayBlue}
                borderRadius="60px"
			/>
		</ButtonContainer>
	);

    const JustShowMeButton = () => (
		<ButtonContainer>
			<Button
				text="Just show me the app"
				onPress={justShowMeLogin}
				backgroundColor="transparent"
				pressedColor="rgba(0, 0, 0, 0.05)"
				fontColor="white"
				borderRadius="60px"
				border="solid 1px white"
			/>
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
            setSignUpFromGuest(false);
        }
    });

    return (
        <Container>
            <ReelayBackground source={ReelaySplashBackground} resizeMode="cover">
                <ReelayLogoContainer>
                    <Image source={ReelayLogoText} style={{width: 200, height: 200}} />
                </ReelayLogoContainer>
                { signingInJustShowMe && (
                    <LoadingContainer>
                    <ActivityIndicator color={'white'} /> 
                    </LoadingContainer>
                )}
                { !signingInJustShowMe && (
                    <ButtonsFlexContainer>
                        <SignUpButton />
                        <LogInButton />
                        <JustShowMeButton />
                    </ButtonsFlexContainer>
                )}
            </ReelayBackground>
        </Container>
    )
}



