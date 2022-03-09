import React, { useEffect } from "react";
import { Image, ImageBackground, Pressable, SafeAreaView, View } from "react-native";
import * as ReelayText from '../../components/global/Text';
import styled from "styled-components/native";

import { Icon } from "react-native-elements";

import * as Google from 'expo-auth-session/providers/google';
import * as Apple  from 'expo-apple-authentication';
import { fetchResults } from "../../api/fetchResults";

const ButtonRowContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
`
const MessageContainer = styled(View)`
    margin: 10px;
`
const MessageText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
    margin-bottom: 6px;
    text-align: center;
`
const SocialLoginContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin: 10px;
`
const SocialAuthButton = styled(Pressable)`
    align-items: center;
    background-color: white;
    border-radius: 16px;
    height: 108px;
    justify-content: center;
    margin: 8px;
    width: 108px;
`

export default SocialLoginBar = ({ navigation }) => {

    const AppleAuthButton = () => {
        const signInWithApple = async () => {
            const credentials = await Apple.signInAsync({
                requestedScopes: [
                    Apple.AppleAuthenticationScope.FULL_NAME,
                    Apple.AppleAuthenticationScope.EMAIL,
                ]
            });
            console.log(credentials);
            // TODO: create an auth token, and set reelayDBUser corresponding to the Apple credentials
        }

        return (
            <SocialAuthButton onPress={signInWithApple}>
                <Icon type='ionicon' name='logo-apple' size={33} />
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
            if (accessToken) {
                const query = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;
                const googleUserObj = await fetchResults(query, { method: 'GET' });
                console.log(googleUserObj);

                // todo: IF there's a match
                // const authAccountMatches = await getAuthAccountMatch({ method: 'google', value: '123' });
                // if (authAccountMatches?.error || authAccountMatches.length === 0) {
                //     const authAccountObj = await registerAuthAccount({ 
                //         method: 'google', 
                //         email: userCredentials?.email,
                //         googleUserID: userCredentials?.id,
                //         givenName: userCredentials?.given_name,
                //         familyName: userCredentials?.family_name,
                //     });
                //     navigation.push('ChooseUsernameScreen', { authAccountObj });
                // };
                navigation.push('ChooseUsernameScreen', {
                    method: 'google',
                    credentials: response?.authentication,
                    userObj: googleUserObj,
                })
            }
        }

        const signInWithGoogle = async () => {
            await promptAsync();
        }

        useEffect(() => {
            onSignInResponse();
        }, [response]);

        return (
            <SocialAuthButton onPress={signInWithGoogle}>
                <Icon type='ionicon' name='logo-google' size={30} />
            </SocialAuthButton>
        );
    }

    return (
        <SocialLoginContainer>
            <MessageContainer>
                <React.Fragment>
                    <MessageText>{'Or'}</MessageText>
                </React.Fragment>
            </MessageContainer>
            <ButtonRowContainer>
                <AppleAuthButton />
                <GoogleAuthButton />
            </ButtonRowContainer>
        </SocialLoginContainer>
    )
}

