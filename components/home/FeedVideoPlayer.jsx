import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av';
import { Icon } from "react-native-elements";
import { useFocusEffect } from '@react-navigation/native';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from "styled-components/native";

const ICON_SIZE = 96;
const PLAY_PAUSE_ICON_TIMEOUT = 500;
const { height, width } = Dimensions.get("window");

const IconContainer = styled(Pressable)`
    position: absolute;
    left: ${(width - ICON_SIZE) / 2}px;
    opacity: 50;
    top: ${(height - ICON_SIZE) / 2}px;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
    zIndex: 3;
`

const PlayPauseIcon = ({ onPress, type = "play" }) => {
	return (
		<IconContainer onPress={onPress}>
			<Icon type="ionicon" name={type} color={"white"} size={48} />
		</IconContainer>
	);
	
};

export default function FeedVideoPlayer({ 
	reelay, 
	viewable,
	paused
 }) {
	const [focused, setFocused] = useState(false);
    // const paused = useRef(viewable);
	// const showPlayPause = paused.current ? "play" : "none";
    const [playPauseVisible, setPlayPauseVisible] = useState(
      paused.current ? "play" : "none"
    );
	const loadStatus = useRef(0);
	const playheadCounter = useRef(0);
	const playbackObject = useRef(null);
	const shouldPlay = useRef((viewable && focused && !paused.current));

    const { cognitoUser } = useContext(AuthContext);

	const _handleVideoRef = (component) => {
		playbackObject.current = component;
		const wasPlayingOnLastRender = playheadCounter.current % 2 === 1;

		// setPlaybackObject(playbackObject);
		if (!viewable && wasPlayingOnLastRender) {
			playheadCounter.current += 1;
			try {
				playbackObject.current.setPositionAsync(0);
			} catch (e) {
				console.log(e);
			}
		} else if (viewable && !wasPlayingOnLastRender) {
			// results in odd-numbered playhead counter
			playheadCounter.current += 1;
		}

		if (playheadCounter.current > 1 && loadStatus.current != 2) {
			console.log('video isn\'t loaded yet', reelay.title.display, reelay.creator.username);
		}
	
	}

	useEffect(()=> {
		const showPlayPause = paused.current ? "play" : "none";
		shouldPlay.current = viewable && focused && !paused.current;
		if (shouldPlay.current) 
			playbackObject.current.playAsync();
		else 
			playbackObject.current.pauseAsync();
		if (showPlayPause !== playPauseVisible) setPlayPauseVisible(showPlayPause);
	}, [viewable, paused, focused]);

    useFocusEffect(React.useCallback(() => {
		if (viewable) setFocused(true);
        return () => {
			if (viewable) setFocused(false);
		}
    }));

	const onLoad = async (playbackStatus) => {
		loadStatus.current = 2;
	}

	const onLoadStart = async (playbackStatus) => {
		loadStatus.current = 1;
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (playbackStatus?.didJustFinish && viewable) {
			logAmplitudeEventProd('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title.display,
				username: cognitoUser.username,
			})
		}
	}


    const playPause = () => {
        if (paused.current) {
            paused.current = false;
            setPlayPauseVisible("pause");
			playbackObject.current.playAsync();
            setTimeout(() => {
            	setPlayPauseVisible("none");
            }, PLAY_PAUSE_ICON_TIMEOUT);    

            logAmplitudeEventProd("playVideo", {
				creatorName: reelay.creator.username,
				reelayID: reelay.id,
				reelayTitle: reelay.title.display,
				username: cognitoUser.username,
            });
        } else {
            paused.current = true;
            setPlayPauseVisible("play");
			playbackObject.current.pauseAsync();
            setTimeout(() => {
                if (playPauseVisible === 'play') {
            		setPlayPauseVisible("none");
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   

            logAmplitudeEventProd("pauseVideo", {
				creatorName: reelay.creator.username,
				reelayID: reelay.id,
				reelayTitle: reelay.title.display,
				username: cognitoUser.username,
            });
        }
    }

	return (
		<Pressable onPress={playPause}>
			<Video
				isLooping={true}
				isMuted={false}
				onLoad={onLoad}
				onLoadStart={onLoadStart}
				onPlaybackStatusUpdate={onPlaybackStatusUpdate}
				progressUpdateIntervalMillis={50}
				rate={1.0}
				ref={(component) => _handleVideoRef(component)}
				resizeMode='cover'
				shouldDuckAndroid={true}
				shouldPlay={shouldPlay.current}
				source={{ uri: reelay.content.videoURI }}
				staysActiveInBackground={false}
				style={{
					height: height,
					width: width,
				}}
				useNativeControls={false}
				volume={1.0}
			/>
            { playPauseVisible !== "none" && <PlayPauseIcon onPress={playPause} type={playPauseVisible} /> }
		</Pressable>
		
	);
};