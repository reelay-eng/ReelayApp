import React, { useContext, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import ReelayColors from '../../constants/ReelayColors';

const AddToThreadButtonShadow = styled(View)`
    align-items: center;
    height: 45px;
    justify-content: center;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.3;
    position: absolute;
    width: 45px;
`
const AddToThreadButtonCircleView = styled(View)`
    align-items: center;
    align-self: center;
    background: ${ReelayColors.reelayBlue};
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const AddToThreadButtonOuterView = styled(TouchableOpacity)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default AddToStackButton = ({ navigation, reelay, club=null, topic=null }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const advanceToTitleSelect = () => navigation.push('SelectTitleScreen', {
        clubID: club?.id ?? null,
        topic,
    });
    const advanceToVenueSelect = () => navigation.push('VenueSelectScreen', { 
        clubID: club?.id ?? null, 
        titleObj: reelay?.title,
    });

    const advanceToCreateReelay = () => {
        if (showMeSignupIfGuest()) return;
        if (topic) {
            advanceToTitleSelect();
        } else {
            advanceToVenueSelect();
        }

        logAmplitudeEventProd('pressedAddReelayButton', {
            creatorName: reelay?.creator?.username,
            creatorSub: reelay?.creator?.sub,
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            title: reelay?.title?.display,
            club: club?.name ?? null,
            clubID: club?.id ?? null,
            topicID: topic?.id ?? null,
            topic: topic?.title ?? null,
        });
    }

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

    return (
        <AddToThreadButtonOuterView onPress={advanceToCreateReelay}>
            <AddToThreadButtonCircleView markedSeen={false} userSub={reelayDBUser?.sub}>
                <AddToThreadButtonShadow>
                { (false) && <FontAwesomeIcon icon={faCheck} color='white' size={22}/> }
                { (true) && <FontAwesomeIcon icon={faAdd} color='white' size={22}/> }
                </AddToThreadButtonShadow>
            </AddToThreadButtonCircleView>
        </AddToThreadButtonOuterView>
    );
}