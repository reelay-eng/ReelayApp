import React, { useContext, useEffect, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { getFollowers, getFollowing } from "../../api/ReelayDBApi";
import { AuthContext } from '../../context/AuthContext';

import * as Amplitude from 'expo-analytics-amplitude';

export default ProfileStatsBar = ({ navigation, reelayCount, creator }) => {
  const BarContainer = styled(View)`
    align-self: center;
    flex-direction: row;
  `;
  const StatContainer = styled(Pressable)`
    align-items: center;
    width: 90px;
    margin: 10px;
  `;
  const DimensionText = styled(Text)`
    font-family: System;
    font-size: 16px;
    font-weight: 400;
    color: white;
  `;
  const StatText = styled(Text)`
    font-family: System;
    font-size: 20px;
    font-weight: 600;
    color: white;
  `;
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const { user } = useContext(AuthContext);

    const isMyProfile = (creator.sub === user.attributes.sub);

    useEffect(() => {
        loadFollows();
    }, []);

    const loadFollows = async () => {
        const nextFollowers = await getFollowers(creator.sub);
        const nextFollowing = await getFollowing(creator.sub);

        setFollowers(nextFollowers);
        setFollowing(nextFollowing);
    }

    const viewFollowers = () => {
        // go to followers tab in followers following screen
        // console.log("followers");
        // const followers = await getFollowers(creator.sub);
        // console.log(followers)
        if (isMyProfile) {
            navigation.push('MyFollowScreen', {
                selectedTab: 'Followers',
                followers,
                following, 
            });
        } else {
            navigation.push('UserFollowScreen', {
                selectedTab: 'Followers',
                creator,
                followers,
                following, 
            });
        }
        Amplitude.logEventWithPropertiesAsync('viewFollowers', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    }

    const viewFollowing = () => {
        if (isMyProfile) {
            navigation.push('MyFollowScreen', {
                selectedTab: 'Following',
                followers,
                following, 
            });
        } else {
            navigation.push('UserFollowScreen', {
                selectedTab: 'Following',
                creator,
                followers,
                following, 
            });
        }
        Amplitude.logEventWithPropertiesAsync('viewFollowing', {
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
