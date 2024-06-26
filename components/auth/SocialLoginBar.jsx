import React, { useContext, useEffect } from "react";
import { Pressable, View, TouchableOpacity, Text, Image } from "react-native";
import styled from "styled-components/native";
import { Icon } from "react-native-elements";
import Constants from "expo-constants";

import * as Google from 'expo-auth-session/providers/google';
import * as Apple from 'expo-apple-authentication';
import { fetchResults } from "../../api/fetchResults";
import { AuthContext } from "../../context/AuthContext";

import GoogleImage from "../../assets/icons/social/google.png";
import AppleImage from "../../assets/icons/social/Apple.png";

import { useDispatch } from 'react-redux';

import {
    matchSocialAuthAccount,
    registerSocialAuthAccount,
    saveAndRegisterSocialAuthSession,
} from "../../api/ReelayUserApi";
import { getUserByEmail } from "../../api/ReelayDBApi";
import { makeRedirectUri } from "expo-auth-session";
import { firebaseCrashlyticsError, firebaseCrashlyticsLog, logAmplitudeEventProd } from "../utils/EventLogger";

import * as WebBrowser from 'expo-web-browser';
import ReelayColors from "../../constants/ReelayColors";
WebBrowser.maybeCompleteAuthSession();

const iosURLScheme = Constants.manifest.extra.googleiOSURLScheme;
const redirectUri = makeRedirectUri({
    native: `${iosURLScheme}:/`
});

const ButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.backgroundColor ?? 'black'};
    border-radius: 24px;
    height: 100%;
    justify-content: center;
    flex-direction: row;
    width: 100%;
`
const ButtonContainer = styled(View)`
    align-items: center;
	height: 48px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: 100%;
`
const ButtonContainerSmall = styled(View)`
    align-items: center;
	height: 50px;
    border-radius:25px;
    margin-top: 8px;
    margin-right:10px;
    margin-bottom: 8px;
    width: 50px;
`
const ButtonContainerSmall2 = styled(View)`
    align-items: center;
	height: 50px;
    border-radius:25px;
    margin-top: 8px;
    margin-left:10px;
    margin-bottom: 8px;
    width: 50px;
`
const ButtonText = styled(Text)`
    font-family: Outfit-Medium;
    color: ${props => props.color ?? ReelayColors.reelayBlue};
    font-size: 18px;
    margin-left: 10px;
`

export default SocialLoginBar = ({ navigation, setSigningIn, boarding = false }) => {
    const dispatch = useDispatch();
    try {
        firebaseCrashlyticsLog('Social Login Bar');
        const { setReelayDBUserID } = useContext(AuthContext);

        const appleOrGoogleCascadingSignIn = async ({
            authSession,
            method,
            email,
            fullName,
            appleUserID,
            googleUserID
        }) => {
            setSigningIn(true);
            const authAccountMatch = await matchSocialAuthAccount({
                method,
                value: (method === 'apple') ? appleUserID : googleUserID,
            });

            if (method === 'apple') {
                dispatch({ type: 'setAuthSessionFromApple', payload: authSession });
            }
            else if (method === 'google') {
                dispatch({ type: 'setAuthSessionFromGoogle', payload: authSession });
            }

            if (authAccountMatch && !authAccountMatch?.error) {
                // this social login is registered
                console.log('Auth account found: ', authAccountMatch);
                const { reelayDBUserID } = authAccountMatch;
                setReelayDBUserID(reelayDBUserID);
                await saveAndRegisterSocialAuthSession({ authSession, method, reelayDBUserID });
            } else {
                // social login not registered
                const existingUser = await getUserByEmail(email);
                if (existingUser?.sub) {
                    // user completed initial sign up through cognito
                    setReelayDBUserID(existingUser?.sub);
                    await saveAndRegisterSocialAuthSession({ authSession, method, reelayDBUserID: existingUser?.sub });
                    // link the social auth account 
                    // apple will only give us an email address the first time we signin with apple
                    await registerSocialAuthAccount({ method, email, fullName, appleUserID, googleUserID });
                    console.log('Existing user signed in');
                } else {
                    console.log('Totally new user');
                    // totally new user w/o cognito -- needs a username before completing signup
                    navigation.push('ChooseUsernameScreen', { authSession, method, email, fullName, appleUserID, googleUserID });
                }
            }
            setSigningIn(false);
        }

        const AppleAuthButton = () => {
            const signInWithApple = async () => {
                try {
                    const credentials = await Apple.signInAsync({
                        requestedScopes: [
                            Apple.AppleAuthenticationScope.FULL_NAME,
                            Apple.AppleAuthenticationScope.EMAIL,
                        ]
                    });
                    const { email, fullName, user, identityToken, authorizationCode } = credentials;
                    console.log("credentials", credentials)
                    appleOrGoogleCascadingSignIn({
                        authSession: {
                            accessToken: authorizationCode,
                            idToken: identityToken,
                            refreshToken: user,
                        },
                        appleUserID: user,
                        email,
                        fullName,
                        method: 'apple',
                    });
                } catch (error) {
                    console.log(error);
                    logAmplitudeEventProd('appleSignInError', { error });
                }
            }

            return (
                <>
                    {!boarding ?
                        <ButtonContainer>
                            <Apple.AppleAuthenticationButton
                                buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
                                buttonStyle={Apple.AppleAuthenticationButtonStyle.WHITE}
                                style={{ width: '100%', height: 48 }}
                                cornerRadius={24}
                                onPress={signInWithApple}
                            />
                        </ButtonContainer> :
                        <ButtonContainerSmall2>
                            <ButtonPressable backgroundColor={"#fff"} onPress={signInWithApple} activeOpacity={0.8}>
                                <Image source={AppleImage} style={{ width: 24, height: 24 }} resizeMode="contain" />
                            </ButtonPressable>
                        </ButtonContainerSmall2>}
                </>
            );
        }

        const GoogleAuthButton = () => {
            const expoClientId = Constants.manifest.extra.googleExpoClientId;
            const iosClientId = Constants.manifest.extra.googleiOSClientId;

            const [request, response, promptAsync] = Google.useAuthRequest({
                expoClientId,
                iosClientId,
                redirectUri
            });
            const onSignInResponse = async () => {
                const accessToken = response?.authentication?.accessToken;
                const idToken = response?.authentication?.idToken;
                const refreshToken = response?.authentication?.refreshToken;
                if (response?.type == 'error' || !accessToken) { // otherwise it's 'success'
                    console.log('No access token');
                    return;
                }
                const googleUserQuery = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;
                const googleUserObj = await fetchResults(googleUserQuery, { method: 'GET' });

                console.log('Google user obj: ', googleUserObj);
                const googleUserID = googleUserObj?.id;
                const email = googleUserObj?.email;
                const fullName = {
                    familyName: googleUserObj?.family_name,
                    givenName: googleUserObj?.given_name,
                };
                appleOrGoogleCascadingSignIn({
                    authSession: { accessToken, idToken, refreshToken },
                    email,
                    fullName,
                    googleUserID,
                    method: 'google',
                });
            }

            const signInWithGoogle = async () => {
                await promptAsync();
            }

            useEffect(() => {
                onSignInResponse();
            }, [response]);

            return (
                !boarding ?
                    <ButtonContainer>
                        <ButtonPressable backgroundColor={ReelayColors.reelayBlue} onPress={signInWithGoogle} activeOpacity={0.8}>
                            <Image source={GoogleImage} style={{ width: 24, height: 24 }} resizeMode="contain" />
                            <ButtonText color='white'>{'Continue with Google'}</ButtonText>
                        </ButtonPressable>
                    </ButtonContainer> :
                    <ButtonContainerSmall>
                        <ButtonPressable backgroundColor={"#fff"} onPress={signInWithGoogle} activeOpacity={0.8}>
                            <Image source={GoogleImage} style={{ width: 24, height: 24 }} resizeMode="contain" />
                        </ButtonPressable>
                    </ButtonContainerSmall>
            );
        }

        return (
            boarding ?
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <GoogleAuthButton />
                    <AppleAuthButton />
                </View> :
                <>
                    <GoogleAuthButton />
                    <AppleAuthButton />
                </>
        )
    } catch (error) {
        console.log(error);
        firebaseCrashlyticsError(error);
        return <React.Fragment />
    }
}
