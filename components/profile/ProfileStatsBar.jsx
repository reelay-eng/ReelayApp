import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';

const BarContainer = styled(View)`
    align-self: center;
    flex-direction: row;
`
const StatContainer = styled(Pressable)`
    align-items: center;
    width: 90px;
    margin: 10px;
`
const DimensionText = styled(ReelayText.Subtitle1)`
    color: white;
`
const StatText = styled(ReelayText.H6Emphasized)`
    color: white;
`

export default ProfileStatsBar = ({ 
    navigation, 
    reelayCount, 
    creator, 
    followers, 
    following,
}) => {

    const { reelayDBUser } = useContext(AuthContext);
    const { setJustShowMeSignupVisible } = useContext(FeedContext);

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			setJustShowMeSignupVisible(true);
			return true;
		}
		return false;
	}
    const viewFollows = ({ followType }) => {
        if (showMeSignupIfGuest()) return;
        navigation.push('UserFollowScreen', {
            creator: creator,
            initFollowType: followType,
            initFollowers: followers,
            initFollowing: following,
        });
    }

    const viewFollowers = () => {
        if (showMeSignupIfGuest()) return;
        viewFollows({ followType: 'Followers' });
        logAmplitudeEventProd('viewFollowers', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    }

    const viewFollowing = () => {
        if (showMeSignupIfGuest()) return;
        viewFollows({ followType: 'Following' });
        logAmplitudeEventProd('viewFollowing', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    }
    
    return (
        <BarContainer>
            <StatContainer>
                <StatText>{reelayCount}</StatText>
                <DimensionText>{"Reelays"}</DimensionText>
            </StatContainer>
            <StatContainer onPress={viewFollowers}>
                <StatText>{ followers ? followers.length : 0}</StatText>
                <DimensionText>{"Followers"}</DimensionText>
            </StatContainer>
            <StatContainer onPress={viewFollowing}>
                <StatText>{ following ? following.length : 0}</StatText>
                <DimensionText>{"Following"}</DimensionText>
            </StatContainer>
        </BarContainer>
    );
};
