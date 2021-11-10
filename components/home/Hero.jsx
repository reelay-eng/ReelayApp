import React, { useContext } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';
import Sidebar from './Sidebar';
import { FeedContext } from '../../context/FeedContext';

const { height, width } = Dimensions.get('window');

export default Hero = ({ 
    index, 
    isPaused,
    navigation,
    reelay,
    playPause,
    setIsPaused,
    viewable,
}) => {
    const Gradient = styled(LinearGradient)`
        height: ${height}px;
        justify-content: space-between;
        position: absolute;
        top: 0;
        left: 0;
        width: ${width}px;
        z-index: 1;
    `
    const Overlay = styled(Pressable)`
        flex-direction: row;
        justify-content: space-between;
        width: ${width}px;
        height: ${height}px;
    `
    const { 
        overlayVisible,
        setOverlayData,
        setOverlayVisible,
    } = useContext(FeedContext);

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

    console.log(`Rendering hero ${reelay.title.display} at position ${index}, paused? ${isPaused}, viewable? ${viewable}`);

    return (
        <View key={index}>
            <FeedVideoPlayer viewable={viewable} reelay={reelay} isPaused={isPaused} />
            <Gradient locations={[0, 0.26, 0.6, 1]} colors={[
                    'rgba(26,26,26,0.6)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0)',
                    'rgba(26,26,26,0.6)',
            ]}>
                <Overlay onPress={playPause} onLongPress={setReelayOverlay}>
                    <ReelayInfo navigation={navigation} reelay={reelay} />
                    <Sidebar reelay={reelay} />
                </Overlay>
            </Gradient>
        </View>
    );
}