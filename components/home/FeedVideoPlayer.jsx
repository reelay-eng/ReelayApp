import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

import { VisibilityContext } from '../../context/VisibilityContext';

import * as Amplitude from 'expo-analytics-amplitude';

export default memo(function FeedVideoPlayer({ 
	// paused,
	playing, 
	playingButPaused,
	reelay, 
 }) {
	const [isFocused, setIsFocused] = useState(false);
	const [playbackObject, setPlaybackObject] = useState(null);

	const loadStatus = useRef(0);
	const playheadCounter = useRef(0);

	const { user } = useContext(AuthContext);
	const { overlayVisible } = useContext(VisibilityContext);
	
	const shouldPlay = playing && isFocused && !playingButPaused && !overlayVisible;

	Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
		interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	});

	const _handleVideoRef = (component) => {
		const playbackObject = component;
		const wasPlayingOnLastRender = playheadCounter.current % 2 === 1;

		setPlaybackObject(playbackObject);
		if (!playing && wasPlayingOnLastRender) {
			// results in even-numbered playback counter
			playheadCounter.current += 1;
			try {
				// TODO: and not paused
				playbackObject.setPositionAsync(0);
			} catch (e) {
				console.log(e);
			}
		} else if (playing && !wasPlayingOnLastRender) {
			// results in odd-numbered playhead counter
			// console.log(playheadCounter.current, 'Playing video uri: ', reelay.videoURI);
			playheadCounter.current += 1;
		}

		if (playheadCounter.current > 1 && loadStatus.current != 2) {
			console.log('video isn\'t loaded yet', reelay.title, reelay.creator.username);
		}
	
	}

	useEffect(() => {
		if (shouldPlay) playbackObject.playAsync();
	}, [playing, playingButPaused, isFocused, overlayVisible]);

    useFocusEffect(React.useCallback(() => {
		if (playing) setIsFocused(true);
        return () => {
			if (playing) setIsFocused(false);
		}
    }));

	const onLoad = async (playbackStatus) => {
		loadStatus.current = 2;
		// console.log('on load FINISH for ', reelay.title, reelay.creator.username);
	}

	const onLoadStart = async (playbackStatus) => {
		loadStatus.current = 1;
		// console.log('on load START for ', reelay.title, reelay.creator.username);
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (playbackStatus?.didJustFinish && playing) {
			Amplitude.logEventWithPropertiesAsync('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title,
				username: user.username,
			})
		}
	}

	return (
		<Video
			isLooping={true}
			isMuted={false}
			onLoad={onLoad}
			onLoadStart={onLoadStart}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
			progressUpdateIntervalMillis={50}
			rate={1.0}
			ref={(component) => _handleVideoRef(component)}
			resizeMode='cover'
			shouldDuckAndroid={true}
			shouldPlay={shouldPlay}
			source={{ uri: reelay.videoURI }}
			staysActiveInBackground={false}
			style={VideoStyles.video}
			useNativeControls={false}
			volume={1.0}
		/>
	);
});