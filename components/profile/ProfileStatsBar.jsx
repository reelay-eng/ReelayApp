import React from 'react';
import { Text, View, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { getFollowers, getFollowing } from "../../api/ReelayDBApi";

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

    console.log(creator.sub);

    const followers = getFollowers(creator.sub);
    const following = getFollowing(creator.sub);

    return (
      <BarContainer>
        <StatContainer>
          <StatText>{reelayCount}</StatText>
          <DimensionText>{"Reelays"}</DimensionText>
        </StatContainer>
        <StatContainer
          onPress={async () => {
            // go to followers tab in followers following screen
            console.log("followers");
            console.log(followers);
          }}
        >
          <StatText>{ followers ? followers.length : 0}</StatText>
          <DimensionText>{"Followers"}</DimensionText>
        </StatContainer>
        <StatContainer
          onPress={() => {
            // go to following tab in followers following screen
            console.log("following");
            console.log(following);
          }}
        >
          <StatText>{ following ? following.length : 0}</StatText>
          <DimensionText>{"Following"}</DimensionText>
        </StatContainer>
      </BarContainer>
    );
};
