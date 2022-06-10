import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import ClubPicture from '../../components/global/ClubPicture';

import { AuthContext } from '../../context/AuthContext';
import { addMemberToClub, getClubInviteFromCode } from '../../api/ClubsApi';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePicture from '../../components/global/ProfilePicture';
import JustShowMeSignupDrawer from '../../components/global/JustShowMeSignupDrawer';

const AcceptInviteButtonGradient = styled(LinearGradient)`
    position: absolute;
    border-radius: 24px;
    height: 100%;
    width: 100%;
`
const AcceptInviteButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: black;
    border-radius: 24px;
    height: 48px;
    justify-content: center;
    margin: 16px;
    margin-bottom: 0px;
    width: 100%;
`
const BackButtonContainer = styled(SafeAreaView)`
    left: -10px;
    position: absolute;
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-bottom: 10px;
`
const ClubDescriptionText = styled(ReelayText.Body2)` 
    color: white;
    margin-top: 8px;
`
const ClubMembersContainer = styled(View)`
    align-items: flex-start;
    padding: 16px;
    width: 100%;
`
const ClubPrivacyRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 12px;
    width: 100%;
`
const ClubPrivacyText = styled(ReelayText.Body2)`
    color: white;
    font-size: 12px;
    margin-right: 4px;
    padding-top: 4px;
`
const ClubTitleText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 16px;
`
const InfoScreenContainer = styled(View)`
    background-color: black;
    padding-left: 16px;
    padding-right: 16px;
    height: 100%;
    width: 100%;
`
const InvitationButtonText = styled(ReelayText.H6)`
    color: white;
    text-align: center;
    line-height: 24px;
    font-size: 18px;
`
const InvitationContainer = styled(View)`
    align-items: center;
    background-color: #1a1a1a;
    border-radius: 8px;
    justify-content: center;
    padding: 24px;
`
const InvitationMessageLine = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-left: 16px;
    padding-right: 16px;
`
const InvitationText = styled(ReelayText.H6)`
    color: white;
    line-height: 20px;
    font-size: 16px;
`
const LoadingContainer = styled(View)`
    align-items: center;
    background-color: black;
    justify-content: center;
    height: 100%;
    width: 100%;
`
const ProfileInfoContainer = styled(View)`
    align-items: center;
    margin-top: 20px;
    margin-bottom: 36px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const MemberHeaderText = styled(ReelayText.Body1)`
    color: white;
    font-size: 16px;
    text-align: center;
    width: 100%;
`
const TopBarContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    justify-content: center;
    height: ${(props) => props.headerHeight}px;
    width: 100%;
`
const TopBarRightContainer = styled(SafeAreaView)`
    right: 0px;
    position: absolute;
`
const UsernameText = styled(ReelayText.Body2Emphasized)`
    color: white;
`
const UsernameContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

export default ClubAcceptInviteScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const justShowMeSignupVisible = useSelector(state => state.justShowMeSignupVisible);

    const { reelayDBUser } = useContext(AuthContext);
    const { inviteCode } = route?.params;

    const [clubInvite, setClubInvite] = useState(null);
    const bottomOffset = useSafeAreaInsets().bottom;

    useEffect(() => {
        if (reelayDBUser?.username === 'be_our_guest') {
            dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
            return;
        }    
        console.log('reached');
        // loadClubInvite();
    }, []);

    const loadClubInvite = async () => {
        const clubInviteResult = await getClubInviteFromCode({
            authSession,
            inviteCode, 
            reqUserSub: reelayDBUser?.sub,
        });
        console.log(clubInviteResult);
        setClubInvite(clubInviteResult);
    }

    const ClubMembers = () => {
        const memberCount = clubInvite?.memberCount;            
        return (
            <ClubMembersContainer>
                <MemberHeaderText>{`${memberCount} members`}</MemberHeaderText>
            </ClubMembersContainer>
        );
    }
        
    const ClubProfileInfo = () => {
        return (
            <ProfileInfoContainer>
                <ClubPicture club={clubInvite} size={120} />
                <ClubTitleText>{clubInvite?.name}</ClubTitleText>
                <ClubDescriptionText>{clubInvite?.description}</ClubDescriptionText>
            </ProfileInfoContainer>
        );
    }
    
    const ClubTopBar = () => {
        const headerHeight = useSafeAreaInsets().top + 72;
        return (
            <TopBarContainer headerHeight={headerHeight}>
                <ClubHeaderText numberOfLines={1}>{`You're invited`}</ClubHeaderText>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <TopBarRightContainer>
                <ClubPrivacyRow>
                    <ClubPrivacyText>{'Private'}</ClubPrivacyText>
                    <Icon type='ionicon' name='lock-closed' color='white' size={20} />
                </ClubPrivacyRow>
                </TopBarRightContainer>
            </TopBarContainer>
        );
    }

    const Invitation = () => {
        const invitedByUser = {
            sub: clubInvite?.creatorSub,
            username: clubInvite?.invitedByUsername,
        }
        return (
            <InvitationContainer>
                <InvitationMessageLine>
                    <ProfilePictureContainer>
                        <ProfilePicture user={invitedByUser} size={36} />
                    </ProfilePictureContainer>
                    <InvitationText>
                        {`anthman2 invited you to the club ${clubInvite.name}`}
                    </InvitationText>
                </InvitationMessageLine>
                <AcceptInviteButton />
                <ClubMembers />
            </InvitationContainer>
        );
    }

    const AcceptInviteButton = () => {
        return (
            <AcceptInviteButtonPressable>
                <AcceptInviteButtonGradient colors={['#2A78F0', '#FF4848']} />
                <InvitationButtonText>{'Accept Invite'}</InvitationButtonText>
            </AcceptInviteButtonPressable>
        );
    }

    if (!clubInvite) {
        return (
            <LoadingContainer>
                <ActivityIndicator />
            </LoadingContainer>
        );
    }
    
    return (
        <InfoScreenContainer>
            <ClubTopBar />
            { justShowMeSignupVisible && (
                <JustShowMeSignupDrawer navigation={navigation} />
            )}
            { !justShowMeSignupVisible && (
                <ScrollView 
                    contentContainerStyle={{ paddingBottom: bottomOffset }} 
                    showsVerticalScrollIndicator={false}
                >                
                    <ClubProfileInfo />
                    <Invitation />
                </ScrollView>
            )}
        </InfoScreenContainer>
    );
}
