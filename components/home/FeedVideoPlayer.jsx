import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

import { FeedContext } from '../../context/FeedContext';

import * as Amplitude from 'expo-analytics-amplitude';

export default function FeedVideoPlayer({ 
	viewable, 
	isPaused,
	reelay, 
 }) {

	// console.log('Video player rendering for ', reelay.title.display, viewable, isPaused, reelay.id);

	const [isFocused, setIsFocused] = useState(false);
	const [playbackObject, setPlaybackObject] = useState(null);

	const loadStatus = useRef(0);
	const playheadCounter = useRef(0);

	const { user } = useContext(AuthContext);
	const { overlayVisible } = useContext(FeedContext);
	
	const shouldPlay = viewable && isFocused && !isPaused && !overlayVisible;
	if (shouldPlay) console.log('This one ^^ should play');

	const _handleVideoRef = (component) => {
		const playbackObject = component;
		const wasPlayingOnLastRender = playheadCounter.current % 2 === 1;

		setPlaybackObject(playbackObject);
		if (!viewable && wasPlayingOnLastRender) {
			playheadCounter.current += 1;
			try {
				playbackObject.setPositionAsync(0);
			} catch (e) {
				console.log(e);
			}
		} else if (viewable && !wasPlayingOnLastRender) {
			// results in odd-numbered playhead counter
			playheadCounter.current += 1;
		}

		if (playheadCounter.current > 1 && loadStatus.current != 2) {
			console.log('video isn\'t loaded yet', reelay.title.display, reelay.creator.username);
		}
	
	}

	useEffect(() => {
		if (shouldPlay) playbackObject.playAsync();
	}, [viewable, isPaused, isFocused, overlayVisible]);

    useFocusEffect(React.useCallback(() => {
		if (viewable) setIsFocused(true);
        return () => {
			if (viewable) setIsFocused(false);
		}
    }));

	const onLoad = async (playbackStatus) => {
		loadStatus.current = 2;
	}

	const onLoadStart = async (playbackStatus) => {
		loadStatus.current = 1;
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (playbackStatus?.didJustFinish && viewable) {
			Amplitude.logEventWithPropertiesAsync('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title.display,
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
			source={{ uri: reelay.content.videoURI }}
			staysActiveInBackground={false}
			style={VideoStyles.video}
			useNativeControls={false}
			volume={1.0}
		/>
	);
};