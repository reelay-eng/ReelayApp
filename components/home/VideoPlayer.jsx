import React from 'react'
import { Video } from 'expo-av'
import styled from 'styled-components/native';


const Play = styled(Video)`
	height: 100%;
`
const Poster = styled.ImageBackground`
	height: 100%;
`

const VideoPlayer = ({ videoURI, poster, isPlay }) => {
	if (videoURI) {
		console.log("loading video player");
		console.log(videoURI);
		console.log(poster);	
	} else {
		console.log("bad source");
	}
	return isPlay ? (
		<Play
			rate={1.0}
			volume={1.0}
			isMuted={false}
			shouldPlay
			useNativeControls={false}
			posterSource={poster}
			source={{uri: videoURI}}
			resizeMode='cover'
		/>
	) : (
		<Poster source={poster} />
	)
}

export default VideoPlayer;