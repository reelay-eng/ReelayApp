import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import styled from 'styled-components';
import * as ReelayText from '../global/Text';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { AuthContext } from '../../context/AuthContext';

import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast } from '../utils/toasts';
import moment from 'moment';

const { width } = Dimensions.get('window');

const AnnouncementBox = styled(TouchableOpacity)`
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 16px;
    flex-direction: row;
    margin: 12px;
    padding: 20px;
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
const AnnouncementTitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
    margin-bottom: 8px;
`
const AnnouncementDescriptionText = styled(ReelayText.Body2)`
    color: white;
`

export default Announcements = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const latestAnnouncement = useSelector(state => state.latestAnnouncement);
    const myFollowing = useSelector(state => state.myFollowing);

    const showLatestAnnouncement = (latestAnnouncement && !latestAnnouncement?.error)
    const daysSinceSignedUp = moment().diff(moment(reelayDBUser?.createdAt), 'days');
    const showTutorial = (!showLatestAnnouncement) && (myFollowing.length > 0) && (daysSinceSignedUp < 7);
    if (!showLatestAnnouncement && !showTutorial) return <View />;

    const getTutorialObj = () => {
        return {
            reelaySub: Constants.manifest.extra.welcomeReelaySub,
            title: 'Welcome 😎🎬',
            optionsJSON: JSON.stringify({ // fitting this into the existing format
                description: `Watch a quick video about how Reelay works`
            }), 
        }
    }

    const { optionsJSON, reelaySub, title } = (showLatestAnnouncement) 
        ? latestAnnouncement
        : getTutorialObj();
    const options = optionsJSON ? JSON.parse(optionsJSON) : {};

    const advanceToReelay = async () => {
        if (!reelaySub) return;
        const fetchedReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(fetchedReelay);
        if (preparedReelay && !preparedReelay?.error) {
            navigation.push('SingleReelayScreen', {
                preparedReelay
            });
        } else {
            showErrorToast('Ruh roh! Couldn\'t open the tutorial video. Try again?');
        }
    }

    return (
        <AnnouncementBox onPress={advanceToReelay}>
            <AnnouncementInfoBox>
                <AnnouncementTitleText>
                    { title }
                </AnnouncementTitleText>
                <AnnouncementDescriptionText>
                    { options?.description ?? '' }
                </AnnouncementDescriptionText>
            </AnnouncementInfoBox>
            <AnnouncementIconBox>
                <FontAwesomeIcon icon={ faPlay } color='white' size={20} />
            </AnnouncementIconBox>
        </AnnouncementBox>
    );
}    
