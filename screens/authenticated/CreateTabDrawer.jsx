import React, { Fragment, useContext } from 'react';
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GamesIconSVG, ReviewIconSVG, TopicsIconSVG } from '../../components/global/SVGs';
import { AuthContext } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;

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
    justify-content: center;
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
    height: ${props => props.height}px;
    width: ${props => props.width}px;
`
const CreateReviewPressable = styled(CreateOptionPressable)`
    background-color: ${ReelayColors.reelayBlue};
    height: ${props => props.height}px;
    width: ${props => props.width}px;
`
const CreateTopicPressable = styled(CreateOptionPressable)`
    background-color: #8348D7;
    height: ${props => props.height}px;
    width: ${props => props.width}px;
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
const CenterSpacer = styled(View)`
    width: ${BUTTON_MARGIN_WIDTH}px;
`

export default CreateTabDrawer = ({ closeDrawer, navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom;
    const canCreateGuessingGame = (reelayDBUser?.role === 'admin');

    const numButtons = canCreateGuessingGame ? 3 : 2;
    const numSpaces = numButtons + 2;
    const squishButton = !canCreateGuessingGame;

    const allButtonWidth = width - (numSpaces * BUTTON_MARGIN_WIDTH);
    const buttonWidth = allButtonWidth / numButtons;
    const buttonHeight = (squishButton) ? (buttonWidth * 0.67) : buttonWidth;

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

    const CreateGuessingGameButton = () => {
        const advanceToCreateGuessingGame = () => {
            closeDrawer();
            navigation.navigate('Create', { screen: 'SelectCorrectGuessScreen' });
        }
        return (
            <CreateOptionView>
                <CreateGuessingGamePressable 
                    onPress={advanceToCreateGuessingGame} 
                    height={buttonHeight} 
                    width={buttonWidth}
                >
                    <GamesIconSVG />
                </CreateGuessingGamePressable>
                <CreateOptionText>{'game'}</CreateOptionText>
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
                <CreateReviewPressable 
                    onPress={advanceToCreateReview} 
                    height={buttonHeight} 
                    width={buttonWidth}
                >
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
                <CreateTopicPressable 
                    onPress={advanceToCreateTopic} 
                    height={buttonHeight} 
                    width={buttonWidth}
                >
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
                    <CenterSpacer />
                    <CreateTopicButton />
                    { canCreateGuessingGame && (
                        <Fragment>
                            <CenterSpacer />
                            <CreateGuessingGameButton />
                        </Fragment>
                    )}
                </CreateOptionsRowView>
            </DrawerView>
        </Modal>
    )
}