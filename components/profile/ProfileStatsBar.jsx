import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';

const BarContainer = styled(View)`
    align-self: center;
    flex-direction: row;
`
const StatContainer = styled(Pressable)`
    align-items: center;
    width: 90px;
    margin: 10px;
`
const DimensionText = styled(Text)`
    font-family: System;
    font-size: 16px;
    font-weight: 400;
    color: white;
`
const StatText = styled(Text)`
    font-family: System;
    font-size: 20px;
    font-weight: 600;
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

    const viewFollows = ({ followType }) => {
        navigation.push('UserFollowScreen', {
            creator: creator,
            initFollowType: followType,
            initFollowers: followers,
            initFollowing: following,
        });
    }

    const viewFollowers = () => {
        viewFollows({ followType: 'Followers' });
        logEventWithPropertiesAsync('viewFollowers', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    }

    const viewFollowing = () => {
        viewFollows({ followType: 'Following' });
        logEventWithPropertiesAsync('viewFollowing', {
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
