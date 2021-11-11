import React, { useContext } from 'react';
import { Dimensions, Pressable, Text, SafeAreaView, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import moment from 'moment';

const { height, width } = Dimensions.get('window');

export default ReelayInfo = ({ navigation, reelay }) => {

	const { user } = useContext(AuthContext);

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
	const Username = styled(Text)`
		align-self: flex-end;
		font-size: 19px;
		color: rgba(255, 255, 255, 1);
		text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		letter-spacing: -0.3px;
	`
	const Timestamp = styled(Text)`
		align-self: flex-end;
		color: rgba(255, 255, 255, 1.2);
		font-size: 16px;
		letter-spacing: -0.2px;
		margin-left: 10px;
	`
	const TitleInfo = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const Title = styled(Text)`
		font-size: 18px;
		color: rgba(255, 255, 255, 1.2);
		letter-spacing: -0.2px;
		margin-top: 6px;
	`

	const displayTitle = (reelay.title.display) ? reelay.title.display : 'Title not found\ ';
	const year = (reelay.title.releaseYear) ? reelay.title.releaseYear : '';
	const creator = reelay.creator;
	const timestamp = moment(reelay.postedDateTime).fromNow();

	const goToProfile = () => {
		navigation.push('UserProfileScreen', { creator });
	}

	return (
		<InfoView>
			<Pressable onPress={goToProfile}>
				<PostInfo>
					<Username>@{creator?.username}</Username>
					<Timestamp>{timestamp}</Timestamp>
				</PostInfo>
				<TitleInfo>
					<Title>{displayTitle} ({year})</Title>
				</TitleInfo>
			</Pressable>
		</InfoView>
	);
}

