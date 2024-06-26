import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import { Video, Audio } from 'expo-av';
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

const canUseFastImage = (Constants.appOwnership !== 'expo');

export default ReelayThumbnail = ({ 
	asAllClubActivity = false,
	asSingleClubActivity = false,
	asTopOfTheWeek = false,
	height = 180, 
	margin = 6, 
	onPress = () => {}, 
	reelay, 
	showIcons = true,
	showLikes = false,
	showPoster = false,
	showVenue = true,
	width = 120,
}) => {
	const asClubActivity = (asAllClubActivity || asSingleClubActivity);

	const CREATOR_LINE_BOTTOM = asClubActivity ? 6 : 12;
	const ICON_SIZE = asTopOfTheWeek ? 24 : asClubActivity ? 20 : 16;
	const STAR_RATING_ADD_LEFT = asTopOfTheWeek ? 12 : asClubActivity ? 6 : 0;
	const STAR_SIZE = asTopOfTheWeek ? 16 : asClubActivity ? 14 : 12;
	const PROFILE_PIC_SIZE = asTopOfTheWeek ? 32 : asClubActivity ? 28 : 24;
	const USERNAME_TEXT_SIZE = asTopOfTheWeek ? 16 : asClubActivity ? 14 : 12;
	const USERNAME_ADD_LEFT = USERNAME_TEXT_SIZE - 7;
	const POSTER_WIDTH = width / 4;

	const Spacer = styled(View)`
		height: ${props => props.height ?? '0'}px;
	`
	const CreatorLineContainer = styled(View)`
        align-items: center;
		bottom: ${CREATOR_LINE_BOTTOM}px;
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
	const TopRightContainer = styled(View)`
		position: absolute;
		top: 4px;
		right: 4px;
		flex-direction: column;
		align-items: flex-end;
	`

	const ThumbnailContainer = styled(View)`
		justify-content: center;
		margin: ${margin}px;
		width: ${width}px;
	`
	const ThumbnailGradient = styled(LinearGradient)`
		border-radius: 6px;
		flex: 1;
		opacity: 0.6;
		position: absolute;
		height: 100%;
		width: 100%;
	`
	const ThumbnailImage = styled(canUseFastImage ? FastImage : Image)`
		border-radius: 8px;
		height: ${height}px;
		width: 100%;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
		line-height: 18px;
        font-size: ${USERNAME_TEXT_SIZE}px;
		padding-left: ${USERNAME_ADD_LEFT}px;
		padding-right: ${USERNAME_ADD_LEFT}px;
		color: white;
		margin-bottom: 4px;
		flex: 1;
	`
	const cloudfrontThumbnailSource = { uri: getThumbnailURI(reelay) };
	const [thumbnailSource, setThumbnailSource] = useState(cloudfrontThumbnailSource);
	const myClubs = useSelector(state => state.myClubs);
	const s3Client = useSelector(state => state.s3Client);
	const starRating = (reelay.starRating ?? 0) + (reelay.starRatingAddHalf ? 0.5 : 0);

	const club = asClubActivity ? (myClubs.find(next => next.id === reelay?.clubID)) : null;
	const displayName = asClubActivity ? (club?.name) : reelay?.creator?.username;

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

	const GradientOverlay = () => {
		return (
			<React.Fragment>
				{ !asTopOfTheWeek && (
					<ThumbnailImage 
						onError={generateAndSaveThumbnail} 
						source={thumbnailSource} 
					/>
				)}
				{ asTopOfTheWeek && <MutedVideoPlayer /> }
				{ showIcons && 
					<TopRightContainer>
						{ showPoster && (
							<React.Fragment>
								<TitlePoster title={reelay?.title} width={POSTER_WIDTH} onPress={() => {}}/>
								<Spacer height={5} />
							</React.Fragment>
						 ) }
						{ showVenue && <VenueIcon venue={reelay?.content?.venue} size={ICON_SIZE} border={1} /> }
					</TopRightContainer>			
				}
				{ showLikes && <LikeCounter likeCount={reelay.likes.length} /> }
				<GradientContainer>
					<ThumbnailGradient colors={["transparent", "#0B1424"]} />
					{ showIcons && <CreatorLine /> }
					{ showIcons && !asClubActivity && (starRating > 0) && <StarRatingLine /> }
				</GradientContainer>
			</React.Fragment>
		)
	}

	const StarRatingLine = () => {
		return (
			<StarRatingContainer>
				<StarRating 
					disabled={true}
					rating={starRating}
					starSize={STAR_SIZE}
					starStyle={{ paddingRight: 2 }}
				/>
			</StarRatingContainer>
		);
	}

    const CreatorLine = () => {        
        return (
            <CreatorLineContainer>
				{ asAllClubActivity && (
					<ClubPicture club={{ id: reelay?.clubID }} size={PROFILE_PIC_SIZE} />
				)}
				{ !asAllClubActivity && (
					<ProfilePicture user={reelay?.creator} size={PROFILE_PIC_SIZE} border />
				)}
                <UsernameText numberOfLines={asAllClubActivity ? 2 : 1}>
                    {displayName}
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
					shouldPlay={true}
					source={{ uri: reelay.content.videoURI }}
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
