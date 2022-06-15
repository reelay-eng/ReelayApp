import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';

const Backdrop = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    justify-content: center;
    opacity: 0.6;
    position: absolute;
    width: 100%;
`
const ButtonBox = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.color};
    border-radius: 12px;
    justify-content: center;
    padding: 12px;
`
const ButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.color};
`
const NoticeActionRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    padding-top: 0px;
`
const NoticeCard = styled(View)`
    border-radius: 16px;
    width: 75%;
`
const NoticeCardGradient = styled(LinearGradient)`
    border-radius: 16px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const NoticeDescriptionText = styled(ReelayText.Body2)`
    color: gray;
`
const NoticeInfoBox = styled(View)`
    padding: 16px;
`
const NoticeTitleText = styled(ReelayText.H5Bold)`
    padding-top: 16px;
    color: white;
    line-height: 30px;
    margin-bottom: 12px;
`
const OverlayBox = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`

export default NoticeOverlay = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const showNotice = latestNotice && !latestNoticeDismissed;
    if (!showNotice) return <View />;

    const { actionLabel, actionData, actionType, title, description } = latestNotice;

    const advanceToCreateScreen = () => {
        navigation.navigate('Create');
        dispatch({ type: 'setLatestNoticeSkipped', payload: true });
        logAmplitudeEventProd('acceptedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
            action: 'advanceToCreateScreen',
        });
    }

    const advanceToCreateClubScreen = () => {
        navigation.navigate('CreateClubScreen');
        dispatch({ type: 'setLatestNoticeSkipped', payload: true });
        logAmplitudeEventProd('acceptedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
            action: 'advanceToCreateClubScreen',
        });
    }

    const closeOverlay = () => {
        dispatch({ type: 'setLatestNoticeSkipped', payload: true });
        logAmplitudeEventProd('dismissedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
        });
    }

    const actionCallback = () => {
        switch (actionType) {
            case 'advanceToCreateScreen':
                advanceToCreateScreen();
                return;
            case 'advanceToCreateClubScreen':
                advanceToCreateClubScreen();
            default:
                return;
        }
    }

    const NoticeInfo = () => {
        return (
            <NoticeInfoBox>
                <NoticeTitleText>{title}</NoticeTitleText>
                <NoticeDescriptionText>{description}</NoticeDescriptionText>
            </NoticeInfoBox>
        );
    }

    const NoticeActions = () => {
        return (
            <NoticeActionRow>
                <ButtonBox color='transparent' onPress={closeOverlay}>
                    <ButtonText color='white'>{'Skip'}</ButtonText>
                </ButtonBox>
                <ButtonBox color='white' onPress={actionCallback}>
                    <ButtonText color={ReelayColors.reelayBlue}>{actionLabel}</ButtonText>
                </ButtonBox>
            </NoticeActionRow>
        );
    }

    return (
        <OverlayBox>
            <Backdrop />
            <NoticeCard>
                <NoticeCardGradient colors={['#252527', '#19242E']} />
                <NoticeInfo />
                <NoticeActions />
            </NoticeCard>
        </OverlayBox>
    );
}