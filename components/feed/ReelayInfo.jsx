import React from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default ReelayInfo = ({ navigation, reelay }) => {

	const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 100px;
		margin-left: 20px;
		width: 80%;
	`
	const PostInfo = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const Username = styled(ReelayText.Subtitle1Emphasized)`
		align-self: flex-end;
		color: white;
	`

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
				{/* <TitleInfo>
					<Title>{displayTitle} ({year})</Title>
				</TitleInfo> */}
			</Pressable>
		</InfoView>
	);
}

