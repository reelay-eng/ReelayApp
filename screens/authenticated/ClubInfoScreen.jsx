import React, { useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { editClub, getClubMembers, getClubTitles } from '../../api/ClubsApi';
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast } from '../../components/utils/toasts';

const BackButtonContainer = styled(SafeAreaView)`
    left: 0px;
    position: absolute;
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
`
const ClubDescriptionText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 16px;
`
const ClubPrivacyRow = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    justify-content: center;
    margin-top: 4px;
    width: 100%;
`
const ClubPrivacyText = styled(ReelayText.Body2)`
    color: white;
    margin-right: 8px;
    padding-top: 4px;
`
const ClubNameText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 20px;
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
const MemberInfoContainer = styled(View)`
    align-items: center;
    flex-direction: row;
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
    margin-top: 20px;
    margin-bottom: 36px;
`
const ProfilePictureContainer = styled(View)`
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 10px;
`
const SectionHeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
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
    justify-content: center;
    height: ${(props) => props.topOffset + 40}px;
    padding-top: ${(props) => props.topOffset}px;
    width: 100%;
`
const TopBarRightContainer = styled(SafeAreaView)`
    right: 0px;
    position: absolute;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
`
const UsernameContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
`
const ClubMembers = ({ clubMembers, navigation }) => {
    return (
        <React.Fragment>
            <SectionHeaderText>{'Members'}</SectionHeaderText>
            <MemberSectionSpacer />
            { clubMembers.map((member) => {
                return <ClubMemberRow key={member.userSub} member={member} navigation={navigation} /> 
            })}
        </React.Fragment>
    );
}

const ClubMemberRow = ({ member, navigation }) => {
    const user = {
        sub: member.userSub,
        username: member.username,
    }
    const advanceToUserProfile = () => {
        navigation.push('UserProfileScreen', { creator: user });
    }
    return (
        <MemberRowContainer onPress={() => advanceToUserProfile}>
            <MemberInfoContainer>
                <ProfilePictureContainer>
                    <ProfilePicture user={user} size={32} navigation={navigation} />
                </ProfilePictureContainer>
                <UsernameContainer>
                    <UsernameText>{member.username}</UsernameText>
                </UsernameContainer>
            </MemberInfoContainer>
            <FollowButton creator={user} />
        </MemberRowContainer>
    )
}

const ClubProfileInfo = ({ club }) => {
    return (
        <ProfileInfoContainer>
            <ClubPicture club={club} size={120} />
            <ClubDescriptionText>{club.description}</ClubDescriptionText>
            {/* <ClubDescriptionText>{'Private'}</ClubDescriptionText> */}
        </ProfileInfoContainer>
    );
}

const ClubSettings = ({ club, onRefresh }) => {
    const [allowMemberInvites, setAllowMemberInvites] = useState(true);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);

    const switchAllowMemberInvites = async () => {
        const shouldAllow = !allowMemberInvites;
        setAllowMemberInvites(shouldAllow);
        const patchResult = await editClub({
            clubID: club.id,
            membersCanInvite: shouldAllow,
            reqUserSub: reelayDBUser?.sub,
        });
        console.log(patchResult);
    }

    return (
        <React.Fragment>
            <SectionHeaderText>{'Settings'}</SectionHeaderText>
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
            <SettingsRow onPress={() => setInviteDrawerVisible(true)}>
                <SettingsTextContainer>
                    <SettingsText>{'Add Members'}</SettingsText>
                    <SettingsSubtext>{'Invite more people to the club'}</SettingsSubtext>
                </SettingsTextContainer>
                <SettingsRowRightButton>
                    <Icon type='ionicon' name='person-add' color='white' size={24} />
                </SettingsRowRightButton>
            </SettingsRow>
            <SettingsRow>
                <SettingsTextContainer>
                    <SettingsText>{'Send Link'}</SettingsText>
                    <SettingsSubtext>{'Share the club link'}</SettingsSubtext>
                </SettingsTextContainer>
                <SettingsRowRightButton>
                    <FontAwesomeIcon icon={ faLink } size={24} color='white' />
                </SettingsRowRightButton>
            </SettingsRow>
            { inviteDrawerVisible && (
                <InviteMyFollowsDrawer
                    club={club}
                    drawerVisible={inviteDrawerVisible}
                    setDrawerVisible={setInviteDrawerVisible}
                    onRefresh={onRefresh}
                    provideSkipOption={false}
                />
            )}
        </React.Fragment>
    );
}

const ClubTopBar = ({ club, navigation }) => {
    const topOffset = useSafeAreaInsets().top;
    return (
        <TopBarContainer topOffset={topOffset}>
            <ClubHeaderText numberOfLines={1}>{club.name}</ClubHeaderText>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            <TopBarRightContainer>
            <ClubPrivacyRow>
                <ClubPrivacyText>{'Private'}</ClubPrivacyText>
                <Icon type='ionicon' name='lock-closed' color='white' size={24} />
            </ClubPrivacyRow>
            </TopBarRightContainer>
        </TopBarContainer>
    );
}

const ClubEditButton = () => {
    // todo
}

export default ClubInfoScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { club } = route?.params;
    const myClubs = useSelector(state => state.myClubs);
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom;

    const [refreshing, setRefreshing] = useState(false);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    const onRefresh = async () => {
        try { 
            setRefreshing(true);
            const [titles, members] = await Promise.all([
                getClubTitles(club.id, reelayDBUser?.sub),
                getClubMembers(club.id, reelayDBUser?.sub),
            ]);
            club.titles = titles;
            club.members = members;
            dispatch({ type: 'setMyClubs', payload: myClubs });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        onRefresh();
    }, []);


    return (
        <InfoScreenContainer>
            <ClubTopBar club={club} navigation={navigation} />
            <ScrollView 
                contentContainerStyle={{ paddingBottom: bottomOffset }} 
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
            >
                <ClubProfileInfo club={club} />
                <ClubSettings club={club} onRefresh={onRefresh} />
                <HorizontalDivider />
                <ClubMembers clubMembers={club.members} navigation={navigation} />
            </ScrollView>
        </InfoScreenContainer>
    );
}
