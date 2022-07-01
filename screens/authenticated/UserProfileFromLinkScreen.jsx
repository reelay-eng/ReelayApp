import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';


import { AuthContext } from '../../context/AuthContext';
import { getProfileInviteFromCode } from '../../api/ProfilesApi';
import { useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';

const LoadingContainer = styled(View)`
    align-items: center;
    background-color: black;
    justify-content: center;
    height: 100%;
    width: 100%;
`

export default UserProfileFromLinkScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    const { reelayDBUser } = useContext(AuthContext);
    const { inviteCode } = route?.params;

    // creator = { sub, username } 
    const [profileInvite, setProfileInvite] = useState(null);

    useEffect(() => {
        loadProfileInvite();
    }, []);

    useEffect(() => {
        if (profileInvite) viewProfileFromInvite();
    }, [profileInvite]);

    const viewProfileFromInvite = async () => {
        if (!reelayDBUser?.sub) {
            showErrorToast('Ruh roh! Not logged in.');
            navigation.popToTop();
            return;
        }

        // parse the creator out here

        const creator = { 
            sub: profileInvite?.userSub, 
            username: profileInvite?.username 
        }
        navigation.pop();
        navigation.navigate('UserProfileScreen', { creator });
        console.log('profile loaded: ', creator);
    }

    const loadProfileInvite = async () => {
        try {
            const profileInviteResult = await getProfileInviteFromCode({
                authSession,
                inviteCode, 
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('profile invite loaded: ', profileInviteResult);
            setProfileInvite(profileInviteResult);    
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! This invite didn\'t work. Try again.');
        }
    }

    return (
        <LoadingContainer>
            <ActivityIndicator />
            { justShowMeSignupVisible && <JustShowMeSignupDrawer navigation={navigation} /> }
        </LoadingContainer>
    )
}