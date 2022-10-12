import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import styled from 'styled-components/native';
import moment from 'moment';

import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { Icon } from 'react-native-elements';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEarthAmerica, faLink, faLock, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

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
    updateNotifyChatMessages,
    updateNotifyChatMentions, 
    updateNotifyPostedReelays,
} from '../../api/ClubsApi';

import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import BigBubbleBath from '../../components/clubs/BigBubbleBath';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import ChangeClubPrivacyDrawer from '../../components/clubs/ChangeClubPrivacyDrawer';
import { notifyClubOnPrivacyChanges } from '../../api/ClubNotifications';
import { HeaderWithBackButton } from '../../components/global/Headers';
import ShareClubDrawer from '../../components/clubs/ShareClubDrawer';
import { ShareOutSVG } from '../../components/global/SVGs';

const INVITE_BASE_URL = Constants.manifest.extra.reelayWebInviteUrl;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const { width } = Dimensions.get('window');

const AllMembersCard = styled(View)`
    background-color: black;
    border-color: #1c1c1c;
    border-bottom-color: black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-width: 2px;
    padding: 16px;
    width: ${width + 6}px;
`
const ChangePrivacyView = styled(View)`
    margin-left: 16px;
`
const ClubHeaderInfoView = styled(View)`
    align-items: center;
    padding: 16px;
    padding-bottom: 32px;
`
const ClubHeaderRow = styled(View)`
    align-items: center;
    flex-direction: row;
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 4px;
`
const ClubDescriptionText = styled(ReelayText.Body2)` 
    color: white;
    margin-top: 10px;
`
const ClubInfoView = styled(View)`
    align-items: center;
    padding-top: 16px;
`
const ClubPrivacyRow = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-top: 12px;
    padding-bottom: 24px;
`
const ClubPrivacyText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-top: 4px;
    margin-left: 6px;
`
const EditButtonPressable = styled(TouchableOpacity)`
    padding: 10px;
`
const EditButtonText = styled(ReelayText.Body2)`
    color: ${ReelayColors.reelayBlue};
`
const InfoScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const InviteSettingsView = styled(View)`
    border-color: #1c1c1c;
    border-bottom-color: black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-width: 2px;
    padding: 16px;
    width: ${width + 6}px;
`
const JoinButtonView = styled(TouchableOpacity)`
    align-items: center;
    align-self: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 24px;
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    width: ${width / 2}px;
`
const LeaveButtonText = styled(ReelayText.Body2)`
    color: ${ReelayColors.reelayBlue};
`
const LeaveButtonView = styled(TouchableOpacity)`
    align-self: center;
    margin-top: 24px;
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
const NotificationSettingsView = styled(View)`
    border-color: #1c1c1c;
    border-bottom-color: black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-width: 2px;
    padding: 16px;
    width: ${width + 6}px;
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
    width: ${width - 100}px;
`
const SettingsText = styled(ReelayText.Body1)`
    color: white;
`
const SettingsTextView = styled(View)`
`
const TopBarView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: ${(props) => props.topOffset}px;
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
    const canInviteMembers = (isClubOwner || club.membersCanInvite);
    const canShareClubLink = (canInviteMembers || isPublicClub);

    const ClubEditButton = () => {
        const advanceToEditClubScreen = () => navigation.push('EditClubScreen', { club });
        return (
            <EditButtonPressable onPress={advanceToEditClubScreen}>
                <FontAwesomeIcon icon={faPenToSquare} color='white' size={20} />
            </EditButtonPressable>
        );
    }

    const ClubMembers = () => {
        const [isEditing, setIsEditing] = useState(false);
        const shouldCountMember = (member) => (member?.hasAcceptedInvite && member.role !== 'banned');
        const memberCount = club.members.reduce((count, member) => {
            return (shouldCountMember(member)) ? count + 1 : count;
        }, 0);

        const sortedMembers = club.members.sort((member0, member1) => {
            if (!member0.hasAcceptedInvite && member1.hasAcceptedInvite) return 1;
            if (member0.hasAcceptedInvite && !member1.hasAcceptedInvite) return -1;
            return member1.username < member0.username;
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
            <AllMembersCard>
                { !canShareClubLink && <PrivacyIndicator /> }
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
                    { !isClubOwner && clubMember && <LeaveButton /> }
                </MemberListView>
            </AllMembersCard>
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
                    showErrorToast('Ruh roh! Could not ban member. Try again?');
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
                    showErrorToast('Ruh roh! Could not remove member. Try again?');
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
    
    const ClubHeaderInfo = () => {
        return (
            <ClubHeaderInfoView>
                <BigBubbleBath club={club} />
                <ProfileSpacer />
                <ClubHeaderRow>
                    <ClubHeaderText>{club.name}</ClubHeaderText>
                    { isClubOwner && <ClubEditButton club={club} navigation={navigation} /> }
                </ClubHeaderRow>
                <ClubDescriptionText>{club.description}</ClubDescriptionText>
                { !clubMember && isPublicClub && <JoinButton /> }
            </ClubHeaderInfoView>
        );
    }

    const ClubTopBar = () => {
        const topOffset = useSafeAreaInsets().top;
        return (
            <TopBarView topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text={'chat details'} />
            </TopBarView>
        );
    }

    const NotificationSettings = () => {
        const [allowNotifyMessages, setAllowNotifyMessages] = useState(true);
        const [allowNotifyMentions, setAllowNotifyMentions] = useState(true);
        const [allowNotifyPosts, setAllowNotifyPosts] = useState(true);
    
        const switchAllowNotifyMessages = async () => {
            const shouldAllow = !allowNotifyMessages;
            setAllowNotifyMessages(shouldAllow);
            const patchResult = await updateNotifyChatMessages({
                authSession,
                clubID: club.id,
                notifyChatMessages: shouldAllow,
                reqUserSub: reelayDBUser?.sub,
            });
        }

        const switchAllowNotifyMentions = async () => {
            const shouldAllow = !allowNotifyMentions;
            setAllowNotifyMentions(shouldAllow);
            const patchResult = await updateNotifyChatMentions({
                authSession,
                clubID: club.id,
                notifyChatMentions: shouldAllow,
                reqUserSub: reelayDBUser?.sub,
            });
        }
    
        const switchAllowNotifyPosts = async () => {
            const shouldAllow = !allowNotifyPosts;
            setAllowNotifyPosts(shouldAllow);
            const patchResult = await updateNotifyPostedReelays({
                authSession,
                clubID: club.id,
                notifyPostedReelays: shouldAllow,
                reqUserSub: reelayDBUser?.sub,
            });
        }
    
        const AllowNotifyMessagesSetting = () => {
            return (
                <SettingsRow onPress={switchAllowNotifyMessages}>
                    <SettingsTextView>
                        <SettingsText>{'Allow message notifications'}</SettingsText>
                        <SettingsSubtext>{'Get notified when conversations happen in this chat'}</SettingsSubtext>
                    </SettingsTextView>
                    <Switch 
                        value={allowNotifyMessages}
                        onValueChange={switchAllowNotifyMessages}
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

        const AllowNotifyMentionsSetting = () => {
            return (
                <SettingsRow onPress={switchAllowNotifyMentions}>
                    <SettingsTextView>
                        <SettingsText>{'Allow notifications on mention'}</SettingsText>
                        <SettingsSubtext>{'Get notified when you\'re directly mentioned in the chat'}</SettingsSubtext>
                    </SettingsTextView>
                    <Switch 
                        value={allowNotifyMentions}
                        onValueChange={switchAllowNotifyMentions}
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
    
        const AllowNotifyPostsSetting = () => {
            return (
                <SettingsRow onPress={switchAllowNotifyPosts}>
                    <SettingsTextView>
                        <SettingsText>{'Allow post notifications'}</SettingsText>
                        <SettingsSubtext>{'Get notified when reelays are posted in this chat'}</SettingsSubtext>
                    </SettingsTextView>
                    <Switch 
                        value={allowNotifyPosts}
                        onValueChange={switchAllowNotifyPosts}
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
    
        return (
            <NotificationSettingsView>
                <SectionHeaderText>{'Notifications'}</SectionHeaderText>
                <AllowNotifyMessagesSetting />
                <AllowNotifyMentionsSetting />
                <AllowNotifyPostsSetting />
            </NotificationSettingsView>
        );
    }
    
    const InviteSettings = () => {
        const { reelayDBUser } = useContext(AuthContext);
        const [allowMemberInvites, setAllowMemberInvites] = useState(club.membersCanInvite);
        const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
        const [isPrivate, setIsPrivate] = useState(club?.visibility === 'private');
        const closeInviteDrawer = () => setInviteDrawerVisible(false);

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
                        <SettingsSubtext>{'People in the chat can invite others'}</SettingsSubtext>
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
                        <SettingsSubtext>{'Invite more people to the chat'}</SettingsSubtext>
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
                ? 'Private Chat'
                : 'Public Chat';

            const bodyText = (isPrivateSetting)
                ? 'Closed group. Invite people to the chat'
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
            const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
            const closeDrawer = () => setShareDrawerOpen(false);
        
            // const copyClubLinkToClipboard = async () => {
            //     try {
            //         const clubLinkObj = await createDeeplinkPathToClub({
            //             authSession,
            //             clubID: club.id,
            //             invitedByUserSub: reelayDBUser?.sub,
            //             invitedByUsername: reelayDBUser?.username,
            //         });

            //         console.log(clubLinkObj);
            //         if (clubLinkObj?.inviteCode && !clubLinkObj?.error) {
            //             const copyLink = INVITE_BASE_URL + clubLinkObj.inviteCode;
            //             Clipboard.setStringAsync(copyLink).then(onfulfilled => {
            //                 showMessageToast('Invite link copied to clipboard!');
            //             });
            //         }

            //         logAmplitudeEventProd('copyClubInviteLink', {
            //             username: reelayDBUser?.username,
            //             userSub: reelayDBUser?.sub,
            //             clubID: club?.id,
            //             club: club?.name,
            //             inviteCode: clubLinkObj?.inviteCode,
            //         });

            //     } catch (error) {
            //         console.log(error);
            //         showErrorToast('Ruh roh! Couldn\'t copy the club link. Try again?');
            //     }                
            // }

            return (
                <SettingsRow onPress={() => setShareDrawerOpen(true)}>
                    <SettingsTextView>
                        <SettingsText>{'Share out'}</SettingsText>
                        <SettingsSubtext>{'Share the chat link outside the app'}</SettingsSubtext>
                    </SettingsTextView>
                    <SettingsRowRightButton>
                        <ShareOutSVG />
                        {/* <FontAwesomeIcon icon={ faLink } size={24} color='white' /> */}
                    </SettingsRowRightButton>
                    { shareDrawerOpen && (
                        <ShareClubDrawer club={club} closeDrawer={closeDrawer} navigation={navigation} />
                    )}
                </SettingsRow>
            );
        }
    
        return (
            <InviteSettingsView>
                <PrivacyIndicator isPrivate={isPrivate}/>
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
                        closeDrawer={closeInviteDrawer}
                        onRefresh={onRefresh}
                    />
                )}
            </InviteSettingsView>
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
                { !joining && <RemoveButtonText>{'Join Chat'}</RemoveButtonText> }
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
                showErrorToast('Ruh roh! Could not leave chat. Try again?');
                setLeaving(false);
            }
        }

        return (
            <LeaveButtonView onPress={leaveClub}>
                { leaving && <ActivityIndicator /> }
                { !leaving && <LeaveButtonText>{'Leave Chat Group'}</LeaveButtonText> }
            </LeaveButtonView>
        );
    }

    const PrivacyIndicator = ({ isPrivate }) => {
        const displayIsPrivate = isPrivate ?? (club?.visibility === 'private');
        return (
            <ClubPrivacyRow>
                { displayIsPrivate && (
                    <FontAwesomeIcon icon={faLock} color='white' size={20} />
                )}
                { !displayIsPrivate && (
                    <FontAwesomeIcon icon={faEarthAmerica} color='white' size={20} />
                )}
                <ClubPrivacyText>{displayIsPrivate ? 'Private' : 'Public'}</ClubPrivacyText>
            </ClubPrivacyRow>
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
                        <ClubHeaderInfo />
                        { canShareClubLink && <InviteSettings /> }
                        { clubMember && <NotificationSettings /> }
                        <ClubMembers />
                    </ClubInfoView>
                )}
            </ScrollView>
        </InfoScreenView>
    );
}
