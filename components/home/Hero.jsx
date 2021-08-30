import React, { useCallback, useContext, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import Poster from './Poster';
import ReelayInfo from './ReelayInfo';

import { VisibilityContext } from '../../context/VisibilityContext';

const { height, width } = Dimensions.get('window');

const StackLocation = ({ position, length }) => {
    const StackLocationOval = styled(View)`
        align-items: flex-end;
        align-self: flex-end;
        background-color: white;
        border-radius: 10px;
        justify-content: center;
        height: 20px;
        width: 50px;
        zIndex: 3;
    `
    const StackLocationText = styled(Text)`
        align-self: center;
        color: black;
        font-size: 14px;
        font-family: System;
    `
    const text = String(position + 1) + ' / ' + String(length);
    return (
        <StackLocationOval>
            <StackLocationText>{ text }</StackLocationText>
        </StackLocationOval>
    );
}

export default Hero = ({ 
    stack, 
    index, 
    isPaused,
    feedIndex,
    feedPosition, 
    setIsPaused,
    stackIndex,
    stackPosition,
}) => {

    const Gradient = styled(LinearGradient)`
        height: 100%;
        justify-content: space-between;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
    `
    const Overlay = styled(Pressable)`
        flex: 1;
        flex-direction: row;
        width: 100%;
        height: 100%;
    `
    const RightContainer = styled(View)`
        position: absolute;
        left: ${width - 130}px;
        top: 40px;
        zIndex: 3;
    `
    const visibilityContext = useContext(VisibilityContext);
    const reelay = stack[stackIndex];
    const isPlaying = (!isPaused)
                    && (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!visibilityContext.overlayVisible);

    const playPause = () => isPaused ? setIsPaused(false) : setIsPaused(true);

    if (isPlaying) {
        console.log(reelay.title, ' is playing');
    } else if ((feedIndex === feedPosition) && (stackIndex === stackPosition)) {
        console.log(reelay.title, ' is paused');
    }

    return (
        <View key={index}>
            <FeedVideoPlayer
                isLooping={stack.length === 1}
                playing={isPlaying}
                position={stackPosition}
                reelay={reelay}
            >
            </FeedVideoPlayer>
            <Gradient
                locations={[0, 0.26, 0.6, 1]}
                colors={[
                    'rgba(26,26,26,0.6)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0.6)'
                ]}>
                <Overlay onPress={playPause}>
                    <RightContainer>
                        <Poster reelay={reelay} showTitle={false} />
                        <StackLocation position={stackPosition} length={stack.length} />
                    </RightContainer>
                    <ReelayInfo reelay={reelay} />
                </Overlay>
            </Gradient>
        </View>
    );
}