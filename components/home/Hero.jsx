import React, { useCallback, useContext, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

import FeedVideoPlayer from './FeedVideoPlayer';
import ReelayInfo from './ReelayInfo';

import { VisibilityContext } from '../../context/VisibilityContext';

const { height, width } = Dimensions.get('window');

const PlayPauseIcon = ({ type = 'play' }) => {
    const ICON_SIZE = 96;
    const IconContainer = styled(View)`
        position: absolute;
        left: ${(width - ICON_SIZE) / 2}px;
        opacity: 50;
        top: ${(height - ICON_SIZE) / 2}px;
        height: ${ICON_SIZE}px;
        width: ${ICON_SIZE}px;
    `
    
    return (
        <IconContainer>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
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

    const PLAY_PAUSE_ICON_TIMEOUT = 800;
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
    const [iconVisible, setIconVisible] = useState('none');

    const visibilityContext = useContext(VisibilityContext);
    const reelay = stack[stackIndex];
    const isPlaying = (feedIndex === feedPosition)
                    && (stackIndex === stackPosition)
                    && (!visibilityContext.overlayVisible);

    const playPause = () => {
        if (isPaused) {
            setIsPaused(false);
            setIconVisible('pause');
            setTimeout(() => {
                setIconVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    
        } else {
            setIsPaused(true);
            setIconVisible('play');
            setTimeout(() => {
                if (iconVisible === 'play') {
                    setIconVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);    
        }
    }

    const setReelayOverlay = (e) => {
        console.log('setting reelay overlay');
        if (!visibilityContext.overlayVisible) {
            visibilityContext.setOverlayData({
                type: 'REELAY',
                reelay: reelay,
            });
            visibilityContext.setOverlayVisible(true);
            setIsPaused(true);
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
                    { iconVisible !== 'none' && <PlayPauseIcon type={iconVisible} /> }
                </Overlay>
            </Gradient>
        </View>
    );
}