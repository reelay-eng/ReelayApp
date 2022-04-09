import React, { useRef, useState } from 'react';
import { Image, Pressable, SafeAreaView } from 'react-native';
import { Video, Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';

const PlayPausePressable = styled(Pressable)`
	position: absolute;
	height: 100%;
	width: 100%;
`
const PosterTitle = styled(Image)`
	border-radius: 4px;
	position: absolute;
	height: 120px;
	width: 80px;
	top: 40px;
	right: 20px;
`

export default PreviewVideoPlayer = ({ posterSource, videoURI }) => {
	const [isFocused, setIsFocused] = useState(false);
	const [playing, setPlaying] = useState(true);

	const playPause = () => playing ? setPlaying(false) : setPlaying(true);

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
		<PlayPausePressable onPress={playPause}>
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
			<PosterTitle source={posterSource} />
		</PlayPausePressable>
	);
}