import React, { useState,memo } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import { Video, Audio } from 'expo-av';
// import Video from "react-native-fast-video";
import { Icon } from 'react-native-elements';
import StarRating from './StarRating';
import * as ReelayText from "../../components/global/Text";
import VenueIcon from '../utils/VenueIcon';
import SplashImage from "../../assets/images/reelay-splash-with-dog-black.png";
import { generateThumbnail, getThumbnailURI, saveThumbnail } from '../../api/ThumbnailApi';
import ProfilePicture from './ProfilePicture';
import { useSelector } from 'react-redux';
import TitlePoster from './TitlePoster';
import ClubPicture from './ClubPicture';
import FastImage from 'react-native-fast-image';
import Constants from 'expo-constants';


const ReelayDiscVideo = ({ 
	reelay, 
	index,
	muteIndex,
	setMuteIndex,
	onPlaybackStatusUpdate
}) => {

	const DevWidth = Dimensions.get('window').width;
	const POSTER_WIDTH = DevWidth / 2.3;

	// const onPlaybackStatusUpdate = (playbackStatus,index) =>{
    //     // console.log("playbackStatus",playbackStatus)
    //     if(playbackStatus?.positionMillis > 6000){
    //         setMuteIndex(index+1)
    //     }
    // }
	return (
		<Pressable>
			 <Video
				isLooping = {false}
				isMuted={muteIndex == index ? false:true}
				key={index}
				rate={1.0}
				// ref={videoRef}
				// progressUpdateIntervalMillis={50}
				resizeMode='cover'
				shouldPlay={muteIndex == index ? true:false}
				source={{ uri: reelay?.content?.videoURI }}
				style={{
					height: 240,
					width: POSTER_WIDTH,
					borderRadius: 12,
				}}
				useNativeControls={false}
				volume={1.0}
				onPlaybackStatusUpdate={(playbackStatus) => onPlaybackStatusUpdate(playbackStatus,index)}                   
			/>
			
		</Pressable>
	);
};
export default memo(ReelayDiscVideo)