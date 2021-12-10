import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Text, Pressable, View } from 'react-native';
import { Image } from 'react-native-elements';
import { AuthContext } from '../../../context/AuthContext';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';
import ReelayColors from '../../../constants/ReelayColors';

import { getUserByUsername } from '../../../api/ReelayDBApi'
import { followCreator, unfollowCreator } from '../../../api/ReelayDBApi';
import { showErrorToast } from '../../utils/toasts';

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

export default FollowItem = ({ followObj, navigation, followType }) => {
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
            // handle error
        }

        logEventWithPropertiesAsync('followedUser', {
            followerName: reelayDBUser.username,
            followSub: reelayDBUser.sub
        })
    };

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(followUserSub, myUserSub);
        const unfollowSucceeded = !unfollowResult?.error;

        if (unfollowSucceeded) {
            const nextMyFollowing = myFollowing.filter((nextFollowObj) => {
                return nextFollowObj.creatorSub !== followUserSub;
            });
            setMyFollowing(nextMyFollowing);
        } else {
            showErrorToast('Something went wrong unfollowing this user. Try again?');
        }
        // add Amplitude logging
    };

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
            <ProfilePictureContainer>
                {followProfilePictureURI && (
                    <ProfilePicture
                        source={{ uri: profilePictureURI }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                )}
                {!followProfilePictureURI && (
                    <ProfilePicture
                        source={require('../../../assets/icons/reelay-icon.png')}
                    />
                )}
            </ProfilePictureContainer>
            <UsernameContainer>
                <UsernameText>{followUsername}</UsernameText>
            </UsernameContainer>

            <FollowContainer>
                { !alreadyFollowing && !isMyProfile && (
                    <FollowButton onPress={followUser}>
                        <FollowText>{'Follow'}</FollowText>
                    </FollowButton>
                )}
                { alreadyFollowing && !isMyProfile && (
                    <FollowButton onPress={unfollowUser}>
                        <FollowText>{'Following'}</FollowText>
                    </FollowButton>
                )}
            </FollowContainer>
        </PressableContainer>
    );
};