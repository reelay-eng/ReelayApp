import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import styled from 'styled-components';
import * as ReelayText from '../global/Text';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast } from '../utils/toasts';
import moment from 'moment';
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

export default Announcement = ({ announcement, color, icon, navigation, onPress, onDismiss }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);

    const showAnnouncement = (announcement && !announcement?.error)
    const daysSinceSignedUp = moment().diff(moment(reelayDBUser?.createdAt), 'days');
    const showTutorial = (!showAnnouncement) && (myFollowing.length > 0) && (daysSinceSignedUp < 7);
    if (!showAnnouncement && !showTutorial) return <View />;

    const getTutorialObj = () => {
        return {
            reelaySub: Constants.manifest.extra.welcomeReelaySub,
            title: 'Welcome 😎🎬',
            description: `Watch a quick video about how Reelay works`,
        }
    }

    const { description, optionsJSON, reelaySub, title } = (showTutorial) 
        ? getTutorialObj()
        : announcement;
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
