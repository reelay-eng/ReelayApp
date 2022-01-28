import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager } from 'react-native';

import { RectButton, Swipeable } from 'react-native-gesture-handler';

export default WatchlistSwipeableRow = ({ children, navigation }) => {
    const swipeableRowRef = useRef();

    const renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        return (
            <RectButton style={styles.leftAction} onPress={close}>
                <Animated.Text style={[ styles.actionText ]}>
                    Archive
                </Animated.Text>
            </RectButton>
        );
    };

    const renderRightAction = (text, color, x, progress) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0],
        });
        const pressHandler = () => {
            close();
            alert(text);
        };
        return (
            <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
                <RectButton
                    style={[styles.rightAction, { backgroundColor: color }]}
                    onPress={pressHandler}>
                    <Text style={styles.actionText}>{text}</Text>
                </RectButton>
            </Animated.View>
        );
    };

    const renderRightActions = progress => (
        <View style={{ width: 192, flexDirection: I18nManager.isRTL? 'row-reverse' : 'row' }}>
            { renderRightAction('More', '#C8C7CD', 192, progress) }
            { renderRightAction('Flag', '#ffab00', 128, progress) }
            { renderRightAction('More', '#dd2c00', 64, progress) }
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
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'transparent',
        padding: 10,
    },
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
