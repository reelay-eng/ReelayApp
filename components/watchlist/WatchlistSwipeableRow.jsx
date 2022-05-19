import React, { useContext, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

import { 
    acceptRecommendation, 
    getSentRecommendations, 
    ignoreRecommendation, 
    markWatchlistItemSeen,
    markWatchlistItemUnseen, 
    removeFromMyWatchlist,
} from '../../api/WatchlistApi';
import { notifyOnAcceptRec } from '../../api/WatchlistNotifications';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { showMessageToast } from '../utils/toasts';
import ReelayColors from '../../constants/ReelayColors';

const SwipeColors = {
    RED: '#FE4747',
    BLUE: '#2977EF',
    GREEN: '#04BD6C',
}

// alignItems: 'center',
// borderRadius: 12,
// flex: 1,
// justifyContent: 'center',
// marginTop: 10,
// marginBottom: 10,
// marginLeft: -10,


const RemoveButton = styled(RectButton)`
    align-items: center;
    background-color: ${ReelayColors.reelayRed};
    border-radius: 12px;
    flex: 1;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: -10px;
`

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default WatchlistSwipeableRow = ({ children, onRefresh, watchlistItem }) => {
    const ICON_SIZE = 30;
    const swipeableRowRef = useRef();
    const { reelayDBUser } = useContext(AuthContext);
    const { tmdbTitleID, titleType } = watchlistItem;

    const RightActionButtonText = styled(ReelayText.Body2)`
        position: absolute;
        color: white;
        bottom: 10px;
    `

    const markItemAsSeen = async () => {
        const result = await markWatchlistItemSeen({
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID,
            titleType,
        });
        showMessageToast('Marked as seen');

        logAmplitudeEventProd('markWatchlistItemSeen', {
            username: reelayDBUser?.username,
            title: watchlistItem.title.display,
            source: 'watchlist',
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const removeItemFromWatchlist = async () => {
        const result = await removeFromMyWatchlist({
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID,
            titleType,
        });
        showMessageToast('Removed from your watchlist');

        logAmplitudeEventProd('removeItemFromWatchlist', {
            username: reelayDBUser?.username,
            title: watchlistItem.title.display,
            source: 'watchlist',
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const renderRemoveButton = (progress) => (
        <View style={{ width: 96, flexDirection: 'row' }}>
            <Animated.View style={{ 
                flex: 1, 
                justifyContent: 'center',
                transform: [{ translateX: 0 }], 
            }}>
                <RemoveButton onPress={removeItemFromWatchlist}>
                    <Icon type='ionicon' name={'remove-circle'} color='white' size={ICON_SIZE} />
                    <RightActionButtonText>{'Remove'}</RightActionButtonText>
                </RemoveButton>
            </Animated.View>
        </View>
    );

    const updateRef = (ref) => swipeableRowRef.current = ref;
    const close = () => swipeableRowRef.current.close();

    return (
        <Swipeable ref={updateRef} friction={2} rightThreshold={20} renderRightActions={renderRemoveButton}>
            { children }
        </Swipeable>
    );
}
