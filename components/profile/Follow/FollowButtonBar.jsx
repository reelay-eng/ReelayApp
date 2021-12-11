import React, { useContext, useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../../constants/ReelayColors';
import { AuthContext } from '../../../context/AuthContext';
import { followCreator, unfollowCreator } from '../../../api/ReelayDBApi';

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';

const FollowContainer = styled(View)`
    align-self: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 20px;
`;
const FollowButton = styled(Pressable)`
    align-items: center;
    align-self: center;
    background-color: ${ReelayColors.reelayRed};
    border-radius: 36px;
    justify-content: center;
    height: 50px;
    width: 75%;
`;
const FollowText = styled(Text)`
    color: white;
    font-size: 18px;
    font-weight: bold;
    line-height: 21px;
`;

export default FollowButtonBar = ({ creator, creatorFollowers, setCreatorFollowers }) => {
    const { reelayDBUser, myFollowing, setMyFollowing } = useContext(AuthContext);
    const creatorSub = creator.sub;
    const userSub = reelayDBUser.sub;

    console.log('CREATOR: ', creator);
    const creatorInList = (followObj) => followObj.creatorSub === creator.sub;
    const alreadyFollowingCreator = myFollowing.find(creatorInList);

    console.log('MY FOLLOWING: ', myFollowing);
    console.log('ALREADY FOLLOWING? ', alreadyFollowingCreator);

    const followUser = async () => {
        const followResult = await followCreator(creatorSub, userSub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        
        if (isFollowing) {
            setCreatorFollowers([...creatorFollowers, followResult]);
            setMyFollowing([...myFollowing, followResult]);
        } else {
            // handle error
        }

        logEventWithPropertiesAsync('followedCreator', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    };

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(creatorSub, userSub);
        const unfollowSucceeded = !unfollowResult?.error;

        if (unfollowSucceeded) {
            const nextCreatorFollowers = creatorFollowers.filter((followObj) => {
                return followObj.followerSub !== userSub;
            });
            
            const nextMyFollowing = myFollowing.filter((followObj) => {
                return followObj.creatorSub !== creatorSub;
            });
            
            setCreatorFollowers(nextCreatorFollowers);
            setMyFollowing(nextMyFollowing);
        } else {
            // handle error
        }

        logEventWithPropertiesAsync('unfollowedCreator', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    };

    // if the person already follows, then it should say following
    return (
        <FollowContainer>
            { !alreadyFollowingCreator && (
                <FollowButton onPress={followUser}>
                    <FollowText>{'Follow'}</FollowText>
                </FollowButton>
            )}
            { alreadyFollowingCreator && (
                <FollowButton onPress={unfollowUser}>
                    <FollowText>{'Following'}</FollowText>
                </FollowButton>
            )}
        </FollowContainer>
    );
};
