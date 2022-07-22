import React, { useContext, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    padding: 18px;
`
const ButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.color};
`
const ImageBox = styled(View)`
    align-items: center;
    margin-bottom: 12px;
    width: 100%;
`
const NoticeActionRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    padding-top: 0px;
`
const NoticeCard = styled(View)`
    border-radius: 30px;
    position: absolute;
    width: 320px;
`
const NoticeCardGradient = styled(LinearGradient)`
    border-radius: 30px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const NoticeBodyText = styled(ReelayText.Body2)`
    color: ${props => props.bodyTextColor};
`
const NoticeInfoBox = styled(View)`
    padding: 30px;
`
const NoticeTitleText = styled(ReelayText.H5Bold)`
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

const MultiPageNotice = ({ navigation, pages, images, noticeID }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [curPage, setCurPage] = useState(0);
    const dispatch = useDispatch();

    const onLastPage = (curPage === pages?.length - 1);
    const onFirstPage = (curPage === 0);
    const { title, body, imgURI } = pages[curPage];
    const imageSource = images[curPage];

    const completeNotice = async () => {
        dispatch({ type: 'setLatestNoticeDismissed', payload: true });
        const noticeHistoryJSON = await AsyncStorage.getItem('notice-history-json') ?? '{}';
        const noticeHistory = JSON.parse(noticeHistoryJSON);
        noticeHistory[noticeID] = 'dismissed';
        const saveResult = await AsyncStorage.setItem('notice-history-json', JSON.stringify(noticeHistory));
        console.log('complete notice: ', saveResult);
        logAmplitudeEventProd('dismissedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
        });
    }

    const onNoticeDismiss = async () => {
        dispatch({ type: 'setLatestNoticeDismissed', payload: true });
        const noticeHistoryJSON = await AsyncStorage.getItem('notice-history-json') ?? '{}';
        const noticeHistory = JSON.parse(noticeHistoryJSON);
        noticeHistory[latestNotice?.id] = 'dismissed';
        const saveResult = await AsyncStorage.setItem('notice-history-json', JSON.stringify(noticeHistory));
        return saveResult;
    }

    const skipNotice = () => {
        dispatch({ type: 'setLatestNoticeSkipped', payload: true });
        logAmplitudeEventProd('dismissedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
        });
    }

    const pageForward = () => {
        if (curPage === pages?.length - 1) {
            // dismiss all
        } else {
            setCurPage(curPage + 1);
        }
    }
    const pageBack = () => {
        if (onFirstPage) {
            // ignore
        } else {
            setCurPage(curPage - 1);
        }
    }

    return (
        <NoticeCard>
            <NoticeCardGradient colors={['#FF4848', '#038AFF']} />
            <NoticeInfo title={title} body={body} bodyTextColor={'white'} />
            <ImageBox>
                <Image source={imageSource} height={50} width={50} />
            </ImageBox>
            <NoticeActions 
                actionCallback={onLastPage ? completeNotice : pageForward}
                actionLabel={onLastPage ? 'Got it' : 'Next'}
                altActionCallback={onFirstPage ? skipNotice : pageBack}
                altActionLabel={onFirstPage ? 'Skip' : 'Back'}
            />
        </NoticeCard>
    )
}

const NoticeActions = ({ actionCallback, actionLabel, altActionCallback, altActionLabel }) => {
    return (
        <NoticeActionRow>
            <ButtonBox color='transparent' onPress={altActionCallback}>
                <ButtonText color='white'>{altActionLabel}</ButtonText>
            </ButtonBox>
            <ButtonBox color='white' onPress={actionCallback}>
                <ButtonText color={ReelayColors.reelayBlue}>{actionLabel}</ButtonText>
            </ButtonBox>
        </NoticeActionRow>
    );
}

const NoticeInfo = ({ title, body, bodyTextColor='gray' }) => {
    return (
        <NoticeInfoBox>
            <NoticeTitleText>{title}</NoticeTitleText>
            <NoticeBodyText bodyTextColor={bodyTextColor}>{body}</NoticeBodyText>
        </NoticeInfoBox>
    );
}

const SinglePageNotice = ({ navigation, noticeData }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { actionLabel, actionType, title, body } = noticeData;
    const dispatch = useDispatch();

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

    const skipNotice = () => {
        dispatch({ type: 'setLatestNoticeSkipped', payload: true });
        logAmplitudeEventProd('dismissedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeTitle: title,
        });
    }

    return (
        <NoticeCard>
            <NoticeCardGradient colors={['#252527', '#19242E']} />
            <NoticeInfo title={title} body={body} />
            <NoticeActions 
                actionCallback={actionCallback}
                actionLabel={actionLabel}
                altActionCallback={skipNotice}
                altActionLabel={'Skip'}
            />
        </NoticeCard>
    );
}

export default NoticeOverlay = ({ navigation }) => {
    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);

    const showNotice = latestNotice && !latestNoticeDismissed;
    if (!showNotice) return <View />;
    const { noticeType, data } = latestNotice;
    
    return (
        <OverlayBox>
            <Backdrop />
            { noticeType === 'multi-page' && (
                <MultiPageNotice 
                    images={data?.images}
                    navigation={navigation}
                    noticeID={latestNotice?.id} 
                    pages={data?.pages}
                />
            )}
            { noticeType === 'single-page' && (
                <SinglePageNotice 
                    navigation={navigation} 
                    noticeData={data} 
                /> 
            )}
        </OverlayBox>
    );

}