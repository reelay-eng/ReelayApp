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

const SwipeColors = {
    RED: '#FE4747',
    BLUE: '#2977EF',
    GREEN: '#04BD6C',
}

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default WatchlistSwipeableRow = ({ category, children, navigation, onRefresh, watchlistItem }) => {
    const ICON_SIZE = 30;
    const swipeableRowRef = useRef();
    const { reelayDBUser } = useContext(AuthContext);
    const { recommendedBySub, recommendedByUsername, tmdbTitleID, titleType } = watchlistItem;

    const LeftActionButtonText = styled(ReelayText.Body2)`
        color: white;
        margin-left: 10px;
    `
    const RightActionButtonText = styled(ReelayText.Body2)`
        position: absolute;
        color: white;
        bottom: 10px;
    `

    const renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        const onPress = (category === 'Recs') ? ignoreRecommendedItem : removeItemFromWatchlist;

        return (
            <RectButton style={styles.leftAction} onPress={onPress}>
                <Icon type='ionicon' name={'remove-circle'} color='white' size={ICON_SIZE} />
                <LeftActionButtonText>{(category === 'Recs' ? 'Ignore' : 'Remove')}</LeftActionButtonText>
            </RectButton>
        );
    };

    const renderRightAction = (onPress, actionName, iconName, color, x, progress) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0],
        });

        return (
            <Animated.View style={{ 
                flex: 1, 
                justifyContent: 'center',
                transform: [{ translateX: 0 }], 
            }}>
                <RectButton
                    style={[styles.rightAction, { backgroundColor: color }]}
                    onPress={onPress}>
                    <Icon type='ionicon' name={iconName} color='white' size={ICON_SIZE} />
                    <RightActionButtonText>{actionName}</RightActionButtonText>
                </RectButton>
            </Animated.View>
        );
    };

    const acceptRecommendedItem = async () => {
        const dbResult = await acceptRecommendation({
            recommendedBySub,
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID,
            titleType,
        });
        showMessageToast(`${watchlistItem.title.display} added to your watchlist`);

        const notifyResult = await notifyOnAcceptRec({
            acceptUserSub: reelayDBUser?.sub,
            acceptUsername: reelayDBUser?.username,
            recUserSub: recommendedBySub,
            watchlistItem,
        });

        logAmplitudeEventProd('acceptRec', {
            username: reelayDBUser?.username,
            recommendedByUsername,
            title: watchlistItem.title.display,
            source: 'watchlist',
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(dbResult);
        console.log(notifyResult);
    };

    const advanceToCreateScreen = () => {
        navigation.navigate('VenueSelectScreen', {
            titleObj: watchlistItem.title
        });

        logAmplitudeEventProd('advanceToCreateReelay', {
            username: reelayDBUser?.username,
            title: watchlistItem.title.display,
            source: 'watchlist',
            watchlistCategory: category,
        });
    };

    const advanceToRecommendScreen = async () => {
        navigation.push('SendRecScreen', {
            watchlistItem: watchlistItem,
        });

        logAmplitudeEventProd('advanceToSendRec', {
            username: reelayDBUser?.username,
            title: watchlistItem.title.display,
            source: 'watchlist',
        });
    };

    const ignoreRecommendedItem = async () => {
        const result = await ignoreRecommendation({
            recommendedBySub,
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID,
            titleType,
        });
        showMessageToast('Removed from your recs. The sender won\'t be notified');

        logAmplitudeEventProd('ignoreRec', {
            username: reelayDBUser?.username,
            title: watchlistItem.title.display,
            recommendedByUsername,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

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

    const markItemAsUnseen = async () => {
        const result = await markWatchlistItemUnseen({
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID,
            titleType,
        });

        logAmplitudeEventProd('markWatchlistItemUnseen', {
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

    const renderRightActions = (progress) => (
        <View style={{ width: 192, flexDirection: 'row' }}>
            { (category === 'My List') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', SwipeColors.BLUE, 192, progress) }
            { (category === 'My List') && renderRightAction(markItemAsSeen, 'Seen', 'checkmark-circle', SwipeColors.GREEN, 96, progress) }

            { (category === 'Seen') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', SwipeColors.BLUE, 192, progress) }
            { (category === 'Seen') && renderRightAction(advanceToRecommendScreen, 'Send Rec', 'paper-plane', SwipeColors.GREEN, 96, progress) }

            { (category === 'Recs') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', SwipeColors.BLUE, 192, progress) }
            { (category === 'Recs') && renderRightAction(acceptRecommendedItem, 'Accept Rec', 'checkmark-circle', SwipeColors.GREEN, 96, progress) }
        </View>
    );

    const updateRef = (ref) => {
        swipeableRowRef.current = ref;
    };

    const close = () => {
        swipeableRowRef.current.close();
    };

    // const openLeft = () => {
    //     swipeableRowRef.current.openLeft();
    // }

    // const openRight = () => {
    //     swipeableRowRef.current.openRight();
    // }

    return (
        <Swipeable
            ref={updateRef}
            friction={2}
            leftThreshold={20}
            rightThreshold={20}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}>
            { children }
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    leftAction: {
        alignItems: 'center',
        backgroundColor: SwipeColors.RED,
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    actionText: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 16,
        padding: 10,
    },
    rightAction: {
        alignItems: 'center',
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
});
