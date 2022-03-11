import React from "react";
import {
	Image,
    View,
    ImageBackground
} from "react-native";
import { Button } from '../../components/global/Buttons';
import ReelayColors from "../../constants/ReelayColors";
import styled from "styled-components/native";

import ReelaySplashBackground from "../../assets/images/reelay-splash-background.png";
import ReelayLogoText from "../../assets/images/reelay-logo-text.png";


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

    const SignUpButton = () => (
        <ButtonContainer>
            <Button
                text="Sign Up!"
                onPress={() => navigation.push('SignUpScreen')}
                backgroundColor="white"
                pressedColor="#DCDCDC"
                fontColor={ReelayColors.reelayBlue}
                borderRadius="60px"
            />
        </ButtonContainer>
    )
    const LogInButton = () => (
		<ButtonContainer>
			<Button
				text="Log In"
				onPress={() => navigation.push('SignInScreen')}
				backgroundColor="transparent"
				pressedColor="rgba(0, 0, 0, 0.05)"
				fontColor="white"
				borderRadius="60px"
				border="solid 1px white"
			/>
		</ButtonContainer>
	);
    

    return (
        <Container>
            <ReelayBackground source={ReelaySplashBackground} resizeMode="cover">
                <ReelayLogoContainer>
                    <Image source={ReelayLogoText} style={{width: 187, height: 157}} />
                </ReelayLogoContainer>
                <ButtonsFlexContainer>
                    <SignUpButton />
                    <LogInButton />
                </ButtonsFlexContainer>
            </ReelayBackground>
        </Container>
    )
}



