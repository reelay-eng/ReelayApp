import React, { useContext, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

import { showMessageToast } from '../utils/toasts';
import { hideNotification } from '../../api/NotificationsApi';

const SwipeColors = {
    RED: '#FE4747',
    BLUE: '#2977EF',
    GREEN: '#04BD6C',
}

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default NotificationSwipeableRow = ({ children, notificationID, onRefresh }) => {
    const ICON_SIZE = 30;
    const swipeableRowRef = useRef();
    const { cognitoUser } = useContext(AuthContext);
    const { width } = Dimensions.get('window');

    const RightActionButtonText = styled(ReelayText.Body2)`
        color: white;
        margin: 10px;
    `

    const renderRightAction = (onPress, iconName, color, x, progress) => {
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
                </RectButton>
            </Animated.View>
        );
    };

    const hideNotificationItem = async () => {
        const result = await hideNotification(notificationID);
        console.log(result);
        showMessageToast('Activity hidden');
        close();
        await onRefresh();
    };

    const renderRightActions = (progress) => (
        <View style={{ width: 72, flexDirection: 'row' }}>
            { renderRightAction(hideNotificationItem, 'eye-off', SwipeColors.RED, 72, progress) }
        </View>
    );

    const updateRef = (ref) => {
        swipeableRowRef.current = ref;
    };

    const close = () => {
        swipeableRowRef.current.close();
    };

    return (
        <Swipeable containerStyle={{ width }}
            ref={updateRef}
            friction={2}
            rightThreshold={20}
            renderRightActions={renderRightActions}>
            { children }
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    actionText: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 16,
        padding: 10,
    },
    rightAction: {
        alignItems: 'center',
        borderColor: 'black',
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        flex: 1,
        marginTop: 6,
        marginBottom: 6,
    },
});
