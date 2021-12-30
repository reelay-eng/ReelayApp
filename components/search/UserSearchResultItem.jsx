import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, View, Text } from "react-native";
import { Icon, Image } from "react-native-elements";
import styled from "styled-components/native";
import { Dimensions } from "react-native";
import { followCreator, getFollowers } from "../../api/ReelayDBApi";
import { sendFollowNotification } from "../../api/NotificationsApi";

import { AuthContext } from "../../context/AuthContext";
import { logAmplitudeEventProd } from "../utils/EventLogger";

const { width, height } = Dimensions.get("window");

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
`
const UsernameContainer = styled.View`
    align-items: flex-start;
    justify-content: center;
    width: ${width / 2}px;
`;
const ProfilePicture = styled(Image)`
    border-radius: 30px;
    border-width: 1px;
    border-color: white;
    height: 45px;
    width: 45px;
`
const ProfilePictureContainer = styled(View)`
    margin: 10px;
    height: 50px;
    width: 50px;
`

const FollowContainer = styled(View)`
    width: ${width / 2 - 75}px;
`;
const FollowButton = styled(Pressable)`
    align-items: center;
    background-color: ${(props) => props.backgroundColor};
    border-color: ${(props) => props.borderColor}};
    border-radius: 12px;
    border-width: 1px;
    height: 45px;
    flex-direction: row;
    justify-content: space-around;
    padding: 6px;
    right: 20px;
`;
const FollowText = styled(Text)`
    color: white;
    font-size: 18px;
    font-weight: 500;
    line-height: 18px;
`;

export default UserSearchResultItem = ({
    result,
    navigation,
    setCreatorFollowers, 
    setDrawerFollowObj,
    setDrawerOpen,
}) => {
    const { reelayDBUser, myFollowing, setMyFollowing } = useContext(AuthContext);
    const searchedUser = result;
    const profilePictureURI = searchedUser.profilePictureURI;

    const username = searchedUser.username;
    const userSub = searchedUser.sub;

    const selectResult = () => {
        navigation.push("UserProfileScreen", { creator: searchedUser });
        logAmplitudeEventProd('selectSearchResult', {
            username: reelayDBUser.username,
            selectedUsername: searchedUser.username,
            source: 'search',
        }); 

    };

    const findFollowUser = (userObj) => {
        return userObj.creatorSub === userSub;
    };

    const alreadyFollowing = myFollowing.find(findFollowUser);
    const myUserSub = reelayDBUser.sub;
    const isMyProfile = myUserSub === userSub;

    const followUser = async () => {
        const followResult = await followCreator(userSub, myUserSub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;

        if (isFollowing) {
            setMyFollowing([...myFollowing, followResult]);
        } else {
            // handle error
        }

        await sendFollowNotification({
            creatorSub: userSub,
            follower: reelayDBUser,
        });

        logAmplitudeEventProd("followedUser", {
            followerName: reelayDBUser.username,
            followSub: reelayDBUser.sub,
        });
    };

    const initiateUnfollowUser = async () => {
            setCreatorFollowers(await getFollowers(userSub));
            if (alreadyFollowing) {
                setDrawerFollowObj(myFollowing.find(findFollowUser));
            } else {
                setDrawerFollowObj(myFollowing.find(findFollowUser));
            }
            setDrawerOpen(true);
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
            <UsernameContainer>
                <UsernameText>{username}</UsernameText>
            </UsernameContainer>

            <FollowContainer>
                {!alreadyFollowing && !isMyProfile && (
                    <FollowButton
                        backgroundColor={ReelayColors.reelayRed}
                        borderColor={ReelayColors.reelayBlack}
                        onPress={followUser}
                    >
                        <FollowText>{"Follow"}</FollowText>
                    </FollowButton>
                )}
                {alreadyFollowing && !isMyProfile && (
                    <FollowButton
                        backgroundColor={ReelayColors.reelayBlack}
                        borderColor={"white"}
                        onPress={initiateUnfollowUser}
                    >
                        <FollowText>{"Following"}</FollowText>
                        <Icon type="ionicon" name="caret-down" color={"white"} size={20} />
                    </FollowButton>
                )}
            </FollowContainer>
        </PressableContainer>
    );
};
