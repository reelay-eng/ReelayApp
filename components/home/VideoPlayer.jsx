import React, { useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import styled from 'styled-components/native';


const Play = styled(Video)`
	height: 100%;
`
const Poster = styled.ImageBackground`
	height: 100%;
`

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
		<Play
			interruptionModeAndroid={Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX}
			interruptionModeIOS={Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX}
			isLooping={false}
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
			useNativeControls={false}
			volume={1.0}
		/>
	);
}