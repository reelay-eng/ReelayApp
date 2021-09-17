import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, View, Text } from 'react-native';
import { BottomSheet, Button } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';

const { height, width} = Dimensions.get('window');

export default LikesDrawer = ({ reelay }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const LikesContainer = styled(View)`
        background-color: black;
        height: 50%;
        margin-top: auto;
        width: 100%;
    `
    const LikeItemContainer = styled(View)`
        border-color: white;
        border-width: 1px;
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

    return (
        <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => visibilityContext.setLikesVisible(false)} >
            <LikesContainer>
                <UsernameText>{'Likes'}</UsernameText>
                <Button title='Close' type='solid' onPress={() => visibilityContext.setLikesVisible(false)} />
                { reelay.likes.map(like => {
                    <LikeItemContainer key={like.userID}>
                        <UsernameText>{like.userID}</UsernameText>
                    </LikeItemContainer>
                })}
            </LikesContainer>
        </Modal>
    );
}