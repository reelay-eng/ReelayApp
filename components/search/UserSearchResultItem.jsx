import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, View, Text } from "react-native";
import { Icon, Image } from "react-native-elements";
import styled from "styled-components/native";
import { ActionButton, BWButton } from '../../components/global/Buttons';
import { Dimensions } from "react-native";
import { followCreator, getFollowers } from "../../api/ReelayDBApi";
import { notifyCreatorOnFollow } from "../../api/NotificationsApi";
import * as ReelayText from '../../components/global/Text';

import { AuthContext } from "../../context/AuthContext";
import { logAmplitudeEventProd } from "../utils/EventLogger";
import { useDispatch, useSelector } from "react-redux";

const PressableContainer = styled(Pressable)`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    height: 60px;
    width: 100%;
`;
const RowContainer = styled(View)`
	display: flex;
	align-items: center;
	flex-direction: row;
	height: 100%;
	width: 95%;
`;
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const UsernameContainer = styled.View`
    align-items: flex-start;
    justify-content: center;
    flex: 0.6;
`;
const ProfilePicture = styled(Image)`
    border-radius: 16px;
    border-width: 1px;
    border-color: white;
    height: 32px;
    width: 32px;
`
const ProfilePictureContainer = styled(View)`
    margin: 10px;
    flex: 0.1;
`

const FollowButtonFlexContainer = styled(View)`
    flex: 0.3;
`
const FollowButtonContainer = styled(View)`
	height: 30px;
    width: 90px;
`;

export default UserSearchResultItem = ({
    result,
    navigation,
    setCreatorFollowers, 
    setDrawerFollowObj,
    setDrawerOpen,
}) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);
    const searchedUser = result;
    const profilePictureURI = searchedUser.profilePictureURI;

    const username = searchedUser.username;
    const userSub = searchedUser.sub; // sub is the user's unique id

    const selectResult = () => {
        navigation.push("UserProfileScreen", { creator: searchedUser });
        logAmplitudeEventProd('selectSearchResult', {
            username: reelayDBUser?.username,
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
            dispatch({ type: 'setMyFollowing', payload: [...myFollowing, followResult] });
        } else {
            // handle error
        }

        await notifyCreatorOnFollow({
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

            logAmplitudeEventProd("unfollowedUser", {
                followerName: reelayDBUser.username,
                followSub: reelayDBUser.sub,
            });
    };

    return (
		<PressableContainer onPress={selectResult}>
			<RowContainer>
				<ProfilePictureContainer>
					{profilePictureURI && (
						<ProfilePicture
							source={{ uri: profilePictureURI }}
							PlaceholderContent={<ActivityIndicator />}
						/>
					)}
					{!profilePictureURI && (
						<ProfilePicture source={require("../../assets/icons/reelay-icon-with-dog-black.png")} />
					)}
				</ProfilePictureContainer>
				<UsernameContainer>
					<UsernameText>{username}</UsernameText>
				</UsernameContainer>

				<FollowButtonFlexContainer>
					<FollowButtonContainer>
						{!alreadyFollowing && !isMyProfile && (
							<ActionButton
								text="Follow"
								color="blue"
								borderRadius="8px"
								backgroundColor={ReelayColors.reelayRed}
								borderColor={ReelayColors.reelayBlack}
								onPress={followUser}
							/>
						)}
						{alreadyFollowing && !isMyProfile && (
							<BWButton
								text="Following"
								borderRadius="8px"
								onPress={initiateUnfollowUser}
								rightIcon={
									<Icon
										type="ionicon"
										name="chevron-down-outline"
										color={"white"}
										size={15}
									/>
								}
							/>
						)}
					</FollowButtonContainer>
				</FollowButtonFlexContainer>
			</RowContainer>
		</PressableContainer>
	);
};
