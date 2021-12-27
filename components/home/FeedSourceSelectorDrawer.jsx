import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';

export default FeedSourceSelectorDrawer = ({ feedSource, setFeedSource, drawerOpen, setDrawerOpen }) => {
    const { cognitoUser } = useContext(AuthContext);

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const FeedSourceOptionsContainer = styled(View)`
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
    const OptionText = styled(Text)`
        font-family: System;
        font-size: 20px;
        font-weight: ${props => props.selected ? 600: 400};
        margin-left: 20px;
        margin-right: 20px;
        color: white;
    `
    const closeDrawer = () => {
        setDrawerOpen(false)
    };

    const Header = () => {
        const HeaderContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
        `;
        const CloseButtonContainer = styled(Pressable)`
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
        `
        return (
            <HeaderContainer>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={"white"} type="ionicon" name="close" size={30} />
                </CloseButtonContainer>
            </HeaderContainer>
        );
    };

    const FollowingOption = () => {
        const onPress = () => {
            setFeedSource('following');
            closeDrawer();
            logEventWithPropertiesAsync('setFeedFollowing', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
            });    
        }

        const selected = (feedSource === 'following');
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='people' size={30} color={'white'} />
                <OptionText selected={selected}>{`Following`}</OptionText>
                { selected && <Icon type='ionicon' name='checkmark' size={30} color={'white'} /> }
            </OptionContainerPressable>
        );
    }

    const GlobalOption = () => {
        const onPress = () => {
            setFeedSource('global');
            closeDrawer();
            logEventWithPropertiesAsync('setFeedGlobal', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
            });    
        }

        const selected = (feedSource === 'global');
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='earth' size={30} color={'white'} />
                <OptionText selected={feedSource === 'global'}>{`Global`}</OptionText>
                { selected && <Icon type='ionicon' name='checkmark' size={30} color={'white'} /> }
            </OptionContainerPressable>
        );
    }

    const FeedSourceOptions = () => {
        return (
            <FeedSourceOptionsContainer>
                <Header />
                <GlobalOption />
                <FollowingOption />
            </FeedSourceOptionsContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerOpen}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <FeedSourceOptions />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}