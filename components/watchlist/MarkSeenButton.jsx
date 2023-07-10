import React, { Fragment, useContext, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { getWatchlistItems, markWatchlistItemSeen, markWatchlistItemUnseen, setReactEmojis } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import moment from 'moment';
import * as Haptics from 'expo-haptics';

const MarkedSeenCircle = styled(View)`
    background-color: ${props => props.markedSeen ? 'white' : 'transparent'};
    border-radius: ${props => props.size}px;
    height: ${props => props.size}px;
    position: absolute;
    right: 6px;
    width: ${props => props.size}px;
`
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
    onMarkedSeen = () => {},
    showText=true, 
    size=30,
    watchlistItem,profile=0
}) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const titleObj = watchlistItem?.title;

    const matchWatchlistItem = (nextItem) => nextItem?.id === watchlistItem?.id;
    const markedSeen = useSelector(state => state.myWatchlistItems.find(matchWatchlistItem)?.hasSeenTitle) ?? false;
    const markSeenText = (markedSeen) ? 'Seen' : 'Mark seen';

    const updateWatchlistReqBody = { 
        reqUserSub: reelayDBUser?.sub, 
        tmdbTitleID: titleObj?.id, 
        titleType: titleObj?.titleType,
    };

    const markSeen = async () => {
        if (showMeSignupIfGuest()) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (watchlistItem?.id) {
            watchlistItem.hasSeenTitle = true;
            watchlistItem.updatedAt = moment().toISOString();
            dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItem });
        }

        onMarkedSeen();
        const markSeenResult = await markWatchlistItemSeen(updateWatchlistReqBody);

        logAmplitudeEventProd('markWatchlistItemSeen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });

    }

    const markUnseen = async () => {
        if (showMeSignupIfGuest()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const markUnseenResult = await markWatchlistItemUnseen(updateWatchlistReqBody);

        if (watchlistItem?.id) {
            watchlistItem.hasSeenTitle = false;
            watchlistItem.updatedAt = moment().toISOString();
            watchlistItem.reactEmojis = '';
            dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItem });

            const reactEmojisResult = await setReactEmojis({ 
                authSession, 
                itemID: watchlistItem?.id, 
                reactEmojis: '', 
                reqUserSub: reelayDBUser?.sub,
            });
        }

        logAmplitudeEventProd('markWatchlistItemUnseen', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
        });
    }

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}

    return (
        <View style={{ marginTop: profile == 1 ? -45 : 0 }}>
        <MarkSeenButtonContainer onPress={(markedSeen) ? markUnseen : markSeen}>
            { showText && profile !== 1 && <MarkSeenText>{markSeenText}</MarkSeenText> }
            <MarkedSeenCircle markedSeen={markedSeen} size={size - 8} />
            { markedSeen && <Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayGreen} size={size} />}
            { !markedSeen && <Icon type='ionicon' name='ellipse-outline' color={'white'} size={size} />}
        </MarkSeenButtonContainer>
        </View>
    );
}
