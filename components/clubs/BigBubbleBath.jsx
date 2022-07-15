import React from 'react';
import { View } from 'react-native';
import ClubPicture from '../global/ClubPicture';
import ProfilePicture from '../global/ProfilePicture';
import styled from 'styled-components/native';

const BubbleBathContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const BubbleBathHeaderContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const BubbleBathLeftContainer = styled(View)`
    height: 72px;
    margin-right: 8px;
`
const BubbleBathRightContainer = styled(View)`
    height: 72px;
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
    top: 45px;
    right: 0px;
`
const BubbleLeftThreeContainer = styled(View)`
    position: absolute;
    top: 40px;
    right: 32px;
`
const BubbleLeftFourContainer = styled(View)`
    position: absolute;
    top: 9px;
    right: 42px;
`
const BubbleLeftFiveContainer = styled(View)`
    position: absolute;
    top: 36px;
    right: 68px;
`
const BubbleRightOneContainer = styled(View)`
    position: absolute;
    top: 36px;
    left: 0px;
`
const BubbleRightTwoContainer = styled(View)`
    position: absolute;
    top: 0px;
    left: 0px;
`
const BubbleRightThreeContainer = styled(View)`
    position: absolute;
    top: 6px;
    left: 33px;
`
const BubbleRightFourContainer = styled(View)`
    position: absolute;
    top: 36px;
    left: 45px;
`
const BubbleRightFiveContainer = styled(View)`
    position: absolute;
    top: 15px;
    left: 68px;
`

export default BigBubbleBath = ({ club }) => {
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

    const BubbleBathLeft = () => {
        return (
            <BubbleBathLeftContainer>
                { bubbleBathLeftMembers.length > 0 && (
                    <BubbleLeftOneContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[0]} size={36} />
                    </BubbleLeftOneContainer>
                )}
                { bubbleBathLeftMembers.length > 1 && (
                    <BubbleLeftTwoContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[1]} size={27} />
                    </BubbleLeftTwoContainer>
                )}
                { bubbleBathLeftMembers.length > 2 && (
                    <BubbleLeftThreeContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[2]} size={27} />
                    </BubbleLeftThreeContainer>
                )}
                { bubbleBathLeftMembers.length > 3 && (
                    <BubbleLeftFourContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[3]} size={27} />
                    </BubbleLeftFourContainer>
                )}
                { bubbleBathLeftMembers.length > 4 && (
                    <BubbleLeftFiveContainer>
                        <ProfilePicture user={bubbleBathLeftMembers[4]} size={21} />
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
                        <ProfilePicture user={bubbleBathRightMembers[0]} size={36} />
                    </BubbleRightOneContainer>
                )}
                { bubbleBathRightMembers.length > 1 && (
                    <BubbleRightTwoContainer>
                        <ProfilePicture user={bubbleBathRightMembers[1]} size={27} />
                    </BubbleRightTwoContainer>
                )}
                { bubbleBathRightMembers.length > 2 && (
                    <BubbleRightThreeContainer>
                        <ProfilePicture user={bubbleBathRightMembers[2]} size={27} />
                    </BubbleRightThreeContainer>
                )}
                { bubbleBathRightMembers.length > 3 && (
                    <BubbleRightFourContainer>
                        <ProfilePicture user={bubbleBathRightMembers[3]} size={27} />
                    </BubbleRightFourContainer>
                )}
                { bubbleBathRightMembers.length > 4 && (
                    <BubbleRightFiveContainer>
                        <ProfilePicture user={bubbleBathRightMembers[4]} size={21} />
                    </BubbleRightFiveContainer>
                )}
            </BubbleBathRightContainer>
        );
    }
    
    return (
        <BubbleBathHeaderContainer>
            <BubbleBathContainer>
                <BubbleBathLeft />
                <ClubPicture border club={club} size={120} />
                <BubbleBathRight />
            </BubbleBathContainer>
        </BubbleBathHeaderContainer>
    );
}
