import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { unfollowCreator } from '../../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';

export default FollowButtonDrawer = ({ 
    drawerOpen,
    setDrawerOpen,
    followObj,
    sourceScreen = 'UserFollowScreen',
    creatorFollowers,
    setCreatorFollowers,
}) => {

    const creatorName = followObj.creatorName;
    const creatorSub = followObj.creatorSub;
    const myUsername = cognitoUser.username;
    const myUserSub = cognitoUser.attributes.sub;

    const { cognitoUser, myFollowing, setMyFollowing } = useContext(AuthContext);

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const FollowOptionsContainer = styled(View)`
        width: 100%;
        padding: 30px;
    `
    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding-bottom: 80px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const OptionContainerPressable = styled(Pressable)`
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        margin-top: 20px;
        color: #2977EF;
    `
    const OptionText = styled(Text)`
        font-family: System;
        font-size: 20px;
        font-weight: 500;
        margin-left: 20px;
        color: white;
    `
    const closeDrawer = () => setDrawerOpen(false);

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(creatorSub, myUserSub);
        const unfollowSucceeded = !unfollowResult?.error;

        if (unfollowSucceeded) {
            const nextCreatorFollowers = creatorFollowers.filter((followObj) => {
                return followObj.followerSub !== myUserSub;
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
            creatorName: creatorName,
            creatorSub: creatorSub,
            username: myUsername,
            userSub: myUserSub,
        });
    };

    const UnfollowOption = () => {
        const onPress = () => {
            setDrawerOpen(false);
            unfollowUser();
            logEventWithPropertiesAsync('unfollowedCreator', {
                creatorName: creatorName,
                creatorSub: creatorSub,
                username: myUsername,
                userSub: myUserSub,
            });    
        }
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='remove-circle' size={30} color={'white'} />
                <OptionText>{`Unfollow ${creatorName}`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const CancelOption = () => {
        return (
            <OptionContainerPressable onPress={closeDrawer}>
                <Icon type='ionicon' name='close' size={30} color={'white'} />
                <OptionText>{'Cancel'}</OptionText>
            </OptionContainerPressable>
        );
    }

    const FollowOptions = () => {
        return (
            <FollowOptionsContainer>
                <UnfollowOption />
                <CancelOption />
            </FollowOptionsContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerOpen}>
                 <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <FollowOptions />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}