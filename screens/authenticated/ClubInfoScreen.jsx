import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import styled from 'styled-components/native';
import moment from 'moment';

import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { Icon } from 'react-native-elements';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import InviteMyFollowsDrawer from '../../components/clubs/InviteMyFollowsDrawer';
import { AuthContext } from '../../context/AuthContext';
import FollowButton from '../../components/global/FollowButton';

import { 
    inviteMemberToClub,
    banMemberFromClub, 
    createDeeplinkPathToClub,
    editClub, 
    getClubMembers,
    getClubTitles,
    getClubTopics,
    markClubActivitySeen,
    removeMemberFromClub, 
} from '../../api/ClubsApi';

import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import BigBubbleBath from '../../components/clubs/BigBubbleBath';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import ChangeClubPrivacyDrawer from '../../components/clubs/ChangeClubPrivacyDrawer';
import { notifyClubOnPrivacyChanges } from '../../api/ClubNotifications';
import { FlashList } from '@shopify/flash-list';

const INVITE_BASE_URL = Constants.manifest.extra.reelayWebInviteUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const ChangePrivacyView = styled(View)`
    margin-left: 16px;
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 4px;
`
const ClubDescriptionText = styled(ReelayText.Body2)` 
    color: white;
`
const ClubInfoView = styled(View)`
    align-items: center;
`
const ClubPrivacyRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
`
const ClubPrivacyText = styled(ReelayText.Body2)`
    color: white;
    font-size: 12px;
    margin-right: 4px;
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
    height: 1px;
    width: 100%;
`
const InfoScreenView = styled(View)`
    background-color: black;
    padding-left: 16px;
    padding-right: 16px;
    height: 100%;
    width: 100%;
`
const InviteSettingsView = styled(View)`
    width: 100%;
`
const JoinButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 8px;
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
    height: 40px;
    width: 50%;
`
const LeaveButtonView = styled(JoinButtonView)`
    background-color: ${ReelayColors.reelayRed};
`
const MemberEditButton = styled(TouchableOpacity)``
const MemberInfoView = styled(View)`
    align-items: center;
    flex-direction: row;
`
const MemberInvitedText = styled(ReelayText.Overline)`
    color: white;
`
const MemberListView = styled(View)`
    width: 100%;
`
const MemberRightButtonView = styled(View)`
    flex-direction: row;
    position: absolute;
    right: 0px;
`
const MemberRowView = styled(TouchableOpacity)`
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
const ProfileInfoView = styled(View)`
    align-items: center;
    margin-top: 0px;
    margin-bottom: 25px;
`
const ProfilePictureView = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const ProfileSpacer = styled(View)`
    height: 16px;
`
const RemoveButtonView = styled(TouchableOpacity)`
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
const SettingsTextView = styled(View)`
`
const TopBarView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: ${(props) => props.topOffset}px;
    margin-bottom: 16px;
    width: 100%;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const UsernameView = styled(View)`
    align-items: flex-start;
    justify-content: center;
`

export default ClubInfoScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom + 60;
    const { reelayDBUser } = useContext(AuthContext);
    const { club } = route?.params;

    const myClubs = useSelector(state => state.myClubs);
    const isClubOwner = (reelayDBUser?.sub === club.creatorSub);

    const matchClubMember = (nextMember) => nextMember?.userSub === reelayDBUser?.sub
    const initClubMember = club.members?.find(matchClubMember);
    const [clubMember, setClubMember] = useState(initClubMember);
    const [refreshing, setRefreshing] = useState(false);

    const isPublicClub = (club?.visibility === FEED_VISIBILITY);
    const canInviteMembers = (isClubOwner || club.allowMemberInvites);
    const canShareClubLink = (canInviteMembers || isPublicClub);

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
        const shouldCountMember = (member) => (member?.hasAcceptedInvite && member.role !== 'banned');
        const memberCount = club.members.reduce((count, member) => {
            return (shouldCountMember(member)) ? count + 1 : count;
        }, 0);

        const sortedMembers = club.members.sort((member0, member1) => {
            const member0AddedAt = moment(member0?.createdAt);
            const member1AddedAt = moment(member1?.createdAt);
            return member1AddedAt.diff(member0AddedAt, 'seconds') > 0;
        });
        
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

        const renderMemberRow = ({ item, index }) => {
            const member = item;
            const isInvitedByMe = (member?.invitedBySub === reelayDBUser?.sub);
            const inviteAccepted = member?.hasAcceptedInvite;

            if (member.role === 'banned') {
                return <View key={member.userSub} />;
            } else if (!inviteAccepted && !isInvitedByMe) {
                return <View key={member.userSub} />;
            } else {
                return (
                    <ClubMemberRow 
                        key={member.userSub} 
                        isEditing={isEditing}
                        inviteAccepted={inviteAccepted}
                        member={member} 
                    /> 
                )    
            };
        }
    
        return (
            <MemberListView>
                <SectionRow>
                    <SectionHeaderText>{`Members  (${memberCount})`}</SectionHeaderText>
                    { isClubOwner && <EditMembersButton />}                
                </SectionRow>
                <MemberSectionSpacer />
                <FlatList
                    data={sortedMembers}
                    estimatedItemSize={60}
                    keyExtractor={member => member?.id}
                    renderItem={renderMemberRow}
                    showsVerticalScrollIndicator={false}
                />
            </MemberListView>
        );
    }
    
    const ClubMemberRow = ({ isEditing, inviteAccepted, member }) => {
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
                <RemoveButtonView ban={true} onPress={banFromClub}>
                    { banning && <ActivityIndicator /> }
                    { !banning && <RemoveButtonText ban={true}>{'Ban'}</RemoveButtonText> }
                </RemoveButtonView>
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
                <RemoveButtonView onPress={removeFromClub}>
                    { removing && <ActivityIndicator /> }
                    { !removing && <RemoveButtonText>{'Remove'}</RemoveButtonText> }
                </RemoveButtonView>
            );
        }
    
        return (
            <MemberRowView onPress={advanceToUserProfile}>
                <MemberInfoView>
                    <ProfilePictureView>
                        <ProfilePicture user={user} size={32} navigation={navigation} />
                    </ProfilePictureView>
                    <UsernameView>
                        <UsernameText>{username}</UsernameText>
                    </UsernameView>
                </MemberInfoView>
                { inviteAccepted && (
                    <MemberRightButtonView>
                        { !isEditing && !isMyUser && <FollowButton creator={user} /> }
                        { isEditing && <BanButton /> }
                        { isEditing && <RemoveButton /> }
                    </MemberRightButtonView>
                )}
                { !inviteAccepted && (
                    <MemberRightButtonView>
                        <MemberInvitedText>{'Invited'}</MemberInvitedText>
                    </MemberRightButtonView>
                )}
            </MemberRowView>
        )
    }
    
    const ClubProfileInfo = () => {
        return (
            <ProfileInfoView>
                <BigBubbleBath club={club} />
                <ProfileSpacer />
                <ClubHeaderText>{club.name}</ClubHeaderText>
                <ClubDescriptionText>{club.description}</ClubDescriptionText>
            </ProfileInfoView>
        );
    }
    
    const InviteSettings = () => {
        const [allowMemberInvites, setAllowMemberInvites] = useState(true);
        const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
        const { reelayDBUser } = useContext(AuthContext);

        const [isPrivate, setIsPrivate] = useState(club?.visibility === 'private');
    
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
                    <SettingsTextView>
                        <SettingsText>{'Open Invite'}</SettingsText>
                        <SettingsSubtext>{'Members can invite other members'}</SettingsSubtext>
                    </SettingsTextView>
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
    
        const InviteMembersRow = () => {
            return (
                <SettingsRow onPress={() => setInviteDrawerVisible(true)}>
                    <SettingsTextView>
                        <SettingsText>{'Invite Members'}</SettingsText>
                        <SettingsSubtext>{'Invite more people to the club'}</SettingsSubtext>
                    </SettingsTextView>
                    <SettingsRowRightButton>
                        <Icon type='ionicon' name='person-add' color='white' size={24} />
                    </SettingsRowRightButton>
                </SettingsRow>
            );
        }

        const PrivacySettingRow = ({ isPrivateSetting }) => {
            const [clubPrivacyDrawerVisible, setClubPrivacyDrawerVisible] = useState(false);
            const isSelected = 
                (isPrivateSetting && club?.visibility === 'private') ||
                (!isPrivateSetting && club?.visibility !== 'private');

            const headingText = (isPrivateSetting)
                ? 'Private Club'
                : 'Public Club';

            const bodyText = (isPrivateSetting)
                ? 'Closed group. Invite people to the club'
                : 'Open group. Anyone can join';

            const switchClubPrivacy = () => {
                if (isPrivate === isPrivateSetting) return;
                setClubPrivacyDrawerVisible(true);
            }

            const confirmChangePrivacy = async () => {
                setIsPrivate(isPrivateSetting);
                club.visibility = (isPrivateSetting) ? 'private' : FEED_VISIBILITY;
                setClubPrivacyDrawerVisible(false);

                const patchResult = await editClub({
                    authSession,
                    clubID: club.id,
                    visibility: club.visibility,
                    reqUserSub: reelayDBUser?.sub,
                });   

                notifyClubOnPrivacyChanges({ club, nextIsPrivate: isPrivateSetting });
                console.log('patched club: ', patchResult);
                return patchResult; 
            }

            return (
                <SettingsRow onPress={switchClubPrivacy}>
                    <SettingsTextView>
                        <SettingsText>{headingText}</SettingsText>
                        <SettingsSubtext>{bodyText}</SettingsSubtext>
                    </SettingsTextView>
                    <ChangePrivacyView>
                        { isSelected && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={30} />}
                        { !isSelected && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />}
                    </ChangePrivacyView>
                    { clubPrivacyDrawerVisible && (
                        <ChangeClubPrivacyDrawer
                            navigation={navigation}
                            clubID={club.id}
                            drawerVisible={clubPrivacyDrawerVisible}
                            setDrawerVisible={setClubPrivacyDrawerVisible}
                            isPrivate={!isPrivateSetting}
                            confirmChangePrivacy={confirmChangePrivacy}
                        />
                    )}
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
                    <SettingsTextView>
                        <SettingsText>{'Send Link'}</SettingsText>
                        <SettingsSubtext>{'Share the club link'}</SettingsSubtext>
                    </SettingsTextView>
                    <SettingsRowRightButton>
                        <FontAwesomeIcon icon={ faLink } size={24} color='white' />
                    </SettingsRowRightButton>
                </SettingsRow>
            );
        }
    
        return (
            <InviteSettingsView>
                <SectionHeaderText>{'Invites'}</SectionHeaderText>
                { isClubOwner && <AllowMemberInvitesRow /> }
                { canInviteMembers && <InviteMembersRow /> }
                <ShareClubLinkRow />
                { isClubOwner && (
                    <Fragment>
                        <PrivacySettingRow isPrivateSetting={true} />
                        <PrivacySettingRow isPrivateSetting={false} /> 
                    </Fragment>
                )}
                { inviteDrawerVisible && (
                    <InviteMyFollowsDrawer
                        club={club}
                        drawerVisible={inviteDrawerVisible}
                        setDrawerVisible={setInviteDrawerVisible}
                        onRefresh={onRefresh}
                    />
                )}
            </InviteSettingsView>
        );
    }
    
    const ClubTopBar = () => {
        const isPrivate = club.visibility === 'private';
        const topOffset = useSafeAreaInsets().top;
        return (
            <TopBarView topOffset={topOffset}>
                <BackButton navigation={navigation} />
                <ClubHeaderText>{'Club Info'}</ClubHeaderText>
                <ClubPrivacyRow>
                    { isClubOwner && <ClubEditButton club={club} navigation={navigation} /> }
                    { !isClubOwner && (
                        <React.Fragment>
                            <ClubPrivacyText>{isPrivate ? 'Private' : 'Public'}</ClubPrivacyText>
                            { isPrivate && (
                                <Icon type='ionicon' name='lock-closed' color='white' size={20} />
                            )}
                            { !isPrivate && (
                                <Icon type='ionicon' name='earth' color='white' size={20} />
                            )}
                        </React.Fragment>
                    )}
                </ClubPrivacyRow>
            </TopBarView>
        );
    }

    const JoinButton = () => {
        const [joining, setJoining] = useState(false);

        const joinClub = async () => {
            setJoining(true);
            // inviting yourself => auto-accept invite
            const joinClubResult = await inviteMemberToClub({
                authSession,
                clubID: club.id,
                userSub: reelayDBUser?.sub,
                username: reelayDBUser?.username,
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                role: 'member',
                clubLinkID: null,
            });

            if (joinClubResult && !joinClubResult?.error) {
                club.members.push(joinClubResult);
                await onRefresh();

                dispatch({ type: 'setMyClubs', payload: [club, ...myClubs] });
                setClubMember(joinClubResult);
            }
            
            setJoining(false);
            return joinClubResult;
        }

        return (
            <JoinButtonView onPress={joinClub}>
                { joining && <ActivityIndicator /> }
                { !joining && <RemoveButtonText>{'Join Club'}</RemoveButtonText> }
            </JoinButtonView>
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
                const myClubsRemoved = myClubs.filter(nextClub => {
                    if (nextClub.id === club.id) console.log('filtering out club');
                    return nextClub.id !== club.id
                });

                const filterUserFromClub = nextMember => nextMember?.userSub !== reelayDBUser?.sub;
                club.members = club.members.filter(filterUserFromClub);

                dispatch({ type: 'setMyClubs', payload: myClubsRemoved });    
                navigation.popToTop();
                showMessageToast(`You've left ${club.name}`);
                await onRefresh();

                setClubMember(null);
                setLeaving(false);
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Could not leave club. Try again?');
                setLeaving(false);
            }
        }

        return (
            <LeaveButtonView onPress={leaveClub}>
                { leaving && <ActivityIndicator /> }
                { !leaving && <RemoveButtonText>{'Leave Club'}</RemoveButtonText> }
            </LeaveButtonView>
        );
    }

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
            club.topics = topics;


            const nextClubMember = club.members.find(matchClubMember);
            const clubMemberChanged = nextClubMember?.id !== clubMember?.id;
            if (nextClubMember) {
                if (clubMemberChanged) setClubMember(nextClubMember);
                nextClubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ 
                    authSession, 
                    clubMemberID: nextClubMember.id, 
                    reqUserSub: reelayDBUser?.sub,
                });
            } else {
                if (clubMemberChanged) setClubMember(null);
            }

            dispatch({ type: 'setUpdatedClub', payload: club });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }
    
    return (
        <InfoScreenView>
            <ClubTopBar />
            <ScrollView 
                contentContainerStyle={{ paddingBottom: bottomOffset }} 
                showsVerticalScrollIndicator={false}
            >
                { refreshing && <ActivityIndicator /> }
                { !refreshing && (
                    <ClubInfoView>
                        <ClubProfileInfo />
                        { canShareClubLink && <InviteSettings /> }
                        <HorizontalDivider />
                        { !isClubOwner && clubMember && <LeaveButton /> }
                        { !clubMember && isPublicClub && <JoinButton /> }
                        <ClubMembers />
                    </ClubInfoView>
                )}
            </ScrollView>
        </InfoScreenView>
    );
}
