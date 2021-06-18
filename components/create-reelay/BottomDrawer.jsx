import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Text, View } from 'react-native';
import styled from 'styled-components/native';

import SearchField from './SearchField';
import SearchResults from './SearchResults';
import { TagMovieDoneButton, TagMovieBackButton } from './TagMovieNavButtons';

const HorizontalLine = styled(View)`
    margin: 0px 0px 15px 0px;
    height: 1px;
    width: 100%;
    background-color: #D3D3D3
`;

const NavButtonContainer = styled(View)`
    height: 30px;
    width: 100%;
    flex: 0.2;
    flex-direction: row;
    justify-content: space-between;
`

const BottomDrawer = () => {
    // code and comments from Johanna Wad, adapted from TS to JSX
    // https://dev.to/johannawad/creating-a-swipe-up-bottom-drawer-in-react-native-no-external-libraries-3ng1

    const { height } = Dimensions.get('window');
    const DrawerPosition = {
        Open: height - 230,
        Peek: 230,
        Closed: 0
    }

    const y = useRef(new Animated.Value(DrawerPosition.Closed)).current;
    const drawerPos = useRef(new Animated.Value(DrawerPosition.Closed)).current;
    const margin = 0.05 * height;
    const moveDist = (moveY) => height - moveY;

    const animateMove = (y, toValue, callback=null) => {
        Animated.spring(y, {
            toValue: -toValue,
            tension: 20,
            useNativeDriver: true,
        }).start((finished) => {
            /* Optional: But the purpose is to call this after the the animation has finished. Eg. Fire an event that will be listened to by the parent component */
            finished && callback && callback();
        });
    };

    const getNextPosition = (currentPos, distance, margin) => {
        switch (currentPos) {
            case DrawerPosition.Peek:
                return distance >= currentPos + margin
                    ? DrawerPosition.Open
                    : distance <= DrawerPosition.Peek - margin
                    ? DrawerPosition.Closed
                    : DrawerPosition.Peek;
            case DrawerPosition.Open:
                return distance >= currentPos
                    ? DrawerPosition.Open
                    : distance <= DrawerPosition.Peek
                    ? DrawerPosition.Closed
                    : DrawerPosition.Peek;
            case DrawerPosition.Closed:
                return distance >= currentPos + margin
                    ? distance <= DrawerPosition.Peek + margin
                    ? DrawerPosition.Peek
                    : DrawerPosition.Open
                    : DrawerPosition.Closed;
            default:
                return currentPos;
        }
    };      
      
    /* This event is triggered when the animated view is moving. We want the user to be able to drag/swipe up or down and the drawer should move simultaneously. */
    const onPanResponderMove = (_, { moveY }) => {
        const distance = moveDist(moveY);
        animateMove(y, distance);
    };

    /* Here is where we snap the drawer to the desired state - open, peek or closed */
    const onPanResponderRelease = (_, { moveY }) => {
        const distance = moveDist(moveY);
        const nextPos = getNextPosition(drawerPos._value, distance, margin);
        drawerPos.setValue(nextPos);
        animateMove(y, nextPos);
    };

    /* This determines if the responder should do something. In this scenario, it is set to true when the distance moved by Y is greater than or equal to 10, or lesser than or equal to -10. */
    const onMoveShouldSetPanResponder = (_, { dy }) => Math.abs(dy) >= 10;

    /* Here we're creating a panResponder object and assigning th event handlers to it. */
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder,
            onStartShouldSetPanResponderCapture: onMoveShouldSetPanResponder,
            onPanResponderMove,
            onPanResponderRelease,
        }),
    ).current;

    return (
        <Animated.View
          style={[{
                width: '100%',
                height: height,
                backgroundColor: '#fff',
                borderRadius: 25,
                position: 'absolute',
                bottom: -height + 30,
                /* Refers to y variable which changes as the user performs a gesture */
                transform: [{ translateY: y }],
            },
          ]} 
          {...panResponder.panHandlers}>
                <NavButtonContainer>
                    <TagMovieBackButton />
                    <TagMovieDoneButton />
                </NavButtonContainer>
                <HorizontalLine />
                <SearchField />
                <SearchResults />
        </Animated.View>
      ); 
}

export default BottomDrawer;