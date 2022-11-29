import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import { SwipeLeftAndRightSVG, SwipeUpAndDownSVG } from '../global/SVGs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const { height, width } = Dimensions.get('window');

const BodyText = styled(ReelayText.Body1)`
    color: ${props => props?.color ?? 'white'};
    font-size: 14px;
    line-height: 18px;
    text-align: left;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 0px 1px;
    text-shadow-radius: 1px;
    width: 100%;
`
const CloseButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: gray;
    border-radius: 40px;
    bottom: ${props => props.bottomOffset + 20}px;
    height: 40px;
    justify-content: center;
    position: absolute;
    width: 40px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    line-height: 24px;
    margin-bottom: 24px;
    text-align: center;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 0px 1px;
    text-shadow-radius: 1px;
    width: 100%;
`
const IconView = styled(View)`
    height: 100%;
    justify-content: center;
`
const InstructionTextView = styled(View)`
    margin-left: 24px;
    width: 240px;
`
const InstructionView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    height: 60px;
    margin-bottom: 18px;
    width: 100%;
`
const TutorialWhite = styled(View)`
    background-color: rgba(255,255,255,0.5);
    height: ${height}px;
    position: absolute;
    width: 100%;
`
const TutorialView = styled(BlurView)`
    align-items: center;
    height: ${height}px;
    justify-content: center;
    position: absolute;
    width: 100%;
`

const INSTRUCTIONS = [
    {
        renderIcon: () => <SwipeUpAndDownSVG />,
        goalText: 'To see a different title or topic',
        actionText: 'swipe up',
    },
    {
        renderIcon: () => <SwipeLeftAndRightSVG />,
        goalText: 'More on the same title or topic',
        actionText: 'swipe left',
    },
    {
        renderIcon: () => <FontAwesomeIcon icon={faBookmark} size={30} color='white' />,
        goalText: 'Save to your watchlist',
        actionText: 'press this icon',
    },
]

export default FeedTutorial = ({ onClose }) => {
    const bottomOffset = useSafeAreaInsets().bottom;

    const renderInstruction = ({ renderIcon, goalText, actionText }) => {
        return (
            <InstructionView key={goalText}>
                <IconView>
                    { renderIcon() }
                </IconView>
                <InstructionTextView>
                    <BodyText color={'white'}>{goalText}</BodyText>
                    <BodyText color={'gray'}>{actionText}</BodyText>
                </InstructionTextView>
            </InstructionView>
        );
    }

    const CloseButton = () => {
        return (
            <CloseButtonPressable bottomOffset={bottomOffset} onPress={onClose}>
                <FontAwesomeIcon icon={faXmark} color='white' size={24} />
            </CloseButtonPressable>
        )
    }

    return (
        <Modal animationType='slide' transparent={true} visible={true}>
            <TutorialWhite />
            <TutorialView intensity={100} tint='dark'>
                <HeaderText>{'Using the feed'}</HeaderText>
                { INSTRUCTIONS.map(renderInstruction) }
                <CloseButton />
            </TutorialView>
        </Modal>
    )
}