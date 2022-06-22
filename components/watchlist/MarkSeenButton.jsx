import React, { useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { showMessageToast } from '../utils/toasts';

import { getWatchlistItems, markWatchlistItemSeen, markWatchlistItemUnseen } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
`
const MarkSeenText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    padding-right: 6px;
`

export default MarkSeenButton = ({ markedSeen, setMarkedSeen, titleObj }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    const updateWatchlistReqBody = { 
        reqUserSub: reelayDBUser?.sub, 
        tmdbTitleID: titleObj.id, 
        titleType: titleObj.titleType,
    };

    const markSeen = async () => {
        setMarkedSeen(true);
        const markSeenResult = await markWatchlistItemSeen(updateWatchlistReqBody);
        console.log('mark seen result: ', markSeenResult);
        showMessageToast('Title marked as seen', 'bottom');

        logAmplitudeEventProd('markWatchlistItemSeen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });

        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
    }

    const markUnseen = async () => {
        setMarkedSeen(false);
        const markUnseenResult = await markWatchlistItemUnseen(updateWatchlistReqBody);
        console.log('mark unseen result: ', markUnseenResult);
        showMessageToast('Title marked unseen', 'bottom');

        logAmplitudeEventProd('markWatchlistItemUnseen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });

        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })    
    }

    return (
        <MarkSeenButtonContainer onPress={(markedSeen) ? markUnseen : markSeen}>
            <MarkSeenText>{'Seen'}</MarkSeenText>
            { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={30} />}
            { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={30} />}
        </MarkSeenButtonContainer>
    );
}