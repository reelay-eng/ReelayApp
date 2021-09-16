import React, { useCallback, useContext, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { VisibilityContext } from '../../context/VisibilityContext';

const { height, width } = Dimensions.get('window');

export default Hero = ({ 
    index, 
    isPaused,
    feedIndex,
    feedPosition, 
    playPause,
    setIsPaused,
    stack,
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
    const isPlaying = (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!visibilityContext.overlayVisible);

    if (isPlaying) {
        console.log('PLAYING HERO IS RENDERING: ', reelay.title, reelay.creator.username);
        console.log('Feed position: ', feedPosition);
        console.log('Video URI: ', reelay.videoURI);
        console.log('Overlay visible? ', visibilityContext.overlayVisible);
    }

    const setReelayOverlay = (e) => {
        if (!visibilityContext.overlayVisible) {
            visibilityContext.setOverlayData({
                type: 'REELAY',
                reelay: reelay,
            });
            visibilityContext.setOverlayVisible(true);
            setIsPaused(true);
        }
    }

    return (
        <View key={index}>
            <FeedVideoPlayer
                playing={isPlaying}
                playingButPaused={isPlaying && isPaused}
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
                <Overlay onPress={playPause} onLongPress={setReelayOverlay}>
                    <ReelayInfo reelay={reelay} />
                    <Sidebar reelay={reelay} />
                </Overlay>
            </Gradient>
        </View>
    );
}