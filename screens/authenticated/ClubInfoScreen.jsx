import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import styled from 'styled-components/native';

import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import ClubPicture from '../../components/global/ClubPicture';

import { Icon } from 'react-native-elements';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import InviteMyFollowsDrawer from '../../components/clubs/InviteMyFollowsDrawer';
import { AuthContext } from '../../context/AuthContext';
import FollowButton from '../../components/global/FollowButton';

import { 
    banMemberFromClub, 
    createDeeplinkPathToClub,
    editClub, 
    getClubMembers, 
    getClubTitles, 
    getClubTopics,
    removeMemberFromClub, 
} from '../../api/ClubsApi';

import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import BigBubbleBath from '../../components/clubs/BigBubbleBath';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

const INVITE_BASE_URL = Constants.manifest.extra.reelayWebInviteUrl;

const BackButtonContainer = styled(View)`
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
`
const ClubDescriptionText = styled(ReelayText.Body2)` 
    color: white;
    margin-top: 16px;
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
const EditButton = styled(TouchableOpacity)`
    padding: 4px;
`
const EditButtonText = styled(ReelayText.Body2)`
    color: ${ReelayColors.reelayBlue};
`
const HorizontalDivider = styled(View)`
    border-color: rgba(255,255,255,0.5);
    border-width: 0.2px;
    margin-bottom: 24px;
    height: 1px;
    width: 100%;
`
const InfoScreenContainer = styled(View)`
    background-color: black;
    padding-left: 16px;
    padding-right: 16px;
    height: 100%;
    width: 100%;
`
const LeaveButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayRed};
    border-radius: 8px;
    flex-direction: row;
    justify-content: center;
    margin-left: 25%;
    margin-right: 25%;
    margin-top: 40px;
    height: 40px;
    width: 50%;
`
const MemberEditButton = styled(TouchableOpacity)``
const MemberInfoContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const MemberRightButtonContainer = styled(View)`
    flex-direction: row;
    position: absolute;
    right: 0px;
`
const MemberRowContainer = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    background-color: black;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 6px;
    padding-bottom: 6px;
    border-bottom-color: #505050;
    border-bottom-width: 0.0px;    
`
const MemberSectionSpacer = styled(View)`
    height: 12px;
`
const ProfileInfoContainer = styled(View)`
    align-items: center;
    margin-top: 0px;
    margin-bottom: 36px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const RemoveButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${(props) => (props?.ban) ? 'white' : ReelayColors.reelayRed};
    border-radius: 8px;
    flex-direction: row;
    justify-content: center;
    margin-right: ${(props) => (props?.ban) ? 8 : 0}px;
    height: 30px;
    width: 75px;
`
const RemoveButtonText = styled(ReelayText.Body2)`
    color: ${(props) => (props?.ban) ? 'black' : 'white'};
`
const SectionHeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const SectionRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`
const SettingsRow = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 16px;
    padding-bottom: 16px;
    width: 100%;
`
const SettingsRowRightButton = styled(View)`
    margin-right: 12px;
`
const SettingsSubtext = styled(ReelayText.Body1)`
    color: rgba(255,255,255,0.7);
`
const SettingsText = styled(ReelayText.Body1)`
    color: white;
`
const SettingsTextContainer = styled(View)`
`
const TopBarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: ${(props) => props.topOffset}px;
    width: 100%;
`
const TopBarRightContainer = styled(View)`
    margin-right: 10px;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const UsernameContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

export default ClubInfoScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { club } = route?.params;
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);
    const isClubOwner = (reelayDBUser?.sub === club.creatorSub);

    const bottomOffset = useSafeAreaInsets().bottom;
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        try { 
            setRefreshing(true);
            const [members, titles, topics] = await Promise.all([
                getClubMembers({
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTitles({ 
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTopics({
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
            ]);
            club.members = members;
            club.titles = titles;
            dispatch({ type: 'setUpdatedClub', payload: club });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    const ClubEditButton = () => {
        const advanceToEditClubScreen = () => navigation.push('EditClubScreen', { club });
        return (
            <EditButton onPress={advanceToEditClubScreen}>
                <EditButtonText>{'Edit'}</EditButtonText>
            </EditButton>
        );
    }

    const ClubMembers = () => {
        const [isEditing, setIsEditing] = useState(false);
        const memberCount = club.members.reduce((count, member) => {
            return (member.role === 'banned') ? count : count + 1;
        }, 0);
        
        const EditMembersButton = () => {
            const onPress = () => setIsEditing(!isEditing);
            return (
                <MemberEditButton onPress={onPress}>
                    <EditButtonText>
                        {isEditing ? 'Done' : 'Manage'}
                    </EditButtonText>
                </MemberEditButton>
            )
        }
    
        return (
            <React.Fragment>
                <SectionRow>
                    <SectionHeaderText>{`Members  (${memberCount})`}</SectionHeaderText>
                    { isClubOwner && <EditMembersButton />}                
                </SectionRow>
                <MemberSectionSpacer />
                { club.members.map((member) => {
                    if (member.role === 'banned') return <View key={member.userSub} />;
                    return (
                        <ClubMemberRow 
                            key={member.userSub} 
                            isEditing={isEditing}
                            member={member} 
                            navigation={navigation} 
                        /> 
                    )
                })}
            </React.Fragment>
        );
    }
    
    const ClubMemberRow = ({ isEditing, member }) => {
        const { username, userSub } = member;
        const user = { username, sub: userSub };
        const isMyUser = (userSub === reelayDBUser?.sub);
    
        const advanceToUserProfile = () => {
            console.log('advance');
            navigation.push('UserProfileScreen', { creator: user });
        }

        const BanButton = () => {
            const [banning, setBanning] = useState(false);
            const banFromClub = async () => {
                try {
                    if (banning) return;
                    setBanning(true);
                    const removeResult = await banMemberFromClub({
                        authSession,
                        clubID: club.id,
                        userSub,
                        reqUserSub: reelayDBUser?.sub,
                    });

                    logAmplitudeEventProd('bannedMemberFromClub', {
                        bannedByUsername: reelayDBUser?.username,
                        bannedByUserSub: reelayDBUser?.sub,
                        bannedUsername: username,
                        bannedUserSub: userSub,
                        clubID: club?.id,
                        club: club?.name,
                    });

                    console.log(removeResult);
                    onRefresh();
                    showMessageToast(`You've banned ${username} from ${club.name}`);
                } catch (error) {
                    console.log(error);
                    showErrorToast('Ruh roh! Could not leave club. Try again?');
                    setBanning(false);
                }
            }

            if (isMyUser) return <View />;
            return (
                <RemoveButtonContainer ban={true} onPress={banFromClub}>
                    { banning && <ActivityIndicator /> }
                    { !banning && <RemoveButtonText ban={true}>{'Ban'}</RemoveButtonText> }
                </RemoveButtonContainer>
            );
        }        
    
        const RemoveButton = () => {
            const [removing, setRemoving] = useState(false);
            const removeFromClub = async () => {
                try {
                    if (removing) return;
                    setRemoving(true);
                    const removeResult = await removeMemberFromClub({
                        authSession,
                        clubID: club.id,
                        userSub,
                        reqUserSub: reelayDBUser?.sub,
                    });

                    logAmplitudeEventProd('removedMemberFromClub', {
                        removedByUsername: reelayDBUser?.username,
                        removedByUserSub: reelayDBUser?.sub,
                        removedUsername: username,
                        removedUserSub: userSub,
                        club: club?.name,
                        clubID: club?.id,
                    });

                    console.log(removeResult);
                    onRefresh();
                    showMessageToast(`You've removed ${username} from ${club.name}`);
                } catch (error) {
                    console.log(error);
                    showErrorToast('Ruh roh! Could not leave club. Try again?');
                    setRemoving(false);
                }
            }

            if (isMyUser) return <View />;
            return (
                <RemoveButtonContainer onPress={removeFromClub}>
                    { removing && <ActivityIndicator /> }
                    { !removing && <RemoveButtonText>{'Remove'}</RemoveButtonText> }
                </RemoveButtonContainer>
            );
        }
    
        return (
            <MemberRowContainer onPress={advanceToUserProfile}>
                <MemberInfoContainer>
                    <ProfilePictureContainer>
                        <ProfilePicture user={user} size={32} navigation={navigation} />
                    </ProfilePictureContainer>
                    <UsernameContainer>
                        <UsernameText>{username}</UsernameText>
                    </UsernameContainer>
                </MemberInfoContainer>
                <MemberRightButtonContainer>
                    { !isEditing && !isMyUser && <FollowButton creator={user} /> }
                    { isEditing && <BanButton /> }
                    { isEditing && <RemoveButton /> }
                </MemberRightButtonContainer>
            </MemberRowContainer>
        )
    }
    
    const ClubProfileInfo = () => {
        return (
            <ProfileInfoContainer>
                {/* <ClubPicture club={club} size={120} /> */}
                <BigBubbleBath club={club} />
                <ClubDescriptionText>{club.description}</ClubDescriptionText>
            </ProfileInfoContainer>
        );
    }
    
    const InviteSettings = () => {
        const [allowMemberInvites, setAllowMemberInvites] = useState(true);
        const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
        const { reelayDBUser } = useContext(AuthContext);
    
        const switchAllowMemberInvites = async () => {
            const shouldAllow = !allowMemberInvites;
            setAllowMemberInvites(shouldAllow);
            const patchResult = await editClub({
                authSession,
                clubID: club.id,
                membersCanInvite: shouldAllow,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log(patchResult);
        }
    
        const AllowMemberInvitesRow = () => {
            return (
                <SettingsRow onPress={switchAllowMemberInvites}>
                    <SettingsTextContainer>
                        <SettingsText>{'Open Invite'}</SettingsText>
                        <SettingsSubtext>{'Members can invite other members'}</SettingsSubtext>
                    </SettingsTextContainer>
                    <Switch 
                        value={allowMemberInvites}
                        onValueChange={switchAllowMemberInvites}
                        trackColor={{ 
                            false: "#39393D", 
                            true: ReelayColors.reelayGreen,
                        }}
                        thumbColor={"#FFFFFF"}
                        ios_backgroundColor="#39393D"    
                    />
                </SettingsRow>
            );
        }
    
        const AddMembersRow = () => {
            return (
                <SettingsRow onPress={() => setInviteDrawerVisible(true)}>
                    <SettingsTextContainer>
                        <SettingsText>{'Add Members'}</SettingsText>
                        <SettingsSubtext>{'Invite more people to the club'}</SettingsSubtext>
                    </SettingsTextContainer>
                    <SettingsRowRightButton>
                        <Icon type='ionicon' name='person-add' color='white' size={24} />
                    </SettingsRowRightButton>
                </SettingsRow>
            );
        }
    
        const ShareClubLinkRow = () => {
            const copyClubLinkToClipboard = async () => {
                try {
                    const clubLinkObj = await createDeeplinkPathToClub({
                        authSession,
                        clubID: club.id,
                        invitedByUserSub: reelayDBUser?.sub,
                        invitedByUsername: reelayDBUser?.username,
                    });

                    console.log(clubLinkObj);
                    if (clubLinkObj?.inviteCode && !clubLinkObj?.error) {
                        const copyLink = INVITE_BASE_URL + clubLinkObj.inviteCode;
                        Clipboard.setString(copyLink);
                        showMessageToast('Invite link copied to clipboard!');
                    }

                    logAmplitudeEventProd('copyClubInviteLink', {
                        username: reelayDBUser?.username,
                        userSub: reelayDBUser?.sub,
                        clubID: club?.id,
                        club: club?.name,
                        inviteCode: clubLinkObj?.inviteCode,
                    });

                } catch (error) {
                    console.log(error);
                    showErrorToast('Ruh roh! Couldn\'t copy the club link. Try again?');
                }                
            }
            return (
                <SettingsRow onPress={copyClubLinkToClipboard}>
                    <SettingsTextContainer>
                        <SettingsText>{'Send Link'}</SettingsText>
                        <SettingsSubtext>{'Share the club link'}</SettingsSubtext>
                    </SettingsTextContainer>
                    <SettingsRowRightButton>
                        <FontAwesomeIcon icon={ faLink } size={24} color='white' />
                    </SettingsRowRightButton>
                </SettingsRow>
            );
        }
    
        return (
            <React.Fragment>
                <SectionHeaderText>{'Invites'}</SectionHeaderText>
                { isClubOwner && <AllowMemberInvitesRow />}
                <AddMembersRow />
                <ShareClubLinkRow />
                { inviteDrawerVisible && (
                    <InviteMyFollowsDrawer
                        club={club}
                        drawerVisible={inviteDrawerVisible}
                        setDrawerVisible={setInviteDrawerVisible}
                        onRefresh={onRefresh}
                    />
                )}
            </React.Fragment>
        );
    }
    
    const ClubTopBar = () => {
        const topOffset = useSafeAreaInsets().top;
        return (
            <TopBarContainer topOffset={topOffset}>
                <BackButton navigation={navigation} />
                <ClubHeaderText numberOfLines={1}>{club.name}</ClubHeaderText>
                <TopBarRightContainer>
                    <ClubPrivacyRow>
                        { isClubOwner && <ClubEditButton club={club} navigation={navigation} /> }
                        { !isClubOwner && (
                            <React.Fragment>
                                <ClubPrivacyText>{'Private'}</ClubPrivacyText>
                                <Icon type='ionicon' name='lock-closed' color='white' size={20} />
                            </React.Fragment>
                        )}
                    </ClubPrivacyRow>
                </TopBarRightContainer>
            </TopBarContainer>
        );
    }

    const LeaveButton = () => {
        const [leaving, setLeaving] = useState(false);
        const leaveClub = async () => {
            try {
                if (leaving) return;
                setLeaving(true);
                const removeResult = await removeMemberFromClub({
                    authSession,
                    clubID: club.id,
                    userSub: reelayDBUser?.sub,
                    reqUserSub: reelayDBUser?.sub,
                });

                logAmplitudeEventProd('leftClub', {
                    username: reelayDBUser?.username,
                    userSub: reelayDBUser?.sub,
                    clubID: club?.id,
                    club: club?.name,
                });

                console.log(removeResult);
                navigation.popToTop();
                const myClubsRemoved = myClubs.filter(nextClub => nextClub.id !== club.id);
                showMessageToast(`You've left ${club.name}`)
                dispatch({ type: 'setMyClubs', payload: myClubsRemoved });    
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Could not leave club. Try again?');
                setLeaving(false);
            }
        }

        return (
            <LeaveButtonContainer onPress={leaveClub}>
                { leaving && <ActivityIndicator /> }
                { !leaving && <RemoveButtonText>{'Leave Club'}</RemoveButtonText> }
            </LeaveButtonContainer>
        );
    }
    
    return (
        <InfoScreenContainer>
            <ClubTopBar />
            <ScrollView 
                contentContainerStyle={{ paddingBottom: bottomOffset }} 
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
            >
                <ClubProfileInfo />
                { (isClubOwner || club.allowMemberInvites) && <InviteSettings /> }
                <HorizontalDivider />
                <ClubMembers />
                { !isClubOwner && <LeaveButton /> }
            </ScrollView>
        </InfoScreenContainer>
    );
}
