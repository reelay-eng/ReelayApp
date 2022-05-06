import React, { useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, SafeAreaView, Switch, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import ClubPicture from '../../components/global/ClubPicture';
import { Icon } from 'react-native-elements';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

const BackButtonContainer = styled(SafeAreaView)`
    left: 0px;
    position: absolute;
`
const ClubHeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
`
const ClubDescriptionText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 8px;
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
const ProfileInfoContainer = styled(View)`
    align-items: center;
    margin-top: 20px;
    margin-bottom: 36px;
`
const SectionHeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const SettingsRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 16px;
    padding-bottom: 16px;
    width: 100%;
`
const SettingsRowRightButton = styled(TouchableOpacity)`
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
const ClubMembers = ({ club, navigation }) => {
    // todo
    return (
        <React.Fragment>
            <SectionHeaderText>{'Members'}</SectionHeaderText>
        </React.Fragment>
    );
}

const ClubProfileInfo = ({ club }) => {
    return (
        <ProfileInfoContainer>
            <ClubPicture club={club} size={120} />
            <ClubNameText>{club.name}</ClubNameText>
            <ClubDescriptionText>{club.description}</ClubDescriptionText>
        </ProfileInfoContainer>
    );
}

const ClubSettings = ({ club, navigation }) => {
    const advanceToInviteScreen = () => navigation.push('ClubInviteMembersScreen', { club });
    const [allowMemberInvites, setAllowMemberInvites] = useState(true);
    return (
        <React.Fragment>
            <SectionHeaderText>{'Settings'}</SectionHeaderText>
            <SettingsRow>
                <SettingsTextContainer>
                    <SettingsText>{'Quick Invite'}</SettingsText>
                    <SettingsSubtext>{'Members can invite other members'}</SettingsSubtext>
                </SettingsTextContainer>
                <Switch 
                    value={allowMemberInvites}
                    onValueChange={setAllowMemberInvites}
                    trackColor={{ 
                        false: "#39393D", 
                        true: ReelayColors.reelayGreen,
                    }}
                    thumbColor={"#FFFFFF"}
                    ios_backgroundColor="#39393D"    
                />
            </SettingsRow>
            <SettingsRow>
                <SettingsTextContainer>
                    <SettingsText>{'Add Members'}</SettingsText>
                    <SettingsSubtext>{'Invite more people to the club'}</SettingsSubtext>
                </SettingsTextContainer>
                <SettingsRowRightButton onPress={advanceToInviteScreen}>
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
        </React.Fragment>
    );
}

const ClubTopBar = ({ club, navigation }) => {
    const topOffset = useSafeAreaInsets().top;
    return (
        <TopBarContainer topOffset={topOffset}>
            <ClubHeaderText>{'Club Info'}</ClubHeaderText>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
        </TopBarContainer>
    );
}

const ClubEditButton = () => {
    // todo
}

export default ClubInfoScreen = ({ navigation, route }) => {
    const { club } = route?.params;
    return (
        <InfoScreenContainer>
            <ClubTopBar club={club} navigation={navigation} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <ClubProfileInfo club={club} />
                <ClubSettings club={club} navigation={navigation} />
                <HorizontalDivider />
                <ClubMembers club={club} navigation={navigation} />
            </ScrollView>
        </InfoScreenContainer>
    );
}
