import React, { useContext, useState } from 'react';
import { 
    Image,
    Pressable, 
    View,
} from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import { Video, Audio } from 'expo-av';
import { Icon } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import * as ReelayText from "../../components/global/Text";
import { VenueIcon } from '../utils/VenueIcon';
import SplashImage from "../../assets/images/reelay-splash-with-dog.png";
import { generateThumbnail, getThumbnailURI, saveThumbnail } from '../../api/ThumbnailApi';
import ProfilePicture from './ProfilePicture';
import { useSelector } from 'react-redux';

export default ReelayThumbnail = ({ 
	asTopOfTheWeek = false,
	height = 180, 
	margin = 6, 
	onPress, 
	reelay, 
	showIcons = true,
	width = 120,
}) => {
	const ICON_SIZE = asTopOfTheWeek ? 24 : 16;
	const STAR_RATING_ADD_LEFT = asTopOfTheWeek ? 12 : 0;
	const STAR_SIZE = asTopOfTheWeek ? 16 : 12;
	const PROFILE_PIC_SIZE = asTopOfTheWeek ? 32 : 24;
	const USERNAME_TEXT_SIZE = asTopOfTheWeek ? 16 : 12;
	const USERNAME_ADD_LEFT = USERNAME_TEXT_SIZE - 7;

	const CreatorLineContainer = styled(View)`
        align-items: center;
		bottom: 12px;
        flex-direction: row;
        margin-left: 5px;
		position: absolute;
    `
    const GradientContainer = styled(View)`
		align-items: flex-start;
		border-radius: 8px;
		height: 100%;
		justify-content: flex-end;
		position: absolute;
		width: 100%;
	`
	const LikeContainer = styled(View)`
		align-items: flex-start;
		flex-direction: row;
		position: absolute;
		top: 4px;
		left: 4px;
	`
	const LikeText = styled(ReelayText.Subtitle2)`
		font-size: 14px;
		margin-left: 2px;
		color: white;
	`
	const StarRatingContainer = styled(View)`
		align-items: center;
		flex-direction: row;
		margin-top: -5px;
		margin-bottom: 6px;
		margin-left: ${35 + STAR_RATING_ADD_LEFT}px;
	`
	const TitleVenue = styled(View)`
		position: absolute;
		top: 4px;
		right: 4px;
	`
	const ThumbnailContainer = styled(View)`
		justify-content: center;
		margin: ${margin}px;
	`
	const ThumbnailGradient = styled(LinearGradient)`
		border-radius: 6px;
		flex: 1;
		opacity: 0.6;
		position: absolute;
		height: 100%;
		width: 100%;
	`
	const ThumbnailImage = styled(Image)`
		border-radius: 8px;
		height: ${height}px;
		width: ${width}px;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
        font-size: ${USERNAME_TEXT_SIZE}px;
		padding: ${USERNAME_ADD_LEFT}px;
		color: white;
		flex: 1;
	`
	const cloudfrontThumbnailSource = { uri: getThumbnailURI(reelay) };
	const [thumbnailSource, setThumbnailSource] = useState(cloudfrontThumbnailSource);
	const s3Client = useSelector(state => state.s3Client);
	const starRating = (reelay.starRating ?? 0) + (reelay.starRatingAddHalf ? 0.5 : 0);

	const generateAndSaveThumbnail = async () => {
		console.log('ON ERROR TRIGGERED: ', getThumbnailURI(reelay));
		const thumbnailObj = await generateThumbnail(reelay);
		if (thumbnailObj && !thumbnailObj.error) {
			saveThumbnail(reelay, s3Client, thumbnailObj);
			setThumbnailSource({ uri: thumbnailObj?.uri });
		} else {
			setThumbnailSource(SplashImage);
		}
		return thumbnailObj;
	}

	const GradientOverlay = ({ username }) => {
		return (
			<React.Fragment>
				{ !asTopOfTheWeek && (
					<ThumbnailImage 
						onError={generateAndSaveThumbnail} 
						source={thumbnailSource} 
					/>
				)}
				{ asTopOfTheWeek && (
					<MutedVideoPlayer />
				)}
				{ showIcons && 
					<TitleVenue>
						<VenueIcon venue={reelay?.content?.venue} size={ICON_SIZE} border={1} />
					</TitleVenue>			
				}
				{ asTopOfTheWeek && <LikeCounter likeCount={reelay.likes.length} /> }
				<GradientContainer>
					<ThumbnailGradient colors={["transparent", "#0B1424"]} />
					{ showIcons && <CreatorLine username={username} /> }
					{ showIcons && (starRating > 0) && <StarRatingLine /> }
				</GradientContainer>
			</React.Fragment>
		)
	}

	const StarRatingLine = () => {
		return (
			<StarRatingContainer>
				<StarRating 
					disabled={true}
					emptyStarColor={'#c4c4c4'}
					maxStars={5}
					fullStarColor={'white'}
					halfStarEnabled={true}
					rating={starRating}
					starSize={STAR_SIZE}
					starStyle={{ paddingRight: 2 }}
				/>
			</StarRatingContainer>
		);
	}

    const CreatorLine = ({ username }) => {        
        return (
            <CreatorLineContainer>
                <ProfilePicture user={reelay?.creator} size={PROFILE_PIC_SIZE} border />
                <UsernameText numberOfLines={1}>
                    {`@${username}`}
                </UsernameText>
            </CreatorLineContainer>
        );
    }

	const LikeCounter = ({ likeCount }) => {
		return (
			<LikeContainer>
				<Icon type='ionicon' name='heart' color='white' size={24} />
				<LikeText>{likeCount}</LikeText>
			</LikeContainer>
		);
	}

	const MutedVideoPlayer = () => {
		return (
			<React.Fragment>
				<Video
					isLooping
					isMuted={true}
					rate={1.0}
					resizeMode='cover'
					shouldDuckAndroid={true}
					shouldPlay={true}
					source={{ uri: reelay.content.videoURI }}
					staysActiveInBackground={false}
					style={{
						height: height,
						width: width,
						borderRadius: 8,
					}}
					useNativeControls={false}
					volume={1.0}
				/>
			</React.Fragment>
		);
	}

	return (
		<Pressable key={reelay.id} onPress={onPress}>
			<ThumbnailContainer>
				<GradientOverlay username={reelay?.creator?.username} />
			</ThumbnailContainer>
		</Pressable>
	);
};
