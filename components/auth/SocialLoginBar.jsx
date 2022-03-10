import React, { useContext, useEffect } from "react";
import { Pressable, View } from "react-native";
import styled from "styled-components/native";
import { Icon } from "react-native-elements";

import * as Google from 'expo-auth-session/providers/google';
import * as Apple  from 'expo-apple-authentication';
import { fetchResults } from "../../api/fetchResults";
import { AuthContext } from "../../context/AuthContext";

import { 
    matchSocialAuthAccount, 
    registerSocialAuthAccount, 
    saveAndRegisterSocialAuthToken,
} from "../../api/ReelayUserApi";
import { getUserByEmail } from "../../api/ReelayDBApi";

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
    const { setReelayDBUserID } = useContext(AuthContext);

    const appleOrGoogleCascadingSignIn = async ({ method, email, appleUserID, googleUserID }) => {
        const authAccountMatch = await matchSocialAuthAccount({ 
            method, 
            value: (method === 'apple') ? appleUserID : googleUserID,
        });

        if (authAccountMatch && !authAccountMatch?.error) {
            // this social login is registered
            console.log('Auth account found: ', authAccountMatch);
            const { reelayDBUserID } = authAccountMatch;
            setReelayDBUserID(reelayDBUserID);
            saveAndRegisterSocialAuthToken(reelayDBUserID);
        } else {
            // social login not registered
            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                // user completed initial sign up through cognito
                setReelayDBUserID(existingUser?.sub);
                saveAndRegisterSocialAuthToken(existingUser?.sub);
                // link the social auth account 
                // apple will only give us an email address the first time we signin with apple
                registerSocialAuthAccount({ method, email, appleUserID, googleUserID });
                console.log('Existing user signed in');
            } else {
                // totally new user w/o cognito -- needs a username before completing signup
                navigation.push('ChooseUsernameScreen', { method, email, appleUserID, googleUserID });
            }
        }
    }

    const AppleAuthButton = () => {
        const signInWithApple = async () => {
            const credentials = await Apple.signInAsync({
                requestedScopes: [
                    Apple.AppleAuthenticationScope.FULL_NAME,
                    Apple.AppleAuthenticationScope.EMAIL,
                ]
            });
            console.log('Apple credentials: ', credentials);

            // todo: what if the credentials are bad?

            setSigningIn(true); 
            const appleUserID = credentials?.user;
            const email = credentials?.email;
            const { familyName, givenName } = credentials?.fullName;
            appleOrGoogleCascadingSignIn({ method: 'apple', email, appleUserID });
        }

        return (
            <SocialAuthButton onPress={signInWithApple}>
                <Icon type='ionicon' name='logo-apple' color='white' size={33} />
            </SocialAuthButton>
        );
    }

    const GoogleAuthButton = () => {
        const [request, response, promptAsync] = Google.useAuthRequest({
            // todo: move these to manifest or server
            expoClientId: '75256805031-843i4qaqde5g2hm0q3pn6toat65cne42.apps.googleusercontent.com',
            iosClientId: '75256805031-89iubu60jfrko1lcn1oj2n4lgshdnljf.apps.googleusercontent.com',
        });

        const onSignInResponse = async () => {
            const accessToken = response?.authentication?.accessToken;
            if (!accessToken) {
                console.log('No access token');
                return;
            }

            setSigningIn(true); 
            const googleUserQuery = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;
            const googleUserObj = await fetchResults(googleUserQuery, { method: 'GET' });

            console.log('Google user obj: ', googleUserObj);
            const googleUserID = googleUserObj?.id;
            const email = googleUserObj?.email;
            appleOrGoogleCascadingSignIn({ method: 'google', email, googleUserID });
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
}
