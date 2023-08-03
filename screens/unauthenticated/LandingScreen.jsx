import React, { useContext, useEffect, useRef, useState } from 'react';
import ReelayLoanding from "../../assets/images/Landing/landing.png";
import styled from 'styled-components';
import { View, ImageBackground,Image, Dimensions, Text, Pressable, TouchableOpacity,ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
const { height, width } = Dimensions.get('window');
import * as ReelayText from '../../components/global/Text';
import ReelayLogoText from "../../assets/images/dog-with-glasses.png"
import ReelayColors from '../../constants/ReelayColors';
import { LinearGradient } from "expo-linear-gradient";
import { Auth } from "aws-amplify";
import { showErrorToast } from '../../components/utils/toasts';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment, { min } from 'moment';
import SocialLoginBar from '../../components/auth/SocialLoginBar';

const LogoText = styled(ReelayText.H4Bold)`
    color: white;
    margin: 3px;
    text-align:center;
    line-height:45px;
`
const MiddleText = styled(ReelayText.H5Bold)`
color: white;
margin: 3px;
text-align:center;
line-height:45px;
`
const SkipText = styled(ReelayText.CaptionEmphasized)`
color: white;
margin: 3px;
`

const ButtonsFlexContainer = styled(View)`
    height: 100%;
    width: 90%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Spacer = styled(View)`
    height: ${props => props.height ?? "40px"};
`

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
    margin-top:10px;
    align-items: center;
    justify-content: center;
`
const DevSignUpIsVisible = process.env.NODE_ENV !== 'production';

const SigningInOuterContainer = styled(View)`
    position: absolute;
    width: 100%;
    height: 100%;
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

export default LandingScreen = ({ navigation }) => {
    const scrollViewRef = useRef();
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(false);
    const { setCognitoUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const [signingInSocial, setSigningInSocial] = useState(false);

    useEffect(()=>{
        markFirstTime()
    },[])

    const markFirstTime = async () => {
        try {
            await AsyncStorage.setItem('checkFirstTimeLogin', moment().toISOString());
            dispatch({ type: 'setFirstTimeLogin', payload: true });
        } catch (error) {
            console.log(error);
            return true;
        }
    }

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

    
const SigningInIndicator = () => {
    return (
        <SigningInOuterContainer>
            <SigningInContainer>
                <ButtonText color='white' style={{fontSize: 20, lineHeight: 24}}>Just a moment</ButtonText>
                <Spacer height='15%' />
                <ActivityIndicator color='white' />
            </SigningInContainer>
        </SigningInOuterContainer>
    )
}

    const JustShowMeButton = () => {
        return(
             signingInJustShowMe ? 
                <LoadingContainer>
                    <ActivityIndicator color={'white'} /> 
                </LoadingContainer>
            :
            <ButtonContainer>
            <ButtonPressable onPress={justShowMeLogin} backgroundColor={"#fff"} activeOpacity={0.8}>
                <ButtonText color='black'>{'JUST SHOW ME THE APP'}</ButtonText>
            </ButtonPressable>
        </ButtonContainer>
     )
    }

    const SignUpButton = () => {
        return(

            <ButtonContainer>
            <ButtonPressable onPress={()=>navigation.push('SignUpScreen')} activeOpacity={0.8}>
                <ButtonGradient 
                    colors={[ ReelayColors.reelayRed,ReelayColors.reelayBlue]}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <ButtonOverlineText color='white'>{'Sign up'}</ButtonOverlineText>
            </ButtonPressable>
        </ButtonContainer>
        )
    }

    

    return (
		<ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{alignItems: 'center'}}
        >
            <ImageBackground source={ReelayLoanding} resizeMode='contain'
                style={{ width:width,margin:0, height: 3200, }} imageStyle={{opacity:0.6 }} >
                    
                    <View style={{height:height, justifyContent:"center",alignItems:"center"}}>
                        <MiddleText>{"On Reelay we talk\nabout movies\n& TV Shows"}</MiddleText>
                        <Pressable onPress={()=>scrollViewRef.current.scrollToEnd()} style={{marginBottom:30,bottom:0,alignSelf:"center",position:"absolute"}}>
                            <FontAwesomeIcon style={{alignSelf:"center"}} icon={faChevronDown} color='white' size={22} />
                                <SkipText>Skip</SkipText>
                        </Pressable>
                    </View>

                    <View style={{height:height-100, justifyContent:"center",alignItems:"center"}}>
                        <MiddleText>{"A Reelay is\nshort video review\ncreated by fans\nlike you"}</MiddleText>
                    </View>
                    
                    <View style={{height:height-50, justifyContent:"center",alignItems:"center"}}>
                        <MiddleText>{"Record your\nown reelay"}</MiddleText>
                    </View>

                    <View style={{height:height, justifyContent:"center",alignItems:"center"}}>
                        <MiddleText>{"Share your\nReviews\n& Watchlists"}</MiddleText>
                    </View>

                   
            </ImageBackground>
            <View style={{height:height,}}>
                <ButtonsFlexContainer>
                        <View style={{height:"65%",justifyContent:"center"}}>
                            <LogoText>{"Welcome to Reelay"}</LogoText>
                            <Spacer height="20%" />
                            <Image source={ReelayLogoText} style={{height: '20%'}} resizeMode="contain"/>
                        </View>
                        <View style={{height:"35%",width:width-20}}>
                        <Pressable style={{alignItems:"center",marginBottom:5}} onPress={() => navigation.push('SignInScreen')}>
                                <ButtonText fontSize="17px">{'Sign In'}</ButtonText>
                        </Pressable>
                        <SignUpButton/>
                        <JustShowMeButton/>
                        <SocialLoginBar
                            navigation={navigation}
                            setSigningIn={setSigningInSocial}
                            boarding={true}
                        />
                        
                        </View>

                    { (signingInSocial || signingInJustShowMe) &&
                    <SigningInIndicator />
                     }
                    </ButtonsFlexContainer>
                    
                    </View>
        </ScrollView>
	);
}