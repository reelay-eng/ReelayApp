import React, { useContext, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClubPicture from '../global/ClubPicture';
import BackButton from '../utils/BackButton';
import ProfilePicture from '../global/ProfilePicture';
import { FiltersSVG, StainedGlassSVG } from '../global/SVGs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleInfo, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import ReelayColors from '../../constants/ReelayColors';
import AddTitleOrTopicDrawer from './AddTitleOrTopicDrawer';
import { AuthContext } from '../../context/AuthContext';
import InviteMyFollowsDrawer from './InviteMyFollowsDrawer';

const AddActivityText = styled(ReelayText.Body1)`
    color: ${ReelayColors.reelayBlue};
`
const BackButtonContainer = styled(View)`
    margin: 6px;
`
const BannerButtonPressable = styled(TouchableOpacity)`
    background-color: ${props => props.background ? '#d4d4d4' : 'transparent'};
    border-radius: 30px;
    justify-content: center;
    padding: 6px;
    margin-left: 4px;
`
const BannerRightButtonsView = styled(View)`
    align-items: center;
    flex-direction: row;
`
const BannerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`
const BubbleBathContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const BubbleBathLeftContainer = styled(View)`
    height: 48px;
    margin-right: 8px;
`
const BubbleBathRightContainer = styled(View)`
    height: 48px;
    margin-left: 8px;
`
const BubbleLeftOneContainer = styled(View)`
    position: absolute;
    align-items: flex-end;
    top: 0px;
    right: 0px;
`
const BubbleLeftTwoContainer = styled(View)`
    position: absolute;
    top: 30px;
    right: 0px;
`
const BubbleLeftThreeContainer = styled(View)`
    position: absolute;
    top: 27px;
    right: 24px;
`
const BubbleLeftFourContainer = styled(View)`
    position: absolute;
    top: 6px;
    right: 33px;
`
const BubbleLeftFiveContainer = styled(View)`
    position: absolute;
    top: 24px;
    right: 48px;
`
const BubbleRightOneContainer = styled(View)`
    position: absolute;
    top: 24px;
    left: 0px;
`
const BubbleRightTwoContainer = styled(View)`
    position: absolute;
    top: 0px;
    left: 0px;
`
const BubbleRightThreeContainer = styled(View)`
    position: absolute;
    top: 3px;
    left: 24px;
`
const BubbleRightFourContainer = styled(View)`
    position: absolute;
    top: 24px;
    left: 30px;
`
const BubbleRightFiveContainer = styled(View)`
    position: absolute;
    top: 8px;
    left: 48px;
`
const BubbleBathHeaderContainer = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    margin-left: ${props => props.showInviteButton ? 36 : 0}px;
`
const ClubNameText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-right: 6px;
`
const ClubNameView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 4px;
`
const HeaderBackground = styled(View)`
    background-color: rgba(0,0,0,1);
    padding-left: 6px;
    padding-right: 16px;
    padding-bottom: 4px;
    padding-top: ${props => props.topOffset - 10}px;
    position: absolute;
    width: 100%;
`
export default ClubBanner = ({ club, navigation, source = 'activity' }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [showAddActivityDrawer, setShowAddActivityDrawer] = useState(false);
    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club });

    const clubHasMediaActivities = (club?.titles?.length > 0 || club?.topics?.length > 0);
    const infoButtonTopOffset = topOffset + 28;
    const isClubOwner = (reelayDBUser?.sub === club.creatorSub);

    const showAddActivityButton = (source === 'media' || !clubHasMediaActivities);
    const showInviteButton = (source === 'activity' && (isClubOwner || club.membersCanInvite));
    const topOffset = useSafeAreaInsets().top;

    if (!club.members.length) return <View />;

    const bubbleBathLeftMembers = club.members.filter((clubMember, index) => {
        if (index >= 10) return false;
        return (index % 2 === 0);
    }).map((clubMember) => {
        return { sub: clubMember.userSub, username: clubMember.username } 
    });

    const bubbleBathRightMembers = club.members.filter((clubMember, index) => {
        if (index >= 10) return false;
        return (index % 2 === 1);
    }).map((clubMember) => {
        return { sub: clubMember.userSub, username: clubMember.username }
    });

    const AddActivityButton = () => {
        const openDrawer = () => setShowAddActivityDrawer(true);
        return (
            <BannerButtonPressable onPress={openDrawer} topOffset={infoButtonTopOffset}>
                <AddActivityText>{'Add'}</AddActivityText>
                { showAddActivityDrawer && (
                    <AddTitleOrTopicDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={showAddActivityDrawer}
                        setDrawerVisible={setShowAddActivityDrawer}
                    />
                )}
            </BannerButtonPressable>
        );
    }

    const BubbleBathLeft = () => {
        return (
            <BubbleBathLeftContainer>
                { bubbleBathLeftMembers.length > 0 && (
                    <BubbleLeftOneContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[0]} size={24} />
                    </BubbleLeftOneContainer>
                )}
                { bubbleBathLeftMembers.length > 1 && (
                    <BubbleLeftTwoContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[1]} size={17} />
                    </BubbleLeftTwoContainer>
                )}
                { bubbleBathLeftMembers.length > 2 && (
                    <BubbleLeftThreeContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[2]} size={17} />
                    </BubbleLeftThreeContainer>
                )}
                { bubbleBathLeftMembers.length > 3 && (
                    <BubbleLeftFourContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[3]} size={17} />
                    </BubbleLeftFourContainer>
                )}
                { bubbleBathLeftMembers.length > 4 && (
                    <BubbleLeftFiveContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[4]} size={14} />
                    </BubbleLeftFiveContainer>
                )}
            </BubbleBathLeftContainer>
        );
    }

    const BubbleBathRight = () => {
        return (
            <BubbleBathRightContainer>
                { bubbleBathRightMembers.length > 0 && (
                    <BubbleRightOneContainer>
                        <ProfilePicture user={bubbleBathRightMembers[0]} size={24} />
                    </BubbleRightOneContainer>
                )}
                { bubbleBathRightMembers.length > 1 && (
                    <BubbleRightTwoContainer>
                        <ProfilePicture user={bubbleBathRightMembers[1]} size={18} />
                    </BubbleRightTwoContainer>
                )}
                { bubbleBathRightMembers.length > 2 && (
                    <BubbleRightThreeContainer>
                        <ProfilePicture user={bubbleBathRightMembers[2]} size={18} />
                    </BubbleRightThreeContainer>
                )}
                { bubbleBathRightMembers.length > 3 && (
                    <BubbleRightFourContainer>
                        <ProfilePicture user={bubbleBathRightMembers[3]} size={18} />
                    </BubbleRightFourContainer>
                )}
                { bubbleBathRightMembers.length > 4 && (
                    <BubbleRightFiveContainer>
                        <ProfilePicture user={bubbleBathRightMembers[4]} size={14} />
                    </BubbleRightFiveContainer>
                )}
            </BubbleBathRightContainer>
        );
    }

    const HeaderWithBubbleBath = () => {
        return (
            <BubbleBathHeaderContainer showInviteButton={showInviteButton} onPress={advanceToClubInfoScreen}>
                <BubbleBathContainer>
                    <BubbleBathLeft />
                    <ClubPicture club={club} size={48} />
                    <BubbleBathRight />
                </BubbleBathContainer>
                <ClubNameView>
                    <ClubNameText>{club.name}</ClubNameText>
                    <FontAwesomeIcon icon={faCircleInfo} color='white' size={14} />
                </ClubNameView>
            </BubbleBathHeaderContainer>
        );
    }

    const InviteButton = () => {
        const [inviteDrawerVisible, setInviteDrawerVisible] = useState(false);
        const openDrawer = () => setInviteDrawerVisible(true);
        const closeDrawer = () => setInviteDrawerVisible(false);

        return (
            <BannerButtonPressable background={true} onPress={openDrawer} topOffset={infoButtonTopOffset}>
                <FontAwesomeIcon icon={faUserPlus} color='black' size={20} />
                { inviteDrawerVisible && (
                    <InviteMyFollowsDrawer
                        club={club}
                        closeDrawer={closeDrawer}
                        onRefresh={() => {}} // todo
                    />
                )}
            </BannerButtonPressable>
        );
    }

    const MediaButton = () => {
        const advanceToClubMediaScreen = () => navigation.push('ClubMediaScreen', { club });
        const hasClubActivities = (club?.topics?.length + club?.titles?.length) > 0;
        if (!hasClubActivities) return <BannerButtonPressable />;

        return (
            <BannerButtonPressable onPress={advanceToClubMediaScreen} topOffset={infoButtonTopOffset}>
                <StainedGlassSVG />
            </BannerButtonPressable>
        );
    }

    return (
        <HeaderBackground solid={true} topOffset={topOffset}>
            <BannerRowView>
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <HeaderWithBubbleBath />
                <BannerRightButtonsView>
                { showInviteButton && <InviteButton /> }
                { !showAddActivityButton && <MediaButton /> }
                { showAddActivityButton && <AddActivityButton /> }
                </BannerRightButtonsView>
            </BannerRowView>
        </HeaderBackground>
    );
}
