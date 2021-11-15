import React from "react";
import { View, Pressable, Text } from "react-native";
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";
import { Reelay } from "../../src/models";

export default FollowButtonBar = ({ user }) => {
  const FollowContainer = styled(View)`
    align-self: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 20px;
  `;
  const FollowButton = styled(Pressable)`
    align-self: center;
    width: 75%;
    borderRadius: 36px;
    height: 50px;
    align-items: center;
    justify-content: center;
  `;
  const FollowText = styled(Text)`
    fontSize: 18;
    lineHeight: 21px; 
    font-weight: bold;
    color: white;
  `;

  const followUser= () => {
      console.log("follow user")
  }

  return (
    <FollowContainer>
      <FollowButton onPress={followUser} style={{
            backgroundColor: ReelayColors.reelayRed}}>
        <FollowText>{"Follow"}</FollowText>
      </FollowButton>
    </FollowContainer>
  );
};
