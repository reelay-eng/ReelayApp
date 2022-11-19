import React, { useContext, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { getWatchlistItems, markWatchlistItemSeen, markWatchlistItemUnseen } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import moment from 'moment';

const MarkSeenButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    padding-left: 4px;
`
const MarkSeenText = styled(ReelayText.CaptionEmphasized)`
    color: #86878B;
    font-size: 16px;
    padding-right: 6px;
`

export default MarkSeenButton = ({ 
    // markedSeen, 
    // setMarkedSeen, 
    showText=true, 
    size=30,
    watchlistItem,
}) => {
    const markSeenText = (markedSeen) ? 'Seen' : 'Mark seen';
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const titleObj = watchlistItem?.title;

    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const matchWatchlistItem = (nextItem) => nextItem?.id === watchlistItem?.id;
    const myWatchlistItem = myWatchlistItems?.find(matchWatchlistItem) ?? null;
    const markedSeen = myWatchlistItem ? myWatchlistItem?.hasSeenTitle : null;

    const updateWatchlistReqBody = { 
        reqUserSub: reelayDBUser?.sub, 
        tmdbTitleID: titleObj?.id, 
        titleType: titleObj?.titleType,
    };

    const markSeen = async () => {
        if (watchlistItem?.id) {
            watchlistItem.hasSeenTitle = true;
            watchlistItem.updatedAt = moment().toISOString();
            dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItem });
        }
        const markSeenResult = await markWatchlistItemSeen(updateWatchlistReqBody);
        console.log('mark seen result: ', markSeenResult);

        logAmplitudeEventProd('markWatchlistItemSeen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });
    }

    const markUnseen = async () => {
        if (watchlistItem?.id) {
            watchlistItem.hasSeenTitle = false;
            watchlistItem.updatedAt = moment().toISOString();
            dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItem });
        }

        const markUnseenResult = await markWatchlistItemUnseen(updateWatchlistReqBody);
        console.log('mark unseen result: ', markUnseenResult);

        logAmplitudeEventProd('markWatchlistItemUnseen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });
    }

    return (
        <MarkSeenButtonContainer onPress={(markedSeen) ? markUnseen : markSeen}>
            { showText && <MarkSeenText>{markSeenText}</MarkSeenText> }
            { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} size={size} />}
            { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={size} />}
        </MarkSeenButtonContainer>
    );
}
