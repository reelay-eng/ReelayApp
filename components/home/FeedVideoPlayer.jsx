import React, { memo, useContext, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

import * as Amplitude from 'expo-analytics-amplitude';

export default memo(function FeedVideoPlayer({ 
	// paused,
	playing, 
	playingButPaused,
	reelay, 
 }) {
	const [isFocused, setIsFocused] = useState(false);
	const [playbackObject, setPlaybackObject] = useState(null);

	const authContext = useContext(AuthContext);
	const playheadCounter = useRef(0);

	const [loadCounter, setLoadCounter] = useState(0);
	const loadStatus = useRef(0);

	const shouldPlay = playing && isFocused && !playingButPaused;

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

    useFocusEffect(React.useCallback(() => {
		if (playing) setIsFocused(true);
        return () => {
			if (playing) setIsFocused(false);
		}
    }));

	const onLoad = async (playbackStatus) => {
		// if (playing) {
		// 	console.log(reelay.title, ' just finished loading');
		// 	Amplitude.logEventWithPropertiesAsync('reelayFinishedLoading', {
		// 		username: authContext.user.username,
		// 		reelayID: reelay.id,
		// 		reelayCreator: reelay.creator.username,
		// 		title: reelay.title,
		// 	})
		// }
		loadStatus.current = 2;
		console.log('on load FINISH for ', reelay.title, reelay.creator.username);
	}

	const onLoadStart = async (playbackStatus) => {
		// if (playing) {
		// 	console.log(reelay.title, ' just started loading');
		// 	Amplitude.logEventWithPropertiesAsync('reelayStartedLoading', {
		// 		username: authContext.user.username,
		// 		reelayID: reelay.id,
		// 		reelayCreator: reelay.creator.username,
		// 		title: reelay.title,
		// 	})
		// }
		loadStatus.current = 1;
		console.log('on load START for ', reelay.title, reelay.creator.username);
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (playbackStatus?.didJustFinish && playing) {
			Amplitude.logEventWithPropertiesAsync('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title,
				username: authContext.user.username,
			})
		}
	}

	// console.log('Video for ', reelay.title, reelay.creator.username, ' is rendering');
	// if (playing) {
	// 	console.log('video URI: ', reelay.videoURI);
	// 	console.log('focused: ', isFocused);
	// 	console.log('should play? ', playing, isFocused, !playingButPaused);
	// }

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