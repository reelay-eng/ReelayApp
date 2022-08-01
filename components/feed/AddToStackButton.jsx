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

const userSubIsEven = (userSub) => {
    const userSubAsInt = parseInt(userSub, 16);
    return userSubAsInt % 2 === 0;
}

const getAddToStackButtonColor = (markedSeen, userSub) => {
    if (userSubIsEven(userSub)) {
        return (markedSeen) ? 'rgba(41, 119, 239, 0.40)' : 'rgba(255, 255, 255, 0.20)';
    } else {
        return ReelayColors.reelayBlue;
    }
}

const ClubsButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${props => getAddToStackButtonColor(props.markedSeen, props.userSub)};
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

        logAmplitudeEventProd('pressedAddReelayButton', {
            buttonColor: userSubIsEven(reelayDBUser?.sub) 
                ? 'white' 
                : ReelayColors.reelayBlue,
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
        <ClubsButtonOuterContainer onPress={advanceToCreateReelay}>
            <ClubsButtonCircleContainer markedSeen={false} userSub={reelayDBUser?.sub}>
                { (false) && <FontAwesomeIcon icon={faCheck} color='white' size={22}/> }
                { (true) && <FontAwesomeIcon icon={faAdd} color='white' size={22}/> }
            </ClubsButtonCircleContainer>
        </ClubsButtonOuterContainer>
    );
}