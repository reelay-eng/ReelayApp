import React, { useContext, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

import { 
    acceptRecommendation, 
    ignoreRecommendation, 
    markWatchlistItemSeen,
    markWatchlistItemUnseen, 
    removeFromMyWatchlist,
} from '../../api/WatchlistApi';

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default WatchlistSwipeableRow = ({ category, children, navigation, onRefresh, watchlistItem }) => {
    const ICON_SIZE = 30;
    const swipeableRowRef = useRef();
    const { cognitoUser } = useContext(AuthContext);
    const { recommendedBySub, tmdbTitleID, titleType } = watchlistItem;

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
        const result = await acceptRecommendation({
            recommendedBySub,
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID: tmdbTitleID,
            titleType: titleType,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const advanceToCreateScreen = () => {
        navigation.navigate('VenueSelectScreen', {
            titleObj: watchlistItem.title
        });
    };

    const advanceToRecommendScreen = () => {

    };

    const ignoreRecommendedItem = async () => {
        const result = await ignoreRecommendation({
            recommendedBySub,
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID,
            titleType,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const markItemAsSeen = async () => {
        const result = await markWatchlistItemSeen({
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID,
            titleType,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const markItemAsUnseen = async () => {
        const result = await markWatchlistItemUnseen({
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID,
            titleType,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const removeItemFromWatchlist = async () => {
        const result = await removeFromMyWatchlist({
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID,
            titleType,
        });

        // todo: update and reload watchlist in memory
        close();
        await onRefresh();
        console.log(result);
    };

    const renderRightActions = (progress) => (
        <View style={{ width: 192, flexDirection: 'row' }}>
            { (category === 'My List') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 192, progress) }
            { (category === 'My List') && renderRightAction(markItemAsSeen, 'Seen', 'checkmark-circle', '#2977ef', 96, progress) }

            { (category === 'Seen') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 192, progress) }
            { (category === 'Seen') && renderRightAction(advanceToRecommendScreen, 'Send Rec', 'paper-plane', '#2977ef', 96, progress) }

            { (category === 'Recs') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 192, progress) }
            { (category === 'Recs') && renderRightAction(acceptRecommendedItem, 'Accept Rec', 'checkmark-circle', '#2977ef', 96, progress) }
        </View>
    );

    const updateRef = (ref) => {
        swipeableRowRef.current = ref;
    };

    const close = () => {
        swipeableRowRef.current.close();
    };

    return (
        <Swipeable
            ref={updateRef}
            friction={2}
            leftThreshold={30}
            rightThreshold={40}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}>
            { children }
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    leftAction: {
        alignItems: 'center',
        backgroundColor: '#497AFC',
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
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
    },
});
