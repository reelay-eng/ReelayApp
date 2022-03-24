import React, { memo, useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import ProfilePicture from '../global/ProfilePicture';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import FollowButton from '../global/FollowButton';

const ReelayInfo = ({ navigation, reelay }) => {
	const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 100px;
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
		margin-top: 8px;
		flex-direction: row;
		align-items: center;
	`
	const Description = styled(ReelayText.Caption)`
		color: white;
	`
	const creator = reelay.creator;
	const description = reelay.description;

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

			{description && 
			(<DescriptionContainer>
				<Description>{description}</Description>
			</DescriptionContainer>)}
		</InfoView>
	);
};

export default memo(ReelayInfo, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});
