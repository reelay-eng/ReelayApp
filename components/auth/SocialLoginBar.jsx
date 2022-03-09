import React, { useContext, useEffect } from "react";
import { Image, ImageBackground, Pressable, SafeAreaView, View } from "react-native";
import * as ReelayText from '../../components/global/Text';
import styled from "styled-components/native";
import { Icon } from "react-native-elements";

import * as Google from 'expo-auth-session/providers/google';
import * as Apple  from 'expo-apple-authentication';
import { fetchResults } from "../../api/fetchResults";
import { AuthContext } from "../../context/AuthContext";

import { matchSocialAuthAccount, saveAndRegisterSocialAuthToken } from "../../api/ReelayUserApi";
import { getUserByEmail } from "../../api/ReelayDBApi";

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

            const appleUserID = credentials?.user;
            const appleEmail = credentials?.email ?? 'anthony.mainero@gmail.com';
            const { familyName, givenName } = credentials?.fullName;

            const authAccountMatch = await matchSocialAuthAccount({ 
                method: 'apple', 
                value: appleUserID,
            });

            if (authAccountMatch && !authAccountMatch?.error) {
                // this social login is registered
                const { reelayDBUserID } = authAccountMatch;
                setReelayDBUserID(reelayDBUserID);
                saveAndRegisterSocialAuthToken(reelayDBUserID);
            } else {
                // social login not registered
                const existingUser = await getUserByEmail(appleEmail);
                if (existingUser) {
                    // username and user obj already created
                    setReelayDBUserID(existingUser?.sub);
                    saveAndRegisterSocialAuthToken(existingUser?.sub);
                    console.log('Existing user signed in');
                } else {
                    // username and user obj NOT created
                    navigation.push('ChooseUsernameScreen', {
                        method: 'apple',
                        email: appleEmail,
                        appleUserID,
                    });
                }
            }
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
            const query = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;
            const googleUserObj = await fetchResults(query, { method: 'GET' });
            console.log('Google user obj: ', googleUserObj);

            const authAccountMatch = await matchSocialAuthAccount({ 
                method: 'google', 
                value: googleUserObj?.id 
            });

            if (authAccountMatch && !authAccountMatch?.error) {
                // this social login is registered
                const { reelayDBUserID } = authAccountMatch;
                setReelayDBUserID(reelayDBUserID);
                saveAndRegisterSocialAuthToken(reelayDBUserID);
            } else {
                // social login not registered
                const existingUser = await getUserByEmail(googleUserObj?.email);
                if (existingUser) {
                    // username and user obj already created
                    setReelayDBUserID(existingUser?.sub);
                    saveAndRegisterSocialAuthToken(existingUser?.sub);
                    console.log('Existing user signed in');
                } else {
                    // username and user obj NOT created
                    navigation.push('ChooseUsernameScreen', {
                        method: 'google',
                        email: googleUserObj?.email,
                        googleUserID: googleUserObj?.id,
                    });
                }
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
                <Icon type='ionicon' name='logo-google' color='white' size={30} />
            </SocialAuthButton>
        );
    }

    return (
        <React.Fragment>
            {/* <MessageContainer>
                <MessageText>{'Or'}</MessageText>
            </MessageContainer> */}
            <SocialLoginContainer>
                <ButtonRowContainer>
                    <AppleAuthButton />
                    <GoogleAuthButton />
                </ButtonRowContainer>
            </SocialLoginContainer>
        </React.Fragment>
    )
}

