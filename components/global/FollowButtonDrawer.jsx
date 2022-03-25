import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { unfollowCreator } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from './Text';
import { showErrorToast } from '../utils/toasts';
import { useDispatch, useSelector } from 'react-redux';

export default FollowButtonDrawer = ({ 
    creatorFollowers,
    setCreatorFollowers,
    drawerOpen,
    setDrawerOpen,
    followObj,
    sourceScreen = 'UserFollowScreen',
}) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);
    const { creatorName, creatorSub } = followObj;

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
        background-color: ${ReelayColors.reelayBlack};
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        border-width: 1px;
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
    const OptionText = styled(ReelayText.Body1)`
        margin-left: 20px;
        color: white;
    `
    const closeDrawer = () => setDrawerOpen(false);

    const unfollowOnPress = async () => {
        const unfollowResult = await unfollowCreator(creatorSub, reelayDBUser?.sub);
        console.log('UNFOLLOW RESULT: ', unfollowResult);
        if (unfollowResult && !unfollowResult?.error) {
            removeFollowObjsFromState();
        } else {
            logAmplitudeEventProd('unfollowedCreatorError', {
                creatorName: creatorName,
                creatorSub: creatorSub,
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
            });   
             
            showErrorToast('Cannot unfollow creator. Please reach out to the Reelay team');
            return;
        }
    };

    const removeFollowObjsFromState = () => {
        if (sourceScreen !== 'Feed') {
            // creatorFollowers and setCreatorFollowers are not passed from the feed
            // since they are not displayed, and they would take too long to load
            const removeFromCreatorFollows = (followObj) => followObj?.followerSub !== reelayDBUser?.sub;
            const nextCreatorFollowers = creatorFollowers.filter(removeFromCreatorFollows);
            setCreatorFollowers(nextCreatorFollowers);    
        }
        
        const removeFromMyFollows = (followObj) => followObj.creatorSub !== creatorSub;
        const nextMyFollowing = myFollowing.filter(removeFromMyFollows);
        dispatch({ type: 'setMyFollowing', payload: nextMyFollowing });

        logAmplitudeEventProd('unfollowedCreator', {
            creatorName: creatorName,
            creatorSub: creatorSub,
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
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

    const UnfollowOption = () => {
        const onPress = () => {
            setDrawerOpen(false);
            unfollowOnPress();
        }
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='remove-circle' size={30} color={'white'} />
                <OptionText>{`Unfollow ${creatorName}`}</OptionText>
            </OptionContainerPressable>
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