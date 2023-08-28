import React, { Fragment, useContext } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { GamesIconSVG, ReviewIconSVG, TopicsIconSVG } from '../../components/global/SVGs';
import { AuthContext } from '../../context/AuthContext';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;

const CenterSpacer = styled(View)`
    width: ${BUTTON_MARGIN_WIDTH}px;
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
const CreateReelayPressable = styled(CreateOptionPressable)`
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
const CreateScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const HeaderView = styled(View)`
	align-items: center;
	flex-direction: row;
	margin-top: 6px;
	margin-left: 12px;
	margin-bottom: 12px;
    top: ${props => props.topOffset}px;
	width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
	color: white;
	font-size: 24px;
	line-height: 24px;
	margin-top: 2px;
	text-align: left;
`
const HeaderSpacer = styled(View)`
    height: 200px;
`

export default CreateScreen = ({ navigation }) => {
    try {
        firebaseCrashlyticsLog('Create reelay screen');
        const { reelayDBUser } = useContext(AuthContext);
        const dispatch = useDispatch();
        const topOffset = useSafeAreaInsets().top;

        const canCreateGuessingGame = (reelayDBUser?.role === 'admin');

        const numButtons = canCreateGuessingGame ? 3 : 2;
        const numSpaces = numButtons + 2;
        const squishButton = !canCreateGuessingGame;

        const allButtonWidth = width - (numSpaces * BUTTON_MARGIN_WIDTH);
        const buttonWidth = allButtonWidth / numButtons;
        const buttonHeight = (squishButton) ? (buttonWidth * 0.67) : buttonWidth;

        const Header = () => {
            return (
                <HeaderView topOffset={topOffset}>
                    <HeaderText>{'create'}</HeaderText>
                </HeaderView>
            )
        }

        const CreateGuessingGameButton = () => {
            const advanceToCreateGuessingGame = () => {
                navigation.push('SelectCorrectGuessScreen');
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

        const CreateReelayButton = () => {
            const advanceToCreateReelay = () => navigation.push('SelectTitleScreen');
            return (
                <CreateOptionView>
                    <CreateReelayPressable
                        onPress={advanceToCreateReelay}
                        height={buttonHeight}
                        width={buttonWidth}
                    >
                        <ReviewIconSVG />
                    </CreateReelayPressable>
                    <CreateOptionText>{'reelay'}</CreateOptionText>
                </CreateOptionView>
            )
        }

        const CreateTopicButton = () => {
            const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');
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

        useFocusEffect(() => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        });

        return (
            <CreateScreenView>
                <Header />
                <HeaderSpacer />
                <CreateOptionsRowView>
                    <CreateReelayButton />
                    <CenterSpacer />
                    <CreateTopicButton />
                    {canCreateGuessingGame && (
                        <Fragment>
                            <CenterSpacer />
                            <CreateGuessingGameButton />
                        </Fragment>
                    )}
                </CreateOptionsRowView>
            </CreateScreenView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}