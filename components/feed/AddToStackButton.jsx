import React, { useContext, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ClubsButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${({ markedSeen }) => (markedSeen) 
        ? 'rgba(41, 119, 239, 0.40)'
        : 'rgba(255, 255, 255, 0.20)'
    };
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const ClubsButtonOuterContainer = styled(TouchableOpacity)`
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
    }

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

    return (
        <ClubsButtonOuterContainer onPress={advanceToCreateReelay}>
            <ClubsButtonCircleContainer markedSeen={false}>
                { (false) && <FontAwesomeIcon icon={faCheck} color='white' size={22}/> }
                { (true) && <FontAwesomeIcon icon={faAdd} color='white' size={22}/> }
            </ClubsButtonCircleContainer>
        </ClubsButtonOuterContainer>
    );
}