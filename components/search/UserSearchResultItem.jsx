import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import styled from "styled-components/native";

import { UploadContext } from "../../context/UploadContext";

const PressableContainer = styled.Pressable`
  flex: 1;
  flex-direction: row;
  margin: 5px 10px 10px 20px;
  height: 100px;
`;
const TitleText = styled.Text`
    color: white
    font-size: 22px;
`;
const TitleLineContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: flex-start;
`;
const ProfilePicture = styled(Image)`
  border-radius: 50px;
  height: 65px;
  width: 65px;
`;

const ProfilePictureContainer = styled(Pressable)`
  border-color: white;
  border-radius: 50px;
  border-width: 2px;
  margin: 10px;
  height: 70px;
  width: 70px;
`;

export default UserSearchResultItem = ({ result, navigation }) => {
  const { setHasSelectedUser, setUploadUserObject } = 
    useContext(UploadContext);
  // const [posterLoaded, setPosterLoaded] = useState(false);

  const userObject=result;

  // username
  const username = userObject.username;
  const sub = userObject.sub;
  console.log(username);

  // pfp
  const profilePictureURI = userObject.profilePictureURI
    ? console.log("PFP URI stuff")
    : null;

  const selectResult = () => {
    setHasSelectedUser(true); // this makes the tab bar disappear
    setUploadUserObject(userObject);
    console.log("selected this item", username);

    navigation.push("UserProfileScreen", { creator: userObject });
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
            source={require("../../assets/icons/reelay-icon.png")}
          />
        )}
      </ProfilePictureContainer>
      <TitleLineContainer>
        <TitleText>{username}</TitleText>
      </TitleLineContainer>
    </PressableContainer>
  );
};
