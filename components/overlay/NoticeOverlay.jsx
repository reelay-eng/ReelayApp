import React, { useContext, useEffect, useState } from 'react';
import { Pressable, Image, TouchableOpacity, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { StreamingSelectorGrid } from '../home/StreamingSelector';
import { animate, animateCustom } from "../../hooks/animations";

const Backdrop = styled(Pressable)`
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
    padding: 8px;
    padding-left: 18px;
    padding-right: 18px;
    margin-right: 14px;
`
const ButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.color};
`
const ImageBox = styled(View)`
    align-items: center;
    margin-bottom: 16px;
`
const NoticeActionRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
`
const NoticeCard = styled(View)`
    border-radius: 30px;
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
    padding-top: 24px;
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 12px;
`
const NoticeTitleText = styled(ReelayText.H5Bold)`
    color: white;
    line-height: 28px;
    margin-bottom: 6px;
`
const OverlayBox = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`

const MultiPageNotice = ({ navigation, dismissNotice, pages, images }) => {
    const [curPage, setCurPage] = useState(0);
    const onLastPage = (curPage === pages?.length - 1);
    const onFirstPage = (curPage === 0);
    const { title, body, imgHeight, imgWidth, orientation, newStreamingVenues } = pages[curPage];

    const pageForward = () => {
        if (curPage === pages?.length - 1) {
            // dismiss all
        } else {
            animate(300, "easeOut")
            setCurPage(curPage + 1);
        }
    }

    const pageBack = () => {
        if (onFirstPage) {
            // ignore
        } else {
            animate(300, "easeOut");
            setCurPage(curPage - 1);
        }
    }

    const ContentSection = () => {
        if (orientation === 'title-body-image') {
            const imageSource = images[curPage];
            return (
                <ImageBox>
                    <Image style={{ borderRadius: 12, height: imgHeight, width: imgWidth }} source={imageSource} resizeMode='cover' />
                </ImageBox>
            );
        }

        if (orientation === 'streaming-selector') {
            return <StreamingSelectorGrid setRefreshing={() => {}} venueList={newStreamingVenues} />;
        }

        return <View />;
    }

    return (
        <NoticeCard>
            <NoticeCardGradient colors={['#FF4848', '#038AFF']} />
            <NoticeInfo title={title} body={body} bodyTextColor={'white'} />
            <ContentSection />
            <NoticeActions 
                actionCallback={onLastPage ? dismissNotice : pageForward}
                actionLabel={onLastPage ? 'Got it' : 'Next'}
                altActionCallback={onFirstPage ? dismissNotice : pageBack}
                altActionLabel={onFirstPage ? 'Dismiss' : 'Back'}
                onLastPage={onLastPage}
            />
        </NoticeCard>
    )
}

const NoticeActions = ({ 
    actionCallback, 
    actionLabel, 
    altActionCallback, 
    altActionLabel, 
    onLastPage,
}) => {
    return (
        <NoticeActionRow>
            <ButtonBox color='transparent' onPress={altActionCallback}>
                <ButtonText color='white'>{altActionLabel}</ButtonText>
            </ButtonBox>
            <ButtonBox color={onLastPage ? 'white' : 'transparent'} onPress={actionCallback}>
                <ButtonText color={onLastPage ? ReelayColors.reelayBlue : 'white'}>{actionLabel}</ButtonText>
            </ButtonBox>
        </NoticeActionRow>
    );
}

const NoticeInfo = ({ title, body, bodyTextColor='gray' }) => {
    return (
        <NoticeInfoBox>
            <NoticeTitleText>{title}</NoticeTitleText>
            { (body?.length > 0) && <NoticeBodyText bodyTextColor={bodyTextColor}>{body}</NoticeBodyText> }
        </NoticeInfoBox>
    );
}

const SinglePageNotice = ({ dismissNotice, navigation, noticeData }) => {
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
        dismissNotice();
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
                onLastPage={true}
            />
        </NoticeCard>
    );
}

export default NoticeOverlay = ({ navigation }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);

    const showNotice = latestNotice && !latestNoticeDismissed;
    if (!showNotice) return <View />;
    const { noticeType, data } = latestNotice;

    useEffect(() => {
        animate(400);
    }, [])

    const dismissNotice = async () => {
        animateCustom({
            delete: {
                duration: 400,
                property: 'opacity',
                type: 'linear'
            }
        });
        dispatch({ type: 'setLatestNoticeDismissed', payload: true });
        const noticeHistoryJSON = await AsyncStorage.getItem('notice-history-json') ?? '{}';
        const noticeHistory = JSON.parse(noticeHistoryJSON);
        noticeHistory[latestNotice?.id] = 'dismissed';
        const saveResult = await AsyncStorage.setItem('notice-history-json', JSON.stringify(noticeHistory));
        logAmplitudeEventProd('dismissedNoticeCTA', {
            username: reelayDBUser?.sub,
            noticeID: latestNotice?.id,
        });
        return saveResult;
    }
    
    return (
        <OverlayBox>
            <Backdrop onPress={dismissNotice}/>
            { noticeType === 'multi-page' && (
                <MultiPageNotice 
                    dismissNotice={dismissNotice}
                    images={data?.images}
                    navigation={navigation}
                    noticeID={latestNotice?.id}
                    pages={data?.pages}
                />
            )}
            { noticeType === 'single-page' && (
                <SinglePageNotice 
                    dismissNotice={dismissNotice}
                    navigation={navigation} 
                    noticeData={data} 
                /> 
            )}
        </OverlayBox>
    );

}