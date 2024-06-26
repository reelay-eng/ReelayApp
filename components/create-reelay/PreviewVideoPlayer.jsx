import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Video, Audio } from 'expo-av'
import styled from 'styled-components/native';
import { firebaseCrashlyticsError, firebaseCrashlyticsLog } from '../utils/EventLogger';

const PlayPausePressable = styled(Pressable)`
	position: absolute;
	height: 100%;
	width: 100%;
`
export default PreviewVideoPlayer = ({ isMuted, title, videoURI }) => {
	try {
		firebaseCrashlyticsLog('Preview video player');
		const [playing, setPlaying] = useState(true);
		const playPause = () => setPlaying(!playing);

		return (
			<PlayPausePressable onPress={playPause}>
				<Video
					isLooping
					isMuted={isMuted}
					progressUpdateIntervalMillis={50}
					rate={1.0}
					resizeMode='cover'
					shouldPlay={playing}
					source={{ uri: videoURI }}
					style={{
						height: '100%',
						width: '100%',
					}}
					useNativeControls={false}
					volume={1.0}
				/>
			</PlayPausePressable>
		);
	} catch (error) {
		firebaseCrashlyticsError(error);
	}
}