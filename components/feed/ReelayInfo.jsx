import React, { memo, useContext } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../global/Text';
import ProfilePicture from '../global/ProfilePicture';
import { AuthContext } from '../../context/AuthContext';

import { ActionButton, BWButton } from '../global/Buttons';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import ReelayColors from '../../constants/ReelayColors';

const FollowButton = ({ creator }) => {
	const AlreadyFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(0, 0, 0, 0.36);
		border-color: white;
		border-radius: 8px;
		border-width: 1px;
		justify-content: center;
		flex-direction: row;
		height: 30px;
		width: 90px;
	`
	const FollowButtonContainer = styled(View)``
	const FollowButtonText = styled(ReelayText.CaptionEmphasized)`
		color: white;
	`
	const NotYetFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(41, 119, 239, 0.9);
		border-radius: 8px;
		justify-content: center;
		flex-direction: row;
		height: 30px;
		width: 90px;
	`

	const { myFollowing, reelayDBUser } = useContext(AuthContext);
	const isMyProfile = reelayDBUser?.sub === creator?.sub;

	const findFollowUser = (userObj) => (userObj.creatorSub === creator?.sub);
    const alreadyFollowing = myFollowing.find(findFollowUser);

	const AlreadyFollowingIcon = () => {
		return (
			<Icon
				type="ionicon"
				name="chevron-down-outline"
				color={"white"}
				size={15}
			/>
		)
	};

	const AlreadyFollowingButton = () => {
		return (
			<AlreadyFollowingButtonPressable>
				<FollowButtonText>{'Following'}</FollowButtonText>
				<AlreadyFollowingIcon />
			</AlreadyFollowingButtonPressable>
		);
	}

	const NotYetFollowingButton = () => {
		return (
			<NotYetFollowingButtonPressable>
				<FollowButtonText>{'Follow'}</FollowButtonText>
			</NotYetFollowingButtonPressable>
		);
	};

	return (
		<FollowButtonContainer>
			{!alreadyFollowing && !isMyProfile && <NotYetFollowingButton /> }
			{alreadyFollowing && !isMyProfile && <AlreadyFollowingButton /> }
		</FollowButtonContainer>
	);
}

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
						<ProfilePicture navigation={navigation} border circle user={creator} size={30} />
					</ProfilePicContainer>
					<Username>@{creator?.username}</Username>
					<FollowButton creator={creator} />
				</PostInfo>
			</Pressable>
		</InfoView>
	);
};

export default memo(ReelayInfo, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});