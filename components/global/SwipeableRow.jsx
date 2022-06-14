import React, { useContext, useRef } from 'react';
import { Animated, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';

const RightAction = styled(RectButton)`
    align-items: center;
    background-color: ${props => props.backgroundColor};
    border-radius: 8px;
    flex: 1;
    flex-direction: row;
    justify-content: center;
    margin: 6px;
    margin-left: -6px;
`
const RightActionContainer = styled(View)`
    flex-direction: row;
    margin-right: 10px;
    width: 80px;
`

// https://snack.expo.dev/@adamgrzybowski/react-native-gesture-handler-demo
export default SwipeableRow = ({ children, buttonColor, onPress, renderIcon }) => {
    const backgroundColor = buttonColor ?? ReelayColors.reelayRed;
    const swipeableRowRef = useRef();

    const renderRightAction = (x, progress) => {
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
                <RightAction backgroundColor={backgroundColor} onPress={onPress}>
                    { renderIcon() }
                </RightAction>
            </Animated.View>
        );
    };

    const renderRightActions = (progress) => (
        <RightActionContainer>
            { renderRightAction(50, progress) }
        </RightActionContainer>
    );

    const updateRef = (ref) => {
        swipeableRowRef.current = ref;
    };

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