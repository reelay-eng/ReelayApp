import React, { useContext, useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import ReelayColors from '../../../constants/ReelayColors';
import { AuthContext } from '../../../context/AuthContext';
import { followCreator, unfollowCreator } from '../../../api/ReelayDBApi';
import { sendFollowNotification } from "../../../api/NotificationsApi";

import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import FollowButtonDrawer from './FollowButtonDrawer';

const FollowContainer = styled(View)`
    align-self: center;
    flex-direction: row;
    margin-top: 10px;
    margin-bottom: 20px;
`;
const FollowButton = styled(Pressable)`
    align-items: center;
    align-self: center;
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.borderColor};
    border-radius: 36px;
    border-width: 1px;
    justify-content: center;
    flex-direction: row;
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

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerFollowObj, setDrawerFollowObj] = useState(null);

    const creatorInList = (followObj) => followObj.creatorSub === creator.sub;
    const alreadyFollowingCreator = myFollowing.find(creatorInList);

    const followUser = async () => {
        const followResult = await followCreator(creatorSub, userSub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        
        if (isFollowing) {
            setCreatorFollowers([...creatorFollowers, followResult]);
            setMyFollowing([...myFollowing, followResult]);
        } else {
            // handle error
        }

        await sendFollowNotification({
          creatorSub: creatorSub,
          follower: reelayDBUser,
        });
        
        logEventWithPropertiesAsync('followedCreator', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    };

    const initiateUnfollowUser = async () => {
        const followObj = myFollowing.find(creatorInList);
        setDrawerFollowObj(followObj);
        setDrawerOpen(true);
    }

    // if the person already follows, then it should say following
    return (
        <FollowContainer>
            { !alreadyFollowingCreator && (
                <FollowButton 
                    backgroundColor={ReelayColors.reelayRed}
                    borderColor={ReelayColors.reelayRed}
                    onPress={followUser}
                >
                    <FollowText>{'Follow'}</FollowText>
                </FollowButton>
            )}
            { alreadyFollowingCreator && (
                <FollowButton 
                    backgroundColor={ReelayColors.reelayBlack}
                    borderColor={'white'}
                    onPress={initiateUnfollowUser} 
                >
                    <FollowText>{'Following'}</FollowText>
                    <Icon type='ionicon' name='caret-down' color={'white'} size={20} />
                </FollowButton>
            )}
            { drawerOpen && 
                <FollowButtonDrawer 
                    creatorFollowers={creatorFollowers}
                    setCreatorFollowers={setCreatorFollowers}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    followObj={drawerFollowObj}
                    followType={'Following'}
                    sourceScreen={'UserProfileScreen'}
                />
            }
        </FollowContainer>
    );
};
