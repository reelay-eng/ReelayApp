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
	asMutedVideo = false,
	height = 200, 
	margin = 6, 
	onPress, 
	reelay, 
	showIcons = true,
	showLikes = false,
	width = 105,
}) => {
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
		margin-left: ${(props) => 35 + props.addLeft}px;
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
	const ThumbnailImage = styled(Image)`
		border-radius: 8px;
		height: ${height}px;
		width: ${width}px;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
        font-size: ${(props) => props.size}px;
		padding: ${(props) => props.size - 7}px;
		color: white;
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
				{ !asMutedVideo && (
					<ThumbnailImage 
						onError={generateAndSaveThumbnail} 
						source={thumbnailSource} 
					/>
				)}
				{ asMutedVideo && (
					<MutedVideoPlayer />
				)}
				{ showIcons && 
					<TitleVenue>
						<VenueIcon venue={reelay?.content?.venue} size={asMutedVideo ? 24: 16} border={1} />
					</TitleVenue>			
				}
				{ asMutedVideo && <LikeCounter likeCount={reelay.likes.length} /> }
				<GradientContainer>
					<LinearGradient
						colors={["transparent", "#0B1424"]}
						style={{
							flex: 1,
							opacity: 0.6,
							width: "100%",
							height: "100%",
							borderRadius: "6px",
							position: 'absolute',
						}}
					/>
					{ showIcons && <CreatorLine username={username} /> }
					{ showIcons && (starRating > 0) && <StarRatingLine /> }
				</GradientContainer>
			</React.Fragment>
		)
	}

	const StarRatingLine = () => {
		return (
			<StarRatingContainer addLeft={ asMutedVideo ? 12 : 0}>
				<StarRating 
					disabled={true}
					emptyStarColor={'#c4c4c4'}
					maxStars={5}
					fullStarColor={'white'}
					halfStarEnabled={true}
					rating={starRating}
					starSize={asMutedVideo ? 16 : 12}
					starStyle={{ paddingRight: 2 }}
				/>
			</StarRatingContainer>
		);
	}

    const CreatorLine = ({ username }) => {
        const condensedUsername = (username.length > 10)
            ? username.substring(0, 10) + "..."
            : username;
        
        return (
            <CreatorLineContainer>
                <ProfilePicture user={reelay?.creator} size={asMutedVideo ? 32 : 24} border  />
                <UsernameText size={asMutedVideo ? 16 : 12}>
                    {`@${condensedUsername}`}
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
