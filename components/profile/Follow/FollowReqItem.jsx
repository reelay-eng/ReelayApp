import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import styled from "styled-components/native";

import { acceptFollowRequest, rejectFollowRequest } from "../../../api/ReelayDBApi";
import { ReelayColors } from "../../../constants/ReelayColors";

const PressableContainer = styled(Pressable)`
  align-items: center;
  flex-direction: row;
  height: 100px;
  margin-left: 10px;
  width: 100%;
`;
const UsernameText = styled.Text`
    color: white
    font-size: 18px;
`;
const UsernameContainer = styled.View`
  align-items: flex-start;
  justify-content: center;
`;
const ProfilePicture = styled(Image)`
  border-radius: 50px;
  height: 45px;
  width: 45px;
`;
const ProfilePictureContainer = styled(View)`
  border-color: white;
  border-radius: 50px;
  border-width: 2px;
  margin: 10px;
  height: 50px;
  width: 50px;
`;
const ActionBar = styled(View)`
  justify-content: flex-end;
  flex-direction: row;
  margin-left: 10px;
  width: 100%;
`;
// const AcceptButton = styled(Pressable)`
//     align-items: center;
//     align-self: flex-end
//     background-color: ${ReelayColors.reelayBlue};
//     border-radius: 20px;
//     justify-content: center;
//     height: 20px;
//     width: 20%;
// `;
// const RejectButton = styled(Pressable)`
//     align-items: center;
//     align-self: center;
//     background-color: ${ReelayColors.reelayRed};
//     border-radius: 20px;
//     justify-content: center;
//     height: 20px;
//     width: 20%;
// `;

export default FollowReqItem = ({ result, navigation }) => {
  const followReqObject = result; // follow req item

  // username
  const username = followReqObject.username;
  const profilePictureURI = followReqObject.profilePictureURI;

  const selectResult = () => {
    navigation.push("UserProfileScreen", { creator: followReqObject });
  };

  return (
    <PressableContainer onPress={selectResult}>
      <ProfilePictureContainer>
        {profilePictureURI && (
          <ProfilePicture
            source={{ uri: profilePictureURI }}
            PlaceholderContent={<ActivityIndicator />}
          />
        )}
        {!profilePictureURI && (
          <ProfilePicture
            source={require("../../../assets/icons/reelay-icon.png")}
          />
        )}
      </ProfilePictureContainer>
      <UsernameContainer>
        <UsernameText>{username}</UsernameText>
      </UsernameContainer>
      {/* <ActionBar>
        <RejectButton>{"Reject"}</RejectButton>
        <AcceptButton>{"Accept"}</AcceptButton>
      </ActionBar> */}
    </PressableContainer>
  );
};
