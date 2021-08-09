import React, { useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

export default function VideoPlayer({ videoURI, playing }) {
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
			// try {
			// 	if (playbackObject && !playing) {
			// 		const prom = playbackObject.setPositionAsync(0)
			// 			.catch((error) => {
			// 			// todo: this throws a seeking interrupted error
			// 			// seems harmless, but I'm not sure
			// 		});
			// 	}
			// } catch (error) {
			// 	console.log(error);
			// }
			setIsFocused(false);
		}
    }));

	const _handleVideoRef = async (component) => {
		const playbackObject = component;
		setPlaybackObject(playbackObject);
	}

	return (
			<Video
				// interruptionModeAndroid={Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX}
				// interruptionModeIOS={Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX}
				isLooping
				isMuted={false}
				// playsInSilentModeIOS={true}
				progressUpdateIntervalMillis={50}
				rate={1.0}
				ref={(component) => _handleVideoRef(component)}
				resizeMode='cover'
				shouldDuckAndroid={true}
				shouldPlay={playing && isFocused}
				source={{ uri: videoURI }}
				staysActiveInBackground={false}
				style={VideoStyles.video}
				useNativeControls={false}
				volume={1.0}
			/>
	);
}