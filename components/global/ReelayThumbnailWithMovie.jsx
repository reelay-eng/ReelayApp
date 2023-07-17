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
import TitleBanner from '../feed/TitleBanner';
import TitleBannerDiscover from '../feed/TitleBannerDiscover';
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons';
import ReelayDiscVideo from './ReelayDiscVideo';

const canUseFastImage = (Constants.appOwnership !== 'expo');

const ReelayThumbnailWithMovie = ({ 
	navigation,
	onPress = () => {}, 
	reelay, 
	index,
	onPlaybackStatusUpdate
}) => {

	const Spacer = styled(View)`
		height: 240px;
	`
	const CreatorLineContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        margin-left: 5px;
    `
    const GradientContainer = styled(View)`
		align-items: flex-start;
		border-radius: 8px;
		height: 100%;
		justify-content: flex-end;
		position: absolute;
		width: 100%;
	`

	const TItleContainer = styled(View)`
		align-items: flex-start;
		flex-direction: row;
		position: absolute;
		top: 0px;
		left: 0px;
	`
	const StarRatingContainer = styled(View)`
		align-items: center;
		flex-direction: row;
		margin-top: -15px;
		margin-bottom: 6px;
	`
	const ThumbnailContainer = styled(Pressable)`
		justify-content: center;
		margin: 10px;
		width: ${POSTER_WIDTH};
	`
	const ThumbnailGradient = styled(LinearGradient)`
		border-radius: 0px;
		flex: 1;
		opacity: 0.6;
		height: 100%;
		width: 100%;
		overflow:hidden;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
		line-height: 18px;
		margin-top:3px;
        font-size: 14px;
		color: white;
		flex: 1;
	`
	const DevWidth = Dimensions.get('window').width;
	const POSTER_WIDTH = DevWidth / 2.3;
	const starRating = (reelay?.starRating ?? 0) + (reelay?.starRatingAddHalf ? 0.5 : 0);
    const [muteIndex, setMuteIndex] = useState(0);

	// console.log("videoURI+ ",index,reelay?.content?.videoURI)
	// const onPlaybackStatusUpdate = (playbackStatus,index) =>{
    //     // console.log("playbackStatus",playbackStatus)
    //     if(playbackStatus?.positionMillis > 6000){
    //         setMuteIndex(index+1)
    //     }
    // }
	return (
		<Pressable key={reelay?.id} onPress={onPress}>
			<ThumbnailContainer key={index} onPress={()=>//goToReelay(item,index)}
			navigation.push('SingleReelayScreen', { reelaySub:reelay?.sub })}
			>
			 {/* <Video
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
			/> */}

			<ReelayDiscVideo
			reelay={reelay}
			index={index}
			muteIndex={muteIndex}
			setMuteIndex={setMuteIndex}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
			/>
			<TItleContainer>
			 <TitleBannerDiscover
				titleObj={reelay?.title}
				reelay={reelay}
			/>
			</TItleContainer>
			<GradientContainer>
				<ThumbnailGradient colors={["transparent", "#0B1424"]} />
				<BlurView intensity={15} tint='dark'
					style={{
						flexDirection: "row", justifyContent: "space-between", alignItems: 'center',
						width: '100%', height: 40, borderBottomRightRadius: 12, borderBottomLeftRadius: 12, overflow: "hidden"
					}}>
					<View style={{ flexDirection: "row", height: 40, width: "80%" }}>
						<>
						<CreatorLineContainer>
							<ProfilePicture user={reelay?.creator} size={26} border />
						</CreatorLineContainer>
						</>
						<View style={{ marginLeft: 5, width: "75%" }}>
							<UsernameText numberOfLines={2}>
								{reelay?.creator?.username}
							</UsernameText>
							{starRating > 0 &&
							 <StarRatingContainer>
								<StarRating
									disabled={true}
									rating={starRating}
									starSize={12}
									starStyle={{ paddingRight: 2 }}
								/>
							</StarRatingContainer>}
						</View>
					</View>
					<>
						{muteIndex !== index ?
							
							<Ionicons onPress={()=>setMuteIndex(index)} name='volume-mute' color={"#fff"} size={24} style={{marginRight:8}}/>
							:
							<Ionicons onPress={()=>setMuteIndex(-1)} name='volume-high' color={"#fff"} size={24} style={{ marginRight: 4 }} />}
					</>
				</BlurView>
			</GradientContainer>
		</ThumbnailContainer>
		</Pressable>
	);
};
export default memo(ReelayThumbnailWithMovie)