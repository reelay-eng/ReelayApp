import React, { useContext, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { acceptRecommendation, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default WatchlistSwipeableRow = ({ children, navigation, category, watchlistItem }) => {
    const ICON_SIZE = 30;
    const swipeableRowRef = useRef();
    const { cognitoUser } = useContext(AuthContext);

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

        return (
            <RectButton style={styles.leftAction} onPress={
                (category === 'Recs') ? ignoreRecommendation : removeFromWatchlist
            }>
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
                height: '100%', 
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

    const acceptRecommendationAction = async () => {
        const { recommendedBySub, tmdbTitleID, titleType } = watchlistItem;
        const result = await acceptRecommendation({
            recommendedBySub,
            reqUserSub: cognitoUser?.attributes?.sub,
            tmdbTitleID,
            titleType,
        });

        // todo: update and reload watchlist in memory
        console.log(result);
    };

    const advanceToCreateScreen = () => {
        navigation.navigate('VenueSelectScreen', {
            titleObj: watchlistItem.title
        });
    };

    const advanceToRecommendScreen = () => {};
    const ignoreRecommendation = () => {};
    const markAsSeen = () => {};
    const markAsUnseen = () => {};
    const removeFromWatchlist = () => {};

    const renderRightActions = (progress) => (
        <View style={{ width: 192, flexDirection: 'row' }}>
            {/* { (category === 'My List') && renderRightAction(removeFromWatchlist, 'Remove', 'remove-circle', '#1a1a1a', 192, progress) } */}
            { (category === 'My List') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 128, progress) }
            { (category === 'My List') && renderRightAction(markAsSeen, 'Seen', 'checkmark-circle', '#2977ef', 64, progress) }

            {/* { (category === 'Seen') && renderRightAction(removeFromWatchlist, 'Remove', 'remove-circle', '#1a1a1a', 192, progress) } */}
            { (category === 'Seen') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 192, progress) }
            { (category === 'Seen') && renderRightAction(advanceToRecommendScreen, 'Send Rec', 'paper-plane', '#2977ef', 96, progress) }

            {/* { (category === 'Recs') && renderRightAction(ignoreRecommendation, 'Ignore', 'remove-circle', '#1a1a1a', 192, progress) } */}
            { (category === 'Recs') && renderRightAction(advanceToCreateScreen, 'Create', 'add-circle', '#e8362a', 128, progress) }
            { (category === 'Recs') && renderRightAction(acceptRecommendationAction, 'Accept Rec', 'checkmark-circle', '#2977ef', 64, progress) }
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
        flex: 1,
        backgroundColor: '#497AFC',
        borderRadius: 6,
        borderColor: 'black',
        borderWidth: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'transparent',
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
