import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';


import { AuthContext } from '../../context/AuthContext';
import { addMemberToClub, getClubInviteFromCode, getClubsMemberOf } from '../../api/ClubsApi';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePicture from '../../components/global/ProfilePicture';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';

const LoadingContainer = styled(View)`
    align-items: center;
    background-color: black;
    justify-content: center;
    height: 100%;
    width: 100%;
`

export default ClubJoinFromLinkScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    const { reelayDBUser } = useContext(AuthContext);
    const { inviteCode } = route?.params;
    const [clubInvite, setClubInvite] = useState(null);

    useEffect(() => {
        if (reelayDBUser?.username === 'be_our_guest') {
            dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
            return;
        }    
        console.log('reached');
        loadClubInvite();
    }, []);

    useEffect(() => {
        if (clubInvite) joinClubFromInvite();
    }, [clubInvite]);

    const joinClubFromInvite = async () => {
        if (!reelayDBUser?.sub) {
            showErrorToast('Ruh roh! Not logged in.');
            console.log("Not logged in club join from invite");
            navigation.popToTop();
            return;
        }

        const currentMyClubs = await getClubsMemberOf({
            authSession,
            userSub: reelayDBUser?.sub,
        });

        const matchClubOnInvite = (club) => (club.id === clubInvite.clubID);
        const alreadyMemberOfClub = currentMyClubs.find(matchClubOnInvite);
        if (alreadyMemberOfClub) {
            if (navigation.canGoBack()) navigation.popToTop();
            navigation.navigate('ClubActivityScreen', { 
                club: alreadyMemberOfClub,
                promptToInvite: false,
            });
            return;
        }

        const addMemberResult = await addMemberToClub({
            authSession,
            clubID: clubInvite?.clubID,
            userSub: reelayDBUser?.sub,
            username: reelayDBUser?.username,
            role: 'member',
            invitedBySub: clubInvite?.invitedByUserSub,
            invitedByUsername: clubInvite?.invitedByUsername,
            clubLinkID: clubInvite?.clubLinkID,
        });

        const nextMyClubs = await getClubsMemberOf({
            authSession,
            userSub: reelayDBUser?.sub,
        });
        
        dispatch({ type: 'setMyClubs', payload: nextMyClubs });
        const clubJoining = nextMyClubs.find(matchClubOnInvite);

        console.log('club joining: ', clubJoining);
        console.log('added member: ', addMemberResult);
        navigation.push('ClubActivityScreen', { 
            club: clubJoining,
            promptToInvite: false,
            welcomeNewMember: true,
        });

        console.log('add member result: ', addMemberResult);
    }

    const loadClubInvite = async () => {
        try {
            const clubInviteResult = await getClubInviteFromCode({
                authSession,
                inviteCode, 
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('club invite loaded: ', clubInviteResult);
            setClubInvite(clubInviteResult);    
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