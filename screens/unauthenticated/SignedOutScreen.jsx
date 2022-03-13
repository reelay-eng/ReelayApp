import React, { useContext } from "react";
import { Image, ImageBackground, View } from "react-native";
import { Button } from '../../components/global/Buttons';
import ReelayColors from "../../constants/ReelayColors";
import styled from "styled-components/native";

import ReelaySplashBackground from "../../assets/images/reelay-splash-background.png";
import ReelayLogoText from "../../assets/images/reelay-logo-text.png";

import Amplify, { Auth } from "aws-amplify";
import { AuthContext } from "../../context/AuthContext";
import { showErrorToast } from "../../components/utils/toasts";

const Container = styled(View)`
    width: 100%;
    height: 100%;
`

const ReelayBackground = styled(ImageBackground)`
    width: 100%;
    height: 100%;
`

const ReelayLogoContainer = styled(View)`
    position: absolute;
    height: 70%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

const ButtonsFlexContainer = styled(View)`
    position: absolute;
    height: 100%;
    padding-bottom: 50px;
    width: 100%;
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
`;

export default SignedOutScreen = ({ navigation }) => {
    const { setCognitoUser } = useContext(AuthContext);

    const SignUpButton = () => (
        <ButtonContainer>
            <Button
                text="Sign Up"
                onPress={() => navigation.push('SignUpScreen')}
                backgroundColor="white"
                pressedColor="#DCDCDC"
                fontColor={ReelayColors.reelayBlue}
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
            const username = 'be_our_guest';
            const password = 'candelabra';
            const guestCognitoUser = await Auth.signIn({ username, password });     
            setCognitoUser(guestCognitoUser);
        } catch (error) {
            console.log(error);
            showErrorToast('Oh no! We couldn\'t guest you in. Try again or contact support@reelay.app');
        }
    }

    return (
        <Container>
            <ReelayBackground source={ReelaySplashBackground} resizeMode="cover">
                <ReelayLogoContainer>
                    <Image source={ReelayLogoText} style={{width: 187, height: 157}} />
                </ReelayLogoContainer>
                <ButtonsFlexContainer>
                    <SignUpButton />
                    <LogInButton />
                    <JustShowMeButton />
                </ButtonsFlexContainer>
            </ReelayBackground>
        </Container>
    )
}



