import React, { useContext, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatsIconSVG, ReviewIconSVG, TopicsIconSVG } from '../../components/global/SVGs';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_SIZE = (width - (BUTTON_MARGIN_WIDTH * 5)) / 3;

const Backdrop = styled(Pressable)`
    height: 100%;
    position: absolute;
    width: 100%;
`
const CloseDrawerButton = styled(TouchableOpacity)`
    padding: 10px;
`
const CreateOptionPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 12px;
    height: ${BUTTON_SIZE}px;
    justify-content: center;
    width: ${BUTTON_SIZE}px;
`
const CreateOptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-top: 10px;
`
const CreateOptionView = styled(View)`
    align-items: center;
`
const CreateChatPressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayGreen};
`
const CreateReviewPressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayBlue};
`
const CreateTopicPressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayPurple};
`
const CreateOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: ${BUTTON_MARGIN_WIDTH}px;
`
const DrawerView = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    bottom: 0px;
    padding-bottom: ${props => props.bottomOffset}px;
    position: absolute;
    width: 100%;
`
const DrawerHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 10px;
    padding-left: 16px;
    padding-right: 16px;
`
const HeaderText = styled(ReelayText.H6)`
    color: white;
`
const LeftSpacer = styled(View)`
    width: 40px;
`

export default CreateTabDrawer = ({ closeDrawer, navigation }) => {
    const bottomOffset = useSafeAreaInsets().bottom;

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{'Create'}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    const CreateChatButton = () => {
        const advanceToCreateChat = () => {
            closeDrawer();
            navigation.navigate('Create', { screen: 'CreateClubScreen' });
        }
        return (
            <CreateOptionView>
                <CreateChatPressable onPress={advanceToCreateChat}>
                    <ChatsIconSVG />
                </CreateChatPressable>
                <CreateOptionText>{'chat'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    const CreateReviewButton = () => {
        const advanceToCreateReview = () => {
            closeDrawer();
            navigation.navigate('Create', { screen: 'SelectTitleScreen' });
        }
        return (
            <CreateOptionView>
                <CreateReviewPressable onPress={advanceToCreateReview}>
                    <ReviewIconSVG />
                </CreateReviewPressable>
                <CreateOptionText>{'review'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    const CreateTopicButton = () => {
        const advanceToCreateTopic = () => {
            closeDrawer();
            navigation.navigate('Create', { screen: 'CreateTopicScreen' });
        }
        return (
            <CreateOptionView>
                <CreateTopicPressable onPress={advanceToCreateTopic}>
                    <TopicsIconSVG />
                </CreateTopicPressable>
                <CreateOptionText>{'topic'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <Backdrop onPress={closeDrawer} />
            <DrawerView bottomOffset={bottomOffset}>
                <DrawerHeader />
                <CreateOptionsRowView>
                    <CreateReviewButton />
                    <CreateTopicButton />
                    <CreateChatButton />
                </CreateOptionsRowView>
            </DrawerView>
        </Modal>
    )
}