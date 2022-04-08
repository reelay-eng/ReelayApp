import React, { useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { Video, Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

export default function VideoPlayer({ videoURI, playing }) {
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
	
	return (
		<Video
			isLooping
			isMuted={false}
			progressUpdateIntervalMillis={50}
			rate={1.0}
			resizeMode='cover'
			shouldDuckAndroid={true}
			shouldPlay={playing && isFocused}
			source={{ uri: videoURI }}
			staysActiveInBackground={false}
			style={{
				height: '100%',
				width: '100%',
				borderRadius: 12,
			}}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}