import React, { useContext, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

import * as Amplitude from 'expo-analytics-amplitude';

export default function FeedVideoPlayer({ 
	paused,
	playing, 
	reelay, 
	shouldResetPlayhead,
 }) {
	const [isFocused, setIsFocused] = useState(false);
	const [playbackObject, setPlaybackObject] = useState(null);

	const authContext = useContext(AuthContext);
	const playheadCounter = useRef(0);

	Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
		interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	});

	const _handleVideoRef = (component) => {
		const playbackObject = component;
		const wasPlayingOnLastRender = playheadCounter.current % 2 === 1;

		setPlaybackObject(playbackObject);
		if (!paused && !playing && wasPlayingOnLastRender) {
			// results in even-numbered playback counter
			playheadCounter.current += 1;
			try {
				// TODO: and not paused
				playbackObject.setPositionAsync(0);
			} catch (e) {
				console.log(e);
			}
		} else if (!paused && playing && !wasPlayingOnLastRender) {
			// results in odd-numbered playhead counter
			playheadCounter.current += 1;
		}
	}

    useFocusEffect(React.useCallback(() => {
		setIsFocused(true);
        return () => {
			setIsFocused(false);
			if (playbackObject && shouldResetPlayhead) {
				try {
					playbackObject.setPositionAsync(0);
				} catch (e) {
					console.log(e);
				}
			}
		}
    }));

	const onLoad = async () => {
		if (playing) {
			console.log(reelay.title, ' just finished loading');
			Amplitude.logEventWithPropertiesAsync('reelayFinishedLoading', {
				username: authContext.user.username,
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title,
			})
		}
	}

	const onLoadStart = async () => {
		if (playing) {
			console.log(reelay.title, ' just started loading');
			Amplitude.logEventWithPropertiesAsync('reelayStartedLoading', {
				username: authContext.user.username,
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title,
			})
		}
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
			shouldPlay={playing && isFocused}
			source={{ uri: reelay.videoURI }}
			staysActiveInBackground={false}
			style={VideoStyles.video}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}