import React from 'react';
import { 
    Dimensions,
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    TouchableOpacity, 
    View,
} from 'react-native';

import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { GamesIconSVG, ReviewIconSVG, TopicsIconSVG } from '../global/SVGs';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = (width - (BUTTON_MARGIN_WIDTH * 5)) / 3;

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
    height: ${BUTTON_WIDTH}px;
    justify-content: center;
    width: ${BUTTON_WIDTH}px;
`
const CreateOptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    margin-top: 10px;
`
const CreateOptionView = styled(View)`
    align-items: center;
`
const CreateGuessingGamePressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayRed};
`
const CreateReviewPressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayBlue};
`
const CreateTopicPressable = styled(CreateOptionPressable)`
    background-color: #8348D7;
`
const CreateOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
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
const ModalContainer = styled(View)`
    position: absolute;
`
const OptionsSpacer = styled(View)`
    width: ${BUTTON_MARGIN_WIDTH}px;
`

export default AddToClubsDrawer = ({ navigation, club, drawerVisible, setDrawerVisible }) => {
    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);

    const CreateGuessingGameButton = () => {
        const advanceToCreateGuessingGame = () => {
            closeDrawer();
            navigation.navigate('Create', { 
                screen: 'SelectCorrectGuessScreen',
                params: { club: { name: club?.name, id: club?.id }},
            });
        }
        return (
            <CreateOptionView>
                <CreateGuessingGamePressable onPress={advanceToCreateGuessingGame}>
                    <GamesIconSVG />
                </CreateGuessingGamePressable>
                <CreateOptionText>{'game'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    const CreateReviewButton = () => {
        const advanceToAddTitleScreen = () => {
            closeDrawer();
            navigation.push('SelectTitleScreen', { clubID: club?.id });
        }    
        return (
            <CreateOptionView>
                <CreateReviewPressable onPress={advanceToAddTitleScreen}>
                    <ReviewIconSVG />
                </CreateReviewPressable>
                <CreateOptionText>{'review'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    const CreateTopicButton = () => {
        const advanceToAddTopicScreen = () => {
            closeDrawer();
            navigation.push('CreateTopicScreen', { club });
        }
        return (
            <CreateOptionView>
                <CreateTopicPressable onPress={advanceToAddTopicScreen}>
                    <TopicsIconSVG />
                </CreateTopicPressable>
                <CreateOptionText>{'topic'}</CreateOptionText>
            </CreateOptionView>
        )
    }

    const DrawerHeader = () => {
        return (
            <DrawerHeaderView>
                <LeftSpacer />
                <HeaderText>{`Add to ${club?.name}`}</HeaderText>
                <CloseDrawerButton onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} size={20} color='white' />
                </CloseDrawerButton>
            </DrawerHeaderView>
        )
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerView bottomOffset={bottomOffset}>
                    <DrawerHeader />
                    <CreateOptionsRowView>
                        <CreateReviewButton />
                        <OptionsSpacer />
                        <CreateTopicButton />
                        <OptionsSpacer />
                        <CreateGuessingGameButton />
                    </CreateOptionsRowView>
                </DrawerView>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}