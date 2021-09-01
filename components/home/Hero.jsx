import React, { useCallback, useContext, useState } from 'react'
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import Poster from './Poster';
import ReelayInfo from './ReelayInfo';

import { VisibilityContext } from '../../context/VisibilityContext';

const { height, width } = Dimensions.get('window');

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
    const visibilityContext = useContext(VisibilityContext);
    const reelay = stack[stackIndex];
    const isPlaying = (!isPaused)
                    && (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!visibilityContext.overlayVisible);

    const shouldResetPlayhead = (feedIndex !== feedPosition) 
                    || (stackIndex !== stackPosition);

    const playPause = () => isPaused ? setIsPaused(false) : setIsPaused(true);
    const setReelayOverlay = (e) => {
        console.log('setting reelay overlay');
        if (!visibilityContext.overlayVisible) {
            visibilityContext.setOverlayData({
                type: 'REELAY',
                reelay: reelay,
            });
            visibilityContext.setOverlayVisible(true);
        }
    }

    if (isPlaying) {
        console.log(reelay.title, ' is playing');
    } else if ((feedIndex === feedPosition) && (stackIndex === stackPosition)) {
        console.log(reelay.title, ' is paused');
    }

    return (
        <View key={index}>
            <FeedVideoPlayer
                playing={isPlaying}
                reelay={reelay}
                shouldResetPlayhead={shouldResetPlayhead}
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
                <Overlay onPress={playPause} onLongPress={setReelayOverlay}>
                    <ReelayInfo reelay={reelay} />
                </Overlay>
            </Gradient>
        </View>
    );
}