import React, { useContext } from 'react';
import { Pressable, View } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import styled from 'styled-components/native';
import FollowButton from '../../global/FollowButton';

import * as ReelayText from "../../global/Text";
import ProfilePicture from '../../global/ProfilePicture';

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
const ProfilePictureContainer = styled(View)`
	margin: 10px;
	flex: 0.1;
`;

const FollowButtonFlexContainer = styled(View)`
	flex: 0.3;
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
    navigation
}) => {
    const { reelayDBUser } = useContext(AuthContext);
	const myUserSub = reelayDBUser.sub;
	const iAmFollowing = followObj.followerSub === myUserSub;
    const followUsername = (iAmFollowing) ? followObj.creatorName : followObj.followerName;
    const followUserSub = (iAmFollowing) ? followObj.creatorSub : followObj.followerSub;

	const followUser = {
		sub: followUserSub,
		username: followUsername
	}

    const isMyProfile = (myUserSub === followUserSub);

    const selectResult = () => {
        navigation.push('UserProfileScreen', { creator: followUser });
    };

    return (
		<PressableContainer onPress={selectResult}>
			<RowContainer>
				<ProfilePictureContainer>
					<ProfilePicture user={followUser} size={32} navigation={navigation} />
				</ProfilePictureContainer>
				<UsernameContainer>
					<UsernameText>{followUsername}</UsernameText>
				</UsernameContainer>
				<FollowButtonFlexContainer>
					{!isMyProfile && <FollowButton creator={followUser} />}
				</FollowButtonFlexContainer>
			</RowContainer>
		</PressableContainer>
	);
};