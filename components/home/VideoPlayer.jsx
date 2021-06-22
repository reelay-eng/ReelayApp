import React, { useRef, useState } from 'react';
import { Video, Audio } from 'expo-av';
import { VideoStyles } from '../../styles';

export default function VideoPlayer({ videoURI, poster, isPlaying }) {
	const video = useRef(null);
	const [playbackStatus, setPlaybackStatus] = useState({});

	const onPlaybackStatusUpdate = (status) => {
		setPlaybackStatus(status);
		
		if (status.didJustFinish) {
			console.log("Playback finished");
		}
	}

	return (
		<Video
			interruptionModeAndroid={Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX}
			interruptionModeIOS={Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX}
			isLooping
			isMuted={false}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
			playsInSilentLockedModeIOS={true}
			posterSource={poster}
			rate={1.0}
			ref={video}
			resizeMode='cover'
			shouldDuckAndroid={true}
			shouldPlay={isPlaying}
			source={{uri: videoURI}}
			staysActiveInBackground={false}
			style={VideoStyles.video}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}