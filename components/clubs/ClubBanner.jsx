import React from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClubPicture from '../global/ClubPicture';
import BackButton from '../utils/BackButton';
import ProfilePicture from '../global/ProfilePicture';

const BackButtonContainer = styled(View)`
    left: 6px;
    justify-content: flex-end;
    position: absolute;
    top: ${props => props.topOffset}px;
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
const ClubNameText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-right: 4px;
`
const HeaderBackground = styled(Pressable)`
    align-items: flex-end;
    background-color: rgba(0,0,0,0.35);
    flex-direction: row;
    justify-content: center;
    padding-left: 6px;
    padding-right: 16px;
    padding-bottom: 10px;
    padding-top: ${props => props.topOffset}px;
    position: absolute;
    width: 100%;
`
const BubbleBathHeaderContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const CondensedHeaderContainer = styled(View)`
    align-items: center;
    flex-direction: column;
    justify-content: center;
`
const InfoButtonContainer = styled(TouchableOpacity)`
    flex-direction: row;
    margin-left: 5px;
    position: absolute;
    right: 16px;
    top: ${props => props.topOffset}px;
`
export default ClubBanner = ({ club, navigation, showBubbleBath = true, topicTitle = null }) => {
    const topOffset = useSafeAreaInsets().top;
    const backButtonTopOffset = (showBubbleBath) 
        ? topOffset + 20 
        : topOffset - 10;
    const infoButtonTopOffset = (showBubbleBath) 
        ? topOffset + 28 
        : topOffset - 2;

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

    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club });

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

    const CondensedHeader = () => {
        return (
            <CondensedHeaderContainer>
                <ClubNameText>{club.name}</ClubNameText>
                { topicTitle && <ClubNameText>{topicTitle}</ClubNameText> }
            </CondensedHeaderContainer>
        );
    }

    const HeaderWithBubbleBath = () => {
        return (
            <BubbleBathHeaderContainer>
                <BubbleBathContainer>
                    <BubbleBathLeft />
                    <ClubPicture club={club} size={48} />
                    <BubbleBathRight />
                </BubbleBathContainer>
                <ClubNameText>{club.name}</ClubNameText>
            </BubbleBathHeaderContainer>
        );
    }

    const InfoButton = () => {
        return (
            <InfoButtonContainer onPress={advanceToClubInfoScreen} topOffset={infoButtonTopOffset}>
                <Icon type='ionicon' name='information-circle-outline' size={30} color='white' />
            </InfoButtonContainer>
        );
    }

    return (
        <HeaderBackground onPress={advanceToClubInfoScreen} topOffset={topOffset}>
            <BackButtonContainer topOffset={backButtonTopOffset}>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            { showBubbleBath && <HeaderWithBubbleBath /> }
            { !showBubbleBath && <CondensedHeader /> }
            <InfoButton />
        </HeaderBackground>
    );
}
