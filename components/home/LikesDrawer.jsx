import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, View, Text, Pressable } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';

const { height, width} = Dimensions.get('window');

export default LikesDrawer = ({ reelay }) => {
    const CLOSE_BUTTON_SIZE = 36;
    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const Backdrop = styled(Pressable)`
        background-color: black;
        height: 100%;
        width: 100%;
        opacity: 0.4
    `
    const Header = styled(View)`
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
    const LikesContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        padding-bottom: 80px;
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
    const visibilityContext = useContext(VisibilityContext);
    const visible = visibilityContext.likesVisible;
    const closeDrawer = () => visibilityContext.setLikesVisible(false);

    return (
        <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={closeDrawer} >
            <LikesContainer>
                <Header>
                    <HeaderText>{'Likes'}</HeaderText>
                    <Pressable onPress={closeDrawer}>
                        <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                    </Pressable>
                </Header>
                { reelay.likes.map(like => {
                    return (
                        <LikeItemContainer key={like.userID}>
                            <UsernameText>{like.userID}</UsernameText>
                        </LikeItemContainer>
                    );
                })}
            </LikesContainer>
        </Modal>
    );
}