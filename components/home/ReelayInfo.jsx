import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';

import moment from 'moment';

export default ReelayInfo = ({ reelay }) => {

	const InfoView = styled(View)`
		flex: 1;
		justify-content: flex-end;
		margin: 0 0 120px 13px;
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
		width: 80%;
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
		width: 80%;
	`

	const displayTitle = (reelay.title.display) ? reelay.title.display : 'Title not found\ ';
	const year = (reelay.title.releaseYear) ? reelay.title.releaseYear : '';
	const creator = reelay.creator;
	const timestamp = moment(reelay.postedDateTime).fromNow();

	return (
		<InfoView>
			<PostInfo>
				<Username>@{creator?.username}</Username>
				<Timestamp>{timestamp}</Timestamp>
			</PostInfo>
			<TitleInfo>
				<Title>{displayTitle} ({year})</Title>
			</TitleInfo>
		</InfoView>
	);
}

