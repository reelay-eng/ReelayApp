import React, { useEffect, useState, useContext } from "react";
import { ActivityIndicator, Text, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import { AuthContext } from "../../../context/AuthContext";
import styled from "styled-components/native";
import { getUserByUsername } from "../../../api/ReelayDBApi"
import { followCreator, unfollowCreator, getFollowers } from "../../../api/ReelayDBApi";

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
    width: 50%;
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
const FollowContainer = styled(View)`
    align-self: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 10px;
`;
const FollowButton = styled(Pressable)`
    align-items: center;
    background-color: ${ReelayColors.reelayRed};
    border-radius: 20px;
    justify-content: center;
    height: 45px;
    width: 50%;
`;
const FollowText = styled(Text)`
    color: white;
    font-size: 18px;
    font-weight: bold;
    line-height: 18px;
`;

// What it should do:
/*
- check if the follower/following is the current user (if it is, it should not have a follow button)
- working follow and unfollow button (need on-press for both)
- click through to user profile [WORKS]

Eventually...
- should also display people the user follows above those that they do not follow
 */
export default FollowItem = ({ result, navigation, type }) => {
    const followObject = result; // follow obj
    const username =
      type === "Following" ? followObject.creatorName : followObject.followerName;
    const profilePictureURI = followObject.profilePictureURI;
    const [creatorObj, setCreatorObj] = useState();
    const [alreadyFollow, setAlreadyFollow] = useState(type === "Following"); // placeholder
    // const [creatorFollowers, setCreatorFollowers] = useState([]);

    const { reelayDBUser, following, setFollowing } = useContext(AuthContext);
    const userSub = reelayDBUser.sub;

    // doesn't work 
    const isMyProfile = 
      type === "Followers"
        ? followObject.followerName === username
        : followObject.creatorName === username; 

    useEffect(() => {
        getCreator();
    }, []);

    const getCreator = async() => {
      const nextCreator = await getUserByUsername(username);

      setCreatorObj(nextCreator);
    }

  // username
    const followUser = async () => {
        const followResult = await followCreator(
            followObject.creatorSub,
            userSub
        );
        // const { error, requestStatus } = followResult;
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        console.log("follow result: ", followResult);

        if (isFollowing) {
            // setFollowers([...followers, followResult]);
            setFollowing([...following, followResult]);
            setAlreadyFollow(true);
        } else {
            // handle error
        }

        // add Amplitude logging

        console.log(reelayDBUser.username + " followed " + followObject.username);
    };

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(
        followObject.creatorSub,
        userSub
        );
        console.log(
        reelayDBUser.username + " unfollowed " + followObject.username
        );
        // checkAlreadyFollow();
        const unfollowSucceeded = !unfollowResult?.error;
        if (unfollowSucceeded) {
            // const nextFollowers = followers.filter((followObj) => {
            // return followObj.followerSub !== userSub;
            // });
            //setFollowers(nextFollowers);

            const nextFollowing = following.filter((followObj) => {
            return followObj.creatorSub !== creatorSub;
            });
            setFollowing(nextFollowing);
            setAlreadyFollow(false);
        } else {
            // handle error
        }
        // add Amplitude logging
    };

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

            <FollowContainer>
            {!alreadyFollow && !isMyProfile && (
                <FollowButton onPress={followUser}>
                <FollowText>{"Follow"}</FollowText>
                </FollowButton>
            )}
            {alreadyFollow && !isMyProfile && (
                <FollowButton onPress={unfollowUser}>
                <FollowText>{"Following"}</FollowText>
                </FollowButton>
            )}
            </FollowContainer>
        </PressableContainer>
    );
  };
