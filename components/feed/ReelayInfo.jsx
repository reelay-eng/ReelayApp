import React, { memo, useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import ProfilePicture from '../global/ProfilePicture';
import StarRating from 'react-native-star-rating';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import FollowButton from '../global/FollowButton';

const ReelayInfo = ({ navigation, reelay }) => {
	const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 86px;
		margin-left: 15px;
		width: 80%;
	`
	const PostInfo = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const ProfilePicContainer = styled(View)`
		margin-right: 8px;
	`
	const Username = styled(ReelayText.Subtitle1Emphasized)`
		color: white;
		margin-right: 8px;
	`
	const DescriptionContainer = styled(View)`
		margin-top: 3px;
		margin-left: 8px;
		flex-direction: row;
		align-items: center;
	`
	const Description = styled(ReelayText.Caption)`
		color: white;
	`
	const StarRatingContainer = styled(View)`
		margin-top: 5px;
		flex-direction: row;
		align-items: center;
		width: 10%;
	`
	const creator = reelay.creator;
	const description = reelay.description ? reelay.description: "";
	const starRating = reelay.starRating + (reelay.starRatingAddHalf ? 0.5 : 0);

	const goToProfile = () => {
		navigation.push('UserProfileScreen', { creator });
		logAmplitudeEventProd('viewProfile', { 
			creator: creator.username,
			reelayId: reelay.id,
			source: 'reelayInfo',
		});
	}

	console.log('Rerendering reelay info');

	return (
		<InfoView>
			<Pressable onPress={goToProfile}>
				<PostInfo>
					<ProfilePicContainer>
						<ProfilePicture navigation={navigation} border circle user={creator} size={30} />
					</ProfilePicContainer>
					<Username>@{creator?.username}</Username>
					<FollowButton creator={creator} />
				</PostInfo>
			</Pressable>

			{(starRating>0) && <StarRatingContainer>
				<StarRating 
					disabled={true}
					emptyStarColor={'#c4c4c4'}
					maxStars={5}
					fullStarColor={'#f1c40f'}
					halfStarEnabled={true}
					rating={starRating}
					starSize={20}
					starStyle={{marginLeft: 7}}
				/>
			</StarRatingContainer>}

			{description.length>0 && 
			(<DescriptionContainer>
				<Description>{description}</Description>
			</DescriptionContainer>)}
		</InfoView>
	);
};

export default memo(ReelayInfo, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});
