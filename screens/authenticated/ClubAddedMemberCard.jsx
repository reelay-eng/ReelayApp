import React, { useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import moment from 'moment';
import ProfilePicture from '../../components/global/ProfilePicture';

const MemberAddedContainer = styled(View)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlack};
    border-radius: 12px;
    flex-direction: row;
    justify-content: center;
    padding: 12px;
    margin: 8px;
    max-width: 90%;
`
const MemberAddedText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 8px;
    max-width: 90%;
`

export default ClubAddedMemberCard = ({ member }) => {
    const timestamp = moment(member.createdAt).fromNow();
    const user = { sub: member?.userSub, username: member?.username };
    const activityMessage = (member.role === 'owner') 
        ? `${member.username} created the club  ${timestamp}`
        : ` ${member.username} was added by ${member.invitedByUsername}  ${timestamp}`;

    return (
        <MemberAddedContainer>
            <ProfilePicture user={user} size={24} />
            <MemberAddedText>{activityMessage}</MemberAddedText>
        </MemberAddedContainer>
    );
}