import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';

import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;

const Backdrop = styled(Pressable)`
    background-color: transparent;
    bottom: 0px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CloseDrawerButton = styled(TouchableOpacity)`
    padding: 10px;
`
const DrawerView = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: auto;
    margin-top: auto;
    max-height: 70%;
    padding-top: 8px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    width: 100%;
`
const DrawerHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
    font-size: 18px;
`
const LeftSpacer = styled(View)`
    width: 40px;
`
const ShareOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding-left: ${BUTTON_MARGIN_WIDTH}px;
    padding-right: ${BUTTON_MARGIN_WIDTH}px;
`

export default AddReactEmojiDrawer = ({ closeDrawer, onEmojiSelected }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const { reelayDBUser } = useContext(AuthContext);

    useEffect(() => {

    }, []);

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{'Add Reaction'}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <ShareOptionsRowView>

                </ShareOptionsRowView>
            </DrawerView>
        </Modal>
    )
}