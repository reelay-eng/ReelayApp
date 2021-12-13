import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Text, Pressable, View } from 'react-native';
import { Icon, Image } from 'react-native-elements';
import { AuthContext } from '../../../context/AuthContext';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';
import ReelayColors from '../../../constants/ReelayColors';

import { followCreator } from '../../../api/ReelayDBApi';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    width: ${width / 2}px;
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

// 70px prof pic
// 15px right margin 
const FollowContainer = styled(View)`
    width: ${width / 2 - 75}px;
`;
const FollowButton = styled(Pressable)`
    align-items: center;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor}};
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
            // handle error
        }

        logEventWithPropertiesAsync('followedUser', {
            followerName: reelayDBUser.username,
            followSub: reelayDBUser.sub
        })
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
                    <FollowButton 
                        backgroundColor={ReelayColors.reelayRed}
                        borderColor={ReelayColors.reelayBlack}
                        onPress={followUser}
                    >
                        <FollowText>{'Follow'}</FollowText>
                    </FollowButton>
                )}
                { alreadyFollowing && !isMyProfile && (
                    <FollowButton 
                        backgroundColor={ReelayColors.reelayBlack}
                        borderColor={'white'}
                        onPress={initiateUnfollowUser} 
                    >
                        <FollowText>{'Following'}</FollowText>
                        <Icon type='ionicon' name='caret-down' color={'white'} size={20} />
                    </FollowButton>
                )}
            </FollowContainer>
        </PressableContainer>
    );
};