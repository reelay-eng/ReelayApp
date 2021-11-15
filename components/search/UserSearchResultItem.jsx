import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import styled from "styled-components/native";

import { UploadContext } from "../../context/UploadContext";

const PressableContainer = styled(Pressable)`
    align-items: center;    
    flex-direction: row;
    height: 100px;
    margin-left: 10px;
    width: 100%;
`
const UsernameText = styled.Text`
    color: white
    font-size: 18px;
`
const UsernameContainer = styled.View`
    align-items: flex-start;
    justify-content: center;
`
const ProfilePicture = styled(Image)`
    border-radius: 50px;
    height: 45px;
    width: 45px;
`
const ProfilePictureContainer = styled(View)`
    border-color: white;
    border-radius: 50px;
    border-width: 2px;
    margin: 10px;
    height: 50px;
    width: 50px;
`

export default UserSearchResultItem = ({ result, navigation }) => {
    const { setHasSelectedUser, setUploadUserObject } = useContext(UploadContext);

    const userObject=result;

    // username
    const username = userObject.username;
    const sub = userObject.sub;
    console.log(username);

    // pfp
    const profilePictureURI = userObject.profilePictureURI;

    const selectResult = () => {
        setHasSelectedUser(true); // this makes the tab bar disappear
        setUploadUserObject(userObject);
        navigation.push("UserProfileScreen", { creator: userObject });
    };

    return (
        <PressableContainer onPress={selectResult}>
            <ProfilePictureContainer>
                { profilePictureURI && (
                    <ProfilePicture
                        source={{ uri: profilePictureURI }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                )}
                { !profilePictureURI && (
                    <ProfilePicture
                        source={require("../../assets/icons/reelay-icon.png")}
                    />
                )}
            </ProfilePictureContainer>
            <UsernameContainer>
                <UsernameText>{username}</UsernameText>
            </UsernameContainer>
        </PressableContainer>
    );
};
