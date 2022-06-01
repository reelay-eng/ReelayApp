import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';

export default ConfirmRetakeDrawer = ({ navigation, titleObj, confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible, lastState }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const ConfirmationContainer = styled(View)`
        width: 100%;
        padding-left: 24px;
        padding-right: 24px;
    `
    const DrawerContainer = styled(View)` 
        background-color: #1a1a1a;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding-bottom: 35px;
        width: 100%;
    `
    const IconSpacer = styled(View)`
        width: 8px;
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
    const PromptContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        justify-content: space-between;
    `
    const OptionText = styled(ReelayText.Body2)`
        color: white;
    `

    const PromptText = styled(ReelayText.Body2)`
        color: white;
    ` 

    const closeDrawer = () => setConfirmRetakeDrawerVisible(false);

    const Prompt = () => {
        const PROMPT_TEXT = 'Your reelay has not been published. Are you sure you would like to leave?'
        return (
            <PromptContainer>
                <PromptText>{PROMPT_TEXT}</PromptText>
            </PromptContainer>
        );
    }

    const ConfirmRetakeOption = () => {
        const onPress = () => {
            setConfirmRetakeDrawerVisible(false);
            navigation.pop();
            logAmplitudeEventProd('retake', {
                username: reelayDBUser?.username,
                title: titleObj.display,
            });    

            dispatch({ type: 'setUploadStage', payload: 'none' });
            dispatch({ type: 'setUploadRequest', payload: null });
        }
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{'Retake'}</OptionText>
            </OptionContainerPressable>
        );
    }

    const CancelOption = () => {
        return (
            <OptionContainerPressable onPress={closeDrawer}>
                <Icon type='ionicon' name='close' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{'Cancel'}</OptionText>
            </OptionContainerPressable>
        );
    }

    const ExitOption = () => {
        const onPress = () => {
            setConfirmRetakeDrawerVisible(false);
            dispatch({ type: 'setTabBarVisible', payload: true });
            navigation.popToTop();
            navigation.navigate('HomeScreen');
            logAmplitudeEventProd('exitCreate', {
                username: reelayDBUser?.username,
                title: titleObj.display,
            });    

            dispatch({ type: 'setUploadStage', payload: 'none' });
            dispatch({ type: 'setUploadRequest', payload: null });
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='exit-outline' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{'Exit to Home'}</OptionText>
            </OptionContainerPressable>
        );
    }

    const Confirmation = () => {
        return (
            <ConfirmationContainer>
                <Prompt />
                <ConfirmRetakeOption />
                <CancelOption />
                <ExitOption />
            </ConfirmationContainer>
        );
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 20px;
            margin-bottom: 5px;
            border-bottom-color: #2D2D2D;
            border-bottom-width: 1px;
            padding-top: 8px;
            padding-bottom: 8px;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
        `		

        return (
            <HeaderContainer>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={25}/>
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={confirmRetakeDrawerVisible}>
                 <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <Header />
                    <Confirmation />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}