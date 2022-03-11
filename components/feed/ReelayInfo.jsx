import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import ProfilePicture from '../global/ProfilePicture';

const ReelayInfoBare = ({ navigation, reelay }) => {

	const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 100px;
		margin-left: 10px;
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
					<ProfilePicContainer>
						<ProfilePicture navigation={navigation} circle={true} user={creator} size={30} />
					</ProfilePicContainer>
					<Username>@{creator?.username}</Username>
				</PostInfo>
			</Pressable>
		</InfoView>
	);
};

export default ReelayInfo = memo(ReelayInfoBare, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});