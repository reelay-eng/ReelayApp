import React, { useEffect } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import Constants from 'expo-constants';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast } from '../utils/toasts';
import SwipeableRow from '../global/SwipeableRow';

const { width } = Dimensions.get('window');

const AnnouncementBox = styled(TouchableOpacity)`
    background-color: ${props => props.color};
    border-radius: 8px;
    flex-direction: row;
    margin: 6px;
    margin-left: 12px;
    margin-right: 12px;
    padding: 16px;
    padding-top: 16px;
    padding-bottom: 16px;
`
const AllAnnouncementsBox = styled(View)`
    margin-bottom: 10px;
`
const AnnouncementInfoBox = styled(View)`
    width: ${width - 96}px;
`
const AnnouncementIconBox = styled(View)`
    align-items: center;
    justify-content: center;
    width: 30px;
`
const AnnouncementTitleText = styled(ReelayText.H5Emphasized)`
    color: white;
    font-size: 20px;
    margin-bottom: 8px;
`
const AnnouncementBodyText = styled(ReelayText.Body2)`
    color: white;
`
const WELCOME_REELAY_SUB = Constants.manifest.extra.welcomeReelaySub;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

const Announcement = ({ announcement, color, icon, navigation, onPress, onDismiss }) => {
    const showAnnouncement = (announcement && !announcement?.error);
    if (!showAnnouncement) return <View />;
    const { optionsJSON, reelaySub, title } = announcement;
    const options = optionsJSON ? JSON.parse(optionsJSON) : {};

    console.log('reelay sub: ', reelaySub);
    
    // no, i'm not proud of this... we're coalescing the body text of the announcement depending
    // on its source (version guide, create popup, posted announcements) 
    const body = (announcement?.body ?? announcement?.description ?? options?.description ?? '');

    const advanceToReelay = async () => {
        if (!reelaySub) return;
        const isWelcomeReelay = (reelaySub === WELCOME_REELAY_SUB);
        const fetchedReelay = (isWelcomeReelay) 
            ? await getReelay(reelaySub, 'dev') 
            : await getReelay(reelaySub, FEED_VISIBILITY);
            
        const preparedReelay = await prepareReelay(fetchedReelay);
        if (preparedReelay && !preparedReelay?.error) {
            console.log('prepared reelay: ', preparedReelay);
            navigation.push('SingleReelayScreen', { preparedReelay });
        } else {
            showErrorToast('Ruh roh! Couldn\'t open the tutorial video. Try again?');
        }
    }

    const renderDismissIcon = () => <FontAwesomeIcon icon={ faTrashCan } color='white' size={20} />;

    return (
        <SwipeableRow onPress={onDismiss} renderIcon={renderDismissIcon}>
            <AnnouncementBox color={color ?? ReelayColors.reelayBlue} onPress={onPress ?? advanceToReelay}>
                <AnnouncementInfoBox>
                    <AnnouncementTitleText>{title}</AnnouncementTitleText>
                    <AnnouncementBodyText>{body}</AnnouncementBodyText>
                </AnnouncementInfoBox>
                <AnnouncementIconBox>
                    { icon ?? <FontAwesomeIcon icon={ faPlay } color='white' size={20} /> }
                </AnnouncementIconBox>
            </AnnouncementBox>
        </SwipeableRow>
    );
}    

export default AnnouncementsAndNotices = ({ navigation }) => {
    const dispatch = useDispatch();
    const latestAnnouncement = useSelector(state => state.latestAnnouncement);
    const latestAnnouncementDismissed = useSelector(state => state.latestAnnouncementDismissed);
    const showLatestAnnouncement = (latestAnnouncement && !latestAnnouncementDismissed);

    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const latestNoticeSkipped = useSelector(state => state.latestNoticeSkipped);

    const showNoticeAsAnnouncement = (
        !showLatestAnnouncement && 
        latestNotice && 
        latestNoticeSkipped && 
        !latestNoticeDismissed &&
        latestNotice?.noticeType === 'single-page'
    );   

    const advanceToCreateScreen = async () => navigation.navigate('Create');
    const advanceToCreateClubScreen = async () => navigation.navigate('CreateClubScreen');

    const handleNoticeOnPress = () => {
        switch (latestNotice?.data?.actionType) {
            case 'advanceToCreateScreen':
                advanceToCreateScreen();
                return;
            case 'advanceToCreateClubScreen':
                advanceToCreateClubScreen();
                return;
            default:
                return;
        }
    }

    const onAnnouncementDismiss = async () => {
        dispatch({ type: 'setLatestAnnouncementDismissed', payload: true });
        const announcementHistoryJSON = await AsyncStorage.getItem('announcement-history-json') ?? '{}';
        const announcementHistory = JSON.parse(announcementHistoryJSON);
        announcementHistory[latestAnnouncement?.id] = 'dismissed';
        const saveResult = await AsyncStorage.setItem('announcement-history-json', JSON.stringify(announcementHistory));
        return saveResult;
    }

    const onNoticeDismiss = async () => {
        dispatch({ type: 'setLatestNoticeDismissed', payload: true });
        const noticeHistoryJSON = await AsyncStorage.getItem('notice-history-json') ?? '{}';
        const noticeHistory = JSON.parse(noticeHistoryJSON);
        noticeHistory[latestNotice?.id] = 'dismissed';
        const saveResult = await AsyncStorage.setItem('notice-history-json', JSON.stringify(noticeHistory));
        return saveResult;
    }

    // useEffect(() => {
    //     // triggers reducer to set defaults if these values are null
    //     dispatch({ type: 'setLatestNotice', payload: latestNotice });
    //     dispatch({ type: 'setLatestAnnouncement', payload: latestAnnouncement });
    // }, []);

    return (
        <AllAnnouncementsBox>
            { showLatestAnnouncement && <Announcement 
                announcement={latestAnnouncement}
                navigation={navigation} 
                onDismiss={onAnnouncementDismiss}
            /> }
            { showNoticeAsAnnouncement && <Announcement 
                announcement={latestNotice?.data} 
                color={ReelayColors.reelayGreen}
                icon={<FontAwesomeIcon icon={ faPlus } color='white' size={22} />}
                navigation={navigation} 
                onDismiss={onNoticeDismiss}
                onPress={handleNoticeOnPress}
            /> }
        </AllAnnouncementsBox>
    );
}