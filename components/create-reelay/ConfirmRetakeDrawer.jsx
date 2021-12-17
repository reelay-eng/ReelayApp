import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';
import styled from 'styled-components/native';

export default ConfirmRetakeDrawer = ({ navigation, titleObj, confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible }) => {
    const { cognitoUser } = useContext(AuthContext);

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const ConfirmationContainer = styled(View)`
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
    const PromptContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 10px;
    `
    const OptionText = styled(Text)`
        font-family: System;
        font-size: 20px;
        font-weight: 500;
        margin-left: 20px;
        color: white;
    ` 
    const PromptText = styled(Text)`
        font-family: System;
        font-size: 20px;
        font-weight: 500;
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
            logEventWithPropertiesAsync('retake', {
                username: cognitoUser.username,
                title: titleObj.display,
            });    
        }
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={30} color={'white'} />
                <OptionText>{'Retake'}</OptionText>
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

    const Confirmation = () => {
        return (
            <ConfirmationContainer>
                <Prompt />
                <ConfirmRetakeOption />
                <CancelOption />
            </ConfirmationContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={confirmRetakeDrawerVisible}>
                 <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <Confirmation />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}