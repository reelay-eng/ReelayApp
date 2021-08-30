import React, { useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

export default function FeedVideoPlayer({ 
	isLooping,
	reelay, 
	playing, 
	position,
	onReelayFinish,
 }) {
	const [playbackObject, setPlaybackObject] = useState(null);
	const [isFocused, setIsFocused] = useState(false);

	Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
		interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	})

    useFocusEffect(React.useCallback(() => {
		setIsFocused(true);
        return () => {
			setIsFocused(false);
		}
    }));

	const _handleVideoRef = async (component) => {
		const playbackObject = component;
		setPlaybackObject(playbackObject);
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (playbackStatus?.didJustFinish && !isLooping) {
			onReelayFinish(reelay, position);
		}
	}

	return (
			<Video
				isLooping={true}
				isMuted={false}
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