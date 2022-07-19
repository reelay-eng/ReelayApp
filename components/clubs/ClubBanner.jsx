import React, { useCallback } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ClubPicture from '../global/ClubPicture';
import BackButton from '../utils/BackButton';
import ProfilePicture from '../global/ProfilePicture';
import { StainedGlassSVG } from '../global/SVGs';

const BackButtonContainer = styled(View)`
    margin-left: 6px;
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
`
const ClubNameText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-top: 4px;
    margin-bottom: 4px;
`
const HeaderBackground = styled(View)`
    align-items: center;
    background-color: ${props => props.solid 
        ? 'rgba(0,0,0,1)' 
        : 'rgba(0,0,0,0.35)'
    },
    flex-direction: row;
    justify-content: space-between;
    padding-left: 6px;
    padding-right: 16px;
    padding-bottom: 4px;
    padding-top: ${props => props.topOffset - 10}px;
    position: absolute;
    width: 100%;
`
const InfoButtonContainer = styled(TouchableOpacity)`
    height: 100%;
    justify-content: center;
    margin-left: 5px;
`
export default ClubBanner = ({ 
    club, 
    navigation, 
    onRefresh,
}) => {
    const topOffset = useSafeAreaInsets().top;
    const infoButtonTopOffset = topOffset + 28;

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

    const onRefreshCallback = useCallback(onRefresh, []);

    const advanceToClubInfoScreen = () => navigation.push('ClubInfoScreen', { club, onRefresh: onRefreshCallback });

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
            <BubbleBathHeaderContainer onPress={advanceToClubInfoScreen}>
                <BubbleBathContainer>
                    <BubbleBathLeft />
                    <ClubPicture club={club} size={48} />
                    <BubbleBathRight />
                </BubbleBathContainer>
                <ClubNameText>{club.name}</ClubNameText>
            </BubbleBathHeaderContainer>
        );
    }

    const StainedGlassButton = () => {
        const advanceToClubStainedGlassScreen = () => navigation.push('ClubStainedGlassScreen', { club });
        return (
            <InfoButtonContainer onPress={advanceToClubStainedGlassScreen} topOffset={infoButtonTopOffset}>
                <StainedGlassSVG />
            </InfoButtonContainer>
        );
    }

    return (
        <HeaderBackground solid={true} topOffset={topOffset}>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            <HeaderWithBubbleBath />
            <StainedGlassButton />
        </HeaderBackground>
    );
}
