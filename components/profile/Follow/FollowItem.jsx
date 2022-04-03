import React, { useState, useContext } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Image } from 'react-native-elements';
import { AuthContext } from '../../../context/AuthContext';
import styled from 'styled-components/native';
import FollowButton from '../../global/FollowButton';

import Constants from 'expo-constants';
import * as ReelayText from "../../global/Text";
import ReelayIcon from '../../../assets/icons/reelay-icon-with-dog-black.png'

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

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
	const [validProfileImage, setValidProfileImage] = useState(true);

    const followUsername = (followType === 'Following') ? followObj.creatorName : followObj.followerName;
    const followUserSub = (followType === 'Following') ? followObj.creatorSub : followObj.followerSub;

	const followButtonCreatorObj = {
		sub: followUserSub,
		username: followUsername
	}

    let followProfilePictureURI = (followType === 'Following') ?
		`${CLOUDFRONT_BASE_URL}/public/profilepic-${followObj?.creatorSub}-current.jpg` :
		`${CLOUDFRONT_BASE_URL}/public/profilepic-${followObj?.followerSub}-current.jpg`;

    const myUserSub = reelayDBUser.sub;
    const isMyProfile = (myUserSub === followUserSub);

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
					{ validProfileImage ? null : (
							<ProfilePicture
								source={ReelayIcon}
							/>
						)
					}
					<ProfilePicture
						source={{ uri: followProfilePictureURI }}
						style={validProfileImage ? {} : {display: 'none'}}
						PlaceholderContent={<ActivityIndicator />}
						onError={() => {setValidProfileImage(false)}}
					/>
				</ProfilePictureContainer>
				<UsernameContainer>
					<UsernameText>{followUsername}</UsernameText>
				</UsernameContainer>

				<FollowButtonFlexContainer>
					{!isMyProfile && <FollowButton creator={followButtonCreatorObj} />}
				</FollowButtonFlexContainer>
			</RowContainer>
		</PressableContainer>
	);
};