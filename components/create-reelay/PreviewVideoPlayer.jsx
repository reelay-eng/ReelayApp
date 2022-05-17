import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Video, Audio } from 'expo-av'
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';

const PlayPausePressable = styled(Pressable)`
	position: absolute;
	height: 100%;
	width: 100%;
`
const TitlePosterContainer = styled(View)`
	position: absolute;
	top: 40px;
	right: 20px;
`

export default PreviewVideoPlayer = ({ isMuted, title, videoURI }) => {
	const [playing, setPlaying] = useState(true);
	const playPause = () => setPlaying(!playing);

	Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
		interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
	})
	
	return (
		<PlayPausePressable onPress={playPause}>
			<Video
				isLooping
				isMuted={isMuted}
				progressUpdateIntervalMillis={50}
				rate={1.0}
				resizeMode='cover'
				shouldDuckAndroid={true}
				shouldPlay={playing}
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
			<TitlePosterContainer>
				<TitlePoster title={title} width={80} />
			</TitlePosterContainer>
		</PlayPausePressable>
	);
}