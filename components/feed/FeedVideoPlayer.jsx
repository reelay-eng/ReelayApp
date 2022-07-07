import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
	const ICON_SIZE = 48;
	const IconContainer = styled(Pressable)`
		position: absolute;
		left: ${(width - ICON_SIZE) / 2}px;
		opacity: 50;
		top: ${(height - ICON_SIZE) / 2}px;
		height: ${ICON_SIZE}px;
		width: ${ICON_SIZE}px;
		zIndex: 3;
	`
    return (
        <IconContainer onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
    );
}

const ReelayVideo = ({ 
	onPlaybackStatusUpdate,
	shouldPlay,
	videoURI,
}) => {
	return (
		<Video
			isLooping={true}
			isMuted={false}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
			progressUpdateIntervalMillis={50}
			rate={1.0}
			resizeMode='cover'
			// shouldDuckAndroid={true}
			shouldPlay={shouldPlay}
			source={{ uri: videoURI }}
			// staysActiveInBackground={false}
			style={{ height, width }}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}

export default function FeedVideoPlayer({ reelay, viewable }) {
	const PLAY_PAUSE_ICON_TIMEOUT = 800;
	const [focused, setFocused] = useState(false);

	const { reelayDBUser } = useContext(AuthContext);
	const [paused, setPaused] = useState(false);
	const [finishedLoading, setFinishedLoading] = useState(false);
	const [playPauseVisible, setPlayPauseVisible] = useState(false);
	
	const shouldPlay = viewable && focused && finishedLoading && !paused;

	useEffect(() => {
		if (!viewable && paused) {
			setPaused(false);
			setPlayPauseVisible('none');
		}
	}, [viewable, paused, focused]);

    useFocusEffect(React.useCallback(() => {
		if (viewable) setFocused(true);
        return () => {
			if (viewable) setFocused(false);
		}
    }));

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (!finishedLoading && playbackStatus?.isLoaded) {
			setFinishedLoading(true);
		}
		if (playbackStatus?.didJustFinish && viewable) {
			logAmplitudeEventProd('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title.display,
				username: reelayDBUser?.username,
			})
		}
	}

	const onPlayPause = async () => {
		if (paused) {
            setPaused(false);
            setPlayPauseVisible('pause');
            setTimeout(() => {
                setPlayPauseVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    

            logAmplitudeEventProd('playVideo', {
                creatorName: reelay.creator.username,
                reelayID: reelay.id,
                reelayTitle: reelay.title.display,
                username: reelayDBUser?.username,
            });
		} else {
            setPaused(true);
            setPlayPauseVisible('play');
            setTimeout(() => {
                if (playPauseVisible === 'play') {
                    setPlayPauseVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   

            logAmplitudeEventProd('pauseVideo', {
                creatorName: reelay.creator.username,
                reelayID: reelay.id,
                reelayTitle: reelay.title.display,
                username: reelayDBUser?.username,
            });
		}
	}

	return (
		<Pressable onPress={onPlayPause}>
			<ReelayVideo 
				onPlaybackStatusUpdate={onPlaybackStatusUpdate}
				shouldPlay={shouldPlay} 
				videoURI={reelay?.content?.videoURI}
			/>
			{ playPauseVisible !== 'none' && (
				<PlayPauseIcon onPress={onPlayPause} type={playPauseVisible} />
			) }
		</Pressable>
	);
};