import React, { useContext, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { AuthContext } from '../../context/AuthContext';

import { showMessageToast } from '../utils/toasts';
import { removeComment } from '../../api/ReelayDBApi';

const SwipeColors = {
    RED: '#FE4747',
    BLUE: '#2977EF',
    GREEN: '#04BD6C',
}

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default SwipeableComment = ({ children, commentItem }) => {
    const ICON_SIZE = 15;
    const swipeableRowRef = useRef();
    const { reelayDBUser } = useContext(AuthContext);
    console.log(commentItem)

    const removeCommentOnPress = async () => {
        console.log("removing comment");
        const removeCommentItem = await removeComment(commentItem.id);
        // show toast message
        showMessageToast('Comment has been deleted');
    }

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
    const renderRightActions = (progress) => (
        <View style={{ width: 60, height: 61, flexDirection: 'row', marginRight: 10 }}>
            { renderRightAction(removeCommentOnPress, 'trash-outline', SwipeColors.RED, 70, progress) }
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

    const openRight = () => {
        swipeableRowRef.current.openRight();
    }

    return (
        <Swipeable
            ref={updateRef}
            friction={2}
            leftThreshold={20}
            rightThreshold={20}
            renderRightActions={renderRightActions}>
            { children }
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    rightAction: {
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
});
