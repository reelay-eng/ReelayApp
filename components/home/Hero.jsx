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

    return (
        <View key={index} style={{ justifyContent: 'flex-end'}}>
            <FeedVideoPlayer viewable={viewable} reelay={reelay} isPaused={isPaused} playPause={playPause} />
            <ReelayInfo navigation={navigation} reelay={reelay} />
            <Sidebar reelay={reelay} />
        </View>
    );
}