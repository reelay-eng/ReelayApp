import React, { useContext, useRef, useState } from 'react';
import { 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    SafeAreaView, 
    TouchableOpacity, 
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ContentContainer = styled(View)`
    padding-bottom: 20px;
    padding-left: 24px;
    padding-right: 24px;
    width: 100%;
`
const DrawerContainer = styled(SafeAreaView)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 70%;
    width: 100%;
`
const HeaderSpacer = styled(View)`
    align-items: center;
    height: 12px;
`
const IconSpacer = styled(View)`
    width: 8px;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const OptionContainerPressable = styled(TouchableOpacity)`
    align-items: center;
    color: #2977EF;
    flex-direction: row;
    justify-content: flex-start;
    margin-top: 20px;
`
const OptionText = styled(ReelayText.Body1)`
    color: white;
`

export default AddTitleOrTopicDrawer = ({ navigation, club, drawerVisible, setDrawerVisible }) => {
    const closeDrawer = () => setDrawerVisible(false);
    const advanceToAddTitleScreen = () => {
        closeDrawer();
        navigation.push('ClubAddTitleScreen', { club });
    }
    const advanceToAddTopicScreen = () => {
        closeDrawer();
        navigation.push('CreateTopicScreen', { club });
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <HeaderSpacer />
                    <ContentContainer>
                    <OptionContainerPressable onPress={advanceToAddTitleScreen}>
                        <Icon type='ionicon' name='add-circle-outline' size={24} color={'white'} />
                        <IconSpacer />
                        <OptionText>{`Add title`}</OptionText>
                    </OptionContainerPressable>
                    <OptionContainerPressable onPress={advanceToAddTopicScreen}>
                        <Icon type='ionicon' name='bulb' size={24} color={'white'} />
                        <IconSpacer />
                        <OptionText>{`Add topic`}</OptionText>
                    </OptionContainerPressable>
                    </ContentContainer>
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}