import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Text, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import { AuthContext } from '../../../context/AuthContext';
import { logAmplitudeEventProd } from '../../utils/EventLogger';
import styled from 'styled-components/native';
import ReelayColors from '../../../constants/ReelayColors';
import { followCreator } from '../../../api/ReelayDBApi';
import { sendFollowNotification } from "../../../api/NotificationsApi";
import { showErrorToast } from '../../utils/toasts';
import { ActionButton, BWButton } from "../../global/Buttons";
import * as ReelayText from "../../global/Text";

const PressableContainer = styled(Pressable)`
	align-items: center;
	justify-content: center;
	flex-direction: row;
	padding-top: 10px;
	padding-bottom: 10px;
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
	color: white;
`;
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
`;
const ProfilePictureContainer = styled(View)`
	margin: 10px;
	flex: 0.1;
`;

const FollowButtonFlexContainer = styled(View)`
	flex: 0.3;
`;
const FollowButtonContainer = styled(View)`
	height: 40px;
	width: 90px;
`;

// What it should do:
/*
- check if the follower/following is the current user (if it is, it should not have a follow button)
- working follow and unfollow button (need on-press for both)
- click through to user profile [WORKS]

Eventually...
- should also display people the user follows above those that they do not follow
 */

export default FollowItem = ({ 
    followObj, 
    followType,
    navigation, 
    setDrawerFollowObj,
    setDrawerOpen,
}) => {
    const { reelayDBUser, myFollowing, setMyFollowing } = useContext(AuthContext);

    const followUsername = (followType === 'Following') ? followObj.creatorName : followObj.followerName;
    const followUserSub = (followType === 'Following') ? followObj.creatorSub : followObj.followerSub;
    const followProfilePictureURI = null;

    const myUserSub = reelayDBUser.sub;
    const isMyProfile = (myUserSub === followUserSub);

    const findFollowUser = (userObj) => (userObj.creatorSub === followUserSub);
    const alreadyFollowing = myFollowing.find(findFollowUser);

    const followUser = async () => {
        const followResult = await followCreator(followUserSub, myUserSub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;

        if (isFollowing) {
            setMyFollowing([...myFollowing, followResult]);
        } else {
            logAmplitudeEventProd('followCreatorError', {
                error: followResult?.error,
                requestStatus: followResult?.requestStatus,
            });

            showErrorToast('Cannot follow creator. Please reach out to the Reelay team.');
            return;
        }

        logAmplitudeEventProd('followedUser', {
            followerName: reelayDBUser.username,
            followSub: reelayDBUser.sub
        });

        await sendFollowNotification({
          creatorSub: followUserSub,
          follower: reelayDBUser,
        });
    };

    const initiateUnfollowUser = async () => {
        if (followType === 'Following') {
            setDrawerFollowObj(followObj);
        } else {
            setDrawerFollowObj(myFollowing.find(findFollowUser));
        }
        setDrawerOpen(true);
    }

    const selectResult = () => {
        navigation.push('UserProfileScreen', { 
            creator: {
                sub: followUserSub,
                username: followUsername,
            }
        });
    };

    return (
		<PressableContainer onPress={selectResult}>
			<RowContainer>
				<ProfilePictureContainer>
					{followProfilePictureURI && (
						<ProfilePicture
							source={{ uri: followProfilePictureURI }}
							PlaceholderContent={<ActivityIndicator />}
						/>
					)}
					{!followProfilePictureURI && (
						<ProfilePicture source={require("../../../assets/icons/reelay-icon.png")} />
					)}
				</ProfilePictureContainer>
				<UsernameContainer>
					<UsernameText>{followUsername}</UsernameText>
				</UsernameContainer>

				<FollowButtonFlexContainer>
					<FollowButtonContainer>
						{!alreadyFollowing && !isMyProfile && (
							<ActionButton
								text="Follow"
								color="blue"
								borderRadius="8px"
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