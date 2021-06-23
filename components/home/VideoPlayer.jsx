import React, { useEffect, useRef, useState } from 'react'
import { Video, Audio } from 'expo-av'
import styled from 'styled-components/native';


const Play = styled(Video)`
	height: 100%;
`
const Poster = styled.ImageBackground`
	height: 100%;
`

export default function VideoPlayer({ navigation, videoURI, poster, isPlay }) {
	const video = useRef(null);
	const [playbackStatus, setPlaybackStatus] = useState({});

	useEffect(() => {
		const focusUnsubscribe = navigation.addListener('focus', () => {
			if (video && video.current && isPlay && !playbackStatus.isPlaying) {
				console.log('playing video');
				video.current.playAsync();
			}
		});
		const blurUnsubscribe = navigation.addListener('blur', () => {
			console.log('moving to other tab');
			if (video && video.current && isPlay && playbackStatus.isPlaying) {
				console.log('pausing video');
				video.current.pauseAsync();
			}
		});
		// return the cleanup function
		return () => {
			focusUnsubscribe();
			blurUnsubscribe();
		}
		// call useEffect only once
	}, []);

	const onPlaybackStatusUpdate = (status) => {
		setPlaybackStatus(status);
		
		if (status.didJustFinish) {
			console.log("Playback finished");
		}
	}

	return isPlay ? (
		<Play
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
			shouldPlay
			source={{uri: videoURI}}
			staysActiveInBackground={false}
			useNativeControls={false}
			volume={1.0}
		/>
	) : (
		<Poster source={poster} />
	)
}