import React, { useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import { VideoStyles } from '../../styles';
import { useFocusEffect } from '@react-navigation/native';

export default function VideoPlayer({ videoURI, poster, isPlay }) {
	const [playbackStatus, setPlaybackStatus] = useState({});
	const [playbackObject, setPlaybackObject] = useState(null);

	const [isFocused, setIsFocused] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

    useFocusEffect(React.useCallback(() => {
        setIsFocused(true);

        return () => {
			try {
				if (playbackObject && !isPlay) {
					const prom = playbackObject.setPositionAsync(0)
						.catch((error) => {
						// todo: this throws a seeking interrupted error
						// seems harmless, but I'm not sure
				});
				}
			} catch (error) {
				console.log(error);
			}
			setIsFocused(false);
		}
    }));

	const _handleVideoRef = (component) => {
		setPlaybackObject(component);
	}

	return (
			<Video
			interruptionModeAndroid={Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX}
			interruptionModeIOS={Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX}
			isLooping
			isMuted={false}
			playsInSilentLockedModeIOS={true}
			posterSource={poster}
			progressUpdateIntervalMillis={50}
			rate={1.0}
			ref={(component) => _handleVideoRef(component)}
			resizeMode='cover'
			shouldDuckAndroid={true}
			shouldPlay={isPlay && isFocused}
			source={{ uri: videoURI }}
			staysActiveInBackground={false}
            style={VideoStyles.video}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}