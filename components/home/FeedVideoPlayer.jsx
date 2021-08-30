import React, { useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

export default function FeedVideoPlayer({ 
	playing, 
	reelay, 
	shouldResetPlayhead,
 }) {
	const [playbackObject, setPlaybackObject] = useState(null);
	const [isFocused, setIsFocused] = useState(false);

	Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
		interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	});

	const _handleVideoRef = async (component) => {
		const playbackObject = component;
		setPlaybackObject(playbackObject);
		if (playbackObject && shouldResetPlayhead) {
			try {
				playbackObject.setPositionAsync(0);
			} catch (e) {
				console.log(e);
			}
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


	return (
		<Video
			isLooping={true}
			isMuted={false}
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