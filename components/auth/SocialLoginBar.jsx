import React, { useContext, useEffect } from "react";
import { Pressable, View } from "react-native";
import styled from "styled-components/native";
import { Icon } from "react-native-elements";
import Constants from "expo-constants";

import * as Google from 'expo-auth-session/providers/google';
import * as Apple  from 'expo-apple-authentication';
import { fetchResults } from "../../api/fetchResults";
import { AuthContext } from "../../context/AuthContext";

import { useDispatch } from 'react-redux';

import { 
    matchSocialAuthAccount, 
    registerSocialAuthAccount, 
    saveAndRegisterSocialAuthToken,
} from "../../api/ReelayUserApi";
import { getUserByEmail } from "../../api/ReelayDBApi";
import { makeRedirectUri } from "expo-auth-session";
import { logAmplitudeEventProd } from "../utils/EventLogger";

import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

const iosURLScheme = Constants.manifest.extra.googleiOSURLScheme;

const redirectUri = makeRedirectUri({
    native: `${iosURLScheme}:/`
});

const ButtonRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
`
const SocialLoginContainer = styled(View)`
    align-items: center;
    justify-content: flex-end;
    margin: 20px;
`
const SocialAuthButton = styled(Pressable)`
    align-items: center;
    background-color: #222528;
    border-radius: 16px;
    height: 108px;
    justify-content: center;
    margin: 8px;
    width: 108px;
`

export default SocialLoginBar = ({ navigation, signingIn, setSigningIn }) => {
    const dispatch = useDispatch();
    try {
    const { setReelayDBUserID } = useContext(AuthContext);

    const appleOrGoogleCascadingSignIn = async ({
        authSession,
        method, 
        email, 
        fullName, 
        appleUserID, 
        googleUserID 
    }) => {
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
            await saveAndRegisterSocialAuthToken(reelayDBUserID);
        } else {
            // social login not registered
            const existingUser = await getUserByEmail(email);
            if (existingUser?.sub) {
                // user completed initial sign up through cognito
                setReelayDBUserID(existingUser?.sub);
                await saveAndRegisterSocialAuthToken(existingUser?.sub);
                // link the social auth account 
                // apple will only give us an email address the first time we signin with apple
                await registerSocialAuthAccount({ method, email, fullName, appleUserID, googleUserID });
                console.log('Existing user signed in');
            } else {
                console.log('Totally new user');
                // totally new user w/o cognito -- needs a username before completing signup
                navigation.push('ChooseUsernameScreen', { method, email, fullName, appleUserID, googleUserID });
            }
        }
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
    
                setSigningIn(true); 
                const { email, fullName, user, identityToken, authorizationCode } = credentials;
                appleOrGoogleCascadingSignIn({ 
                    authSession: { 
                        accessToken: authorizationCode,
                        idToken: identityToken,
                        refreshToken: authorizationCode,
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
            <SocialAuthButton onPress={signInWithApple}>
                <Icon type='ionicon' name='logo-apple' color='white' size={33} />
            </SocialAuthButton>
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

            setSigningIn(true); 
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
            <SocialAuthButton onPress={signInWithGoogle}>
                <Icon type='ionicon' name='logo-google' color='white' size={30} />
            </SocialAuthButton>
        );
    }

    return (
        <SocialLoginContainer>
            <ButtonRowContainer>
                <AppleAuthButton />
                <GoogleAuthButton />
            </ButtonRowContainer>
        </SocialLoginContainer>
    )    
    } catch (error) {
        console.log(error);
        logEventWithPropertiesAsync('socialLoginError', { error });
        return <React.Fragment />
    }
}
