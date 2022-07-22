import React, { useEffect } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styled from 'styled-components';
import * as ReelayText from '../global/Text';

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
const AnnouncementDescriptionText = styled(ReelayText.Body2)`
    color: white;
`

const Announcement = ({ announcement, color, icon, navigation, onPress, onDismiss }) => {
    const showAnnouncement = (announcement && !announcement?.error);
    if (!showAnnouncement) return <View />;
    const { description, optionsJSON, reelaySub, title } = announcement;
    const options = optionsJSON ? JSON.parse(optionsJSON) : {};

    const advanceToReelay = async () => {
        if (!reelaySub) return;
        const fetchedReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(fetchedReelay);
        if (preparedReelay && !preparedReelay?.error) {
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
                    <AnnouncementTitleText>
                        { title }
                    </AnnouncementTitleText>
                    <AnnouncementDescriptionText>
                        { description ?? options?.description ?? '' }
                    </AnnouncementDescriptionText>
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

    const latestNotice = useSelector(state => state.latestNotice);
    const latestNoticeDismissed = useSelector(state => state.latestNoticeDismissed);
    const latestNoticeSkipped = useSelector(state => state.latestNoticeSkipped);

    const showNoticeAsAnnouncement = (
        latestNotice && 
        latestNoticeSkipped && 
        !latestNoticeDismissed &&
        latestNotice?.noticeType === 'single-page'
    );   

    const advanceToCreateScreen = async () => navigation.navigate('Create');
    const advanceToCreateClubScreen = async () => navigation.navigate('CreateClubScreen');

    const handleNoticeOnPress = () => {
        switch (latestNotice?.actionType) {
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

    useEffect(() => {
        // triggers reducer to set defaults if these values are null
        dispatch({ type: 'setLatestNotice', payload: latestNotice });
        dispatch({ type: 'setLatestAnnouncement', payload: latestAnnouncement });
    }, []);

    return (
        <AllAnnouncementsBox>
            { !latestAnnouncementDismissed && <Announcement 
                announcement={latestAnnouncement}
                navigation={navigation} 
                onDismiss={onAnnouncementDismiss}
            /> }
            { showNoticeAsAnnouncement && <Announcement 
                announcement={latestNotice} 
                color={ReelayColors.reelayGreen}
                icon={<FontAwesomeIcon icon={ faPlus } color='white' size={22} />}
                navigation={navigation} 
                onDismiss={onNoticeDismiss}
                onPress={handleNoticeOnPress}
            /> }
        </AllAnnouncementsBox>
    );
}