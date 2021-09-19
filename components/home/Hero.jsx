import React, { useContext } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import CommentsDrawer from './CommentsDrawer';
import LikesDrawer from './LikesDrawer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { VisibilityContext } from '../../context/VisibilityContext';

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
    const { 
        overlayVisible,
        setOverlayData,
        setOverlayVisible,
    } = useContext(VisibilityContext);

    const isPlaying = (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!overlayVisible);
    const reelay = stack[stackIndex];

    const setReelayOverlay = (e) => {
        if (!overlayVisible) {
            setOverlayData({
                type: 'REELAY',
                reelay: reelay,
            });
            setOverlayVisible(true);
            setIsPaused(true);
        }
    }

    if (isPlaying) {
        console.log('hero is rendering');
    }

    return (
        <View key={index}>
            <FeedVideoPlayer playing={isPlaying} reelay={reelay} 
                        playingButPaused={isPlaying && isPaused} />
            <Gradient locations={[0, 0.26, 0.6, 1]} colors={[
                    'rgba(26,26,26,0.6)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0.6)',
            ]}>
                <Overlay onPress={playPause} onLongPress={setReelayOverlay}>
                    <ReelayInfo reelay={reelay} />
                    <Sidebar reelay={reelay} />
                </Overlay>
                <LikesDrawer reelay={reelay} />
                <CommentsDrawer reelay={reelay} />
            </Gradient>
        </View>
    );
}