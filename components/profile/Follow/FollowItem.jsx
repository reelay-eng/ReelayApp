import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import styled from "styled-components/native";
import { getUserByUsername } from "../../../api/ReelayDBApi"

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
// `;
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
//   align-items: center;
//   align-self: center;
//   background-color: ${ReelayColors.reelayRed};
//   border-radius: 20px;
//   justify-content: center;
//   height: 20px;
//   width: 20%;
// `;

export default FollowItem = ({ result, navigation, type }) => {
  const followObject = result; // follow obj
  const username =
    type === "Following" ? followObject.creatorName : followObject.followerName;
  const profilePictureURI = followObject.profilePictureURI;
    const [creatorObj, setCreatorObj] = useState();

  useEffect(() => {
      getCreator()
  }, [])

  const getCreator = async() => {
    const nextCreator = await getUserByUsername(username);

    setCreatorObj(nextCreator);
  }

  // username

  const selectResult = () => {
    navigation.push("UserProfileScreen", { creator: creatorObj });
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
