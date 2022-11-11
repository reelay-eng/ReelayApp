import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, Share, TouchableOpacity, View } from 'react-native';

import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import * as ReelayText from '../global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import Share from 'react-native-share';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { deleteGuessingGameDraft } from '../../api/GuessingGameApi';

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
const DeleteDraftPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255, 72, 72, 0.8);
    border-radius: 20px;
    height: 40px;
    justify-content: center;
    margin-top: 16px;
    padding: 10px;
    width: 90%;
`
const DeleteDraftPromptText = styled(ReelayText.Body1)`
    color: white;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 16px;
    width: 90%;
`
const DeleteDraftText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 14px;
`
const DeleteDraftTextView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    position: absolute;
    width: 100%;
`
const DeleteDraftsRowView = styled(View)`
    align-items: center;
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
`
const DeleteDraftIconPad = styled(View)`
    height: 25px;
`

export default DeleteGuessingGameDrawer = ({ closeDrawer, guessingGame, navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const { reelayDBUser } = useContext(AuthContext);

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{'Delete draft'}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    const DeleteDraftButton = () => {
        const confirmDelete = async () => {
            closeDrawer();
            navigation.popToTop();

            try {
                const deleteResult = await deleteGuessingGameDraft({
                    authSession,
                    reqUserSub: reelayDBUser?.sub,
                    topicID: guessingGame?.id,
                });    

                if (deleteResult?.error) {
                    console.log('Delete result error: ', deleteResult?.error);
                    showErrorToast('Ruh roh! Could not delete draft game. Try again?');
                } else {
                    showMessageToast('Your game is deleted.');
                }
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Could not delete draft game. Try again?');
            }

            
        }

        return (
            <DeleteDraftPressable onPress={confirmDelete}>
                <DeleteDraftIconPad />
                <DeleteDraftTextView>
                    <DeleteDraftText>{'Permanently delete this game'}</DeleteDraftText>
                </DeleteDraftTextView>
            </DeleteDraftPressable>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <DeleteDraftsRowView>
                    <DeleteDraftPromptText>
                        {'Are you sure you want to delete this game? These videos will be deleted too.'}
                    </DeleteDraftPromptText>
                    <DeleteDraftButton />
                </DeleteDraftsRowView>
            </DrawerView>
        </Modal>
    )
}