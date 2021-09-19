import React, { useContext } from 'react';
import { Dimensions, Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';

export default LikesDrawer = ({ reelay }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const CLOSE_BUTTON_SIZE = 36;
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        padding-bottom: 80px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { likesVisible, setLikesVisible } = useContext(VisibilityContext);
    const closeDrawer = () => setLikesVisible(false);

    const Header = () => {
        const HeaderContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            margin: 12px;
        `
        const HeaderText = styled(Text)`
            font-family: System;
            font-size: 20px;
            font-weight: 500;
            color: white;
        `
        return (
            <HeaderContainer>
                <HeaderText>{'Likes'}</HeaderText>
                <Pressable onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                </Pressable>
            </HeaderContainer>
        );
    }

    const Likes = () => {
        const LikesContainer = styled(View)`
            width: 100%;
        `
        const LikeItemContainer = styled(View)`
            margin: 10px;
            width: 100%;
        `
        const UsernameText = styled(Text)`
            font-family: System;
            font-size: 20px;
            color: white;
        `
        return (
            <LikesContainer>
                <Header />
                { reelay.likes.map(like => {
                    return (
                        <LikeItemContainer key={like.userID}>
                            <UsernameText>{like.userID}</UsernameText>
                        </LikeItemContainer>
                    );
                })}
            </LikesContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={likesVisible}>
                { likesVisible && <Backdrop onPress={closeDrawer} /> }
                <DrawerContainer>
                    <Likes />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}