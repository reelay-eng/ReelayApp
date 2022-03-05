import React from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default ReelayInfo = ({ navigation, reelay }) => {

	const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 120px;
		margin-left: 20px;
	`
	const PostInfo = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const Username = styled(ReelayText.Subtitle1Emphasized)`
		align-self: flex-end;
		color: white;
	`
	const TitleInfo = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const Title = styled(ReelayText.Body2)`
		color: white;
	`

	const displayTitle = (reelay.title.display) ? reelay.title.display : 'Title not found\ ';
	const year = (reelay.title.releaseYear) ? reelay.title.releaseYear : '';
	const creator = reelay.creator;

	const goToProfile = () => {
		navigation.push('UserProfileScreen', { creator });
		logAmplitudeEventProd('viewProfile', { 
			creator: creator.username,
			reelayId: reelay.id,
			source: 'reelayInfo',
		});
	}

	return (
		<InfoView>
			<Pressable onPress={goToProfile}>
				<PostInfo>
					<Username>@{creator?.username}</Username>
				</PostInfo>
				<TitleInfo>
					<Title>{displayTitle} ({year})</Title>
				</TitleInfo>
			</Pressable>
		</InfoView>
	);
}

