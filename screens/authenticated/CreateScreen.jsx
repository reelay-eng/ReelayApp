import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { GamesIconSVG, ReviewIconSVG, TopicsIconSVG } from '../../components/global/SVGs';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = (width - (BUTTON_MARGIN_WIDTH * 5)) / 3;

const CenterSpacer = styled(View)`
    width: ${BUTTON_MARGIN_WIDTH}px;
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
    const dispatch = useDispatch();
    const topOffset = useSafeAreaInsets().top;

    const Header = () => {
        return (
            <HeaderView topOffset={topOffset}>
                <HeaderText>{'create'}</HeaderText>
            </HeaderView>
        )
    }

    const CreateGuessingGameButton = () => {
        const advanceToCreateGuessingGame = () => {
            closeDrawer();
            navigation.navigate('Create', { screen: 'CreateGuessingGameScreen' });
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
        const advanceToCreateReview = () => navigation.push('SelectTitleScreen');
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
        const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');
        return (
            <CreateOptionView>
                <CreateTopicPressable onPress={advanceToCreateTopic}>
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
                <CreateReviewButton />
                <CenterSpacer />
                <CreateTopicButton />
                <CenterSpacer />
                <CreateGuessingGameButton />
            </CreateOptionsRowView>
        </CreateScreenView>
    );
}