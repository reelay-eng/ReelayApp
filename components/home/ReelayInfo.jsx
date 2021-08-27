import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';


export default ReelayInfo = ({ reelay }) => {

	const InfoView = styled(View)`
		flex: 1;
		justify-content: flex-end;
		margin: 0 0 120px 13px;
	`
	const User = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const Username = styled(Text)`
		font-size: 17px;
		color: rgba(255, 255, 255, 1);
		text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		letter-spacing: -0.3px;
	`
	const Movie = styled(View)`
		flex-direction: row;
		align-items: center;
	`
	const MovieTitle = styled(Text)`
		font-size: 17px;
		color: rgba(255, 255, 255, 1.2);
		letter-spacing: -0.2px;
		margin-top: 6px;
		width: 80%;
	`

	const title = (reelay.title) ? reelay.title : 'Title not found\ ';
	const year = (reelay.releaseYear) ? reelay.releaseYear : '';
	const creator = reelay.creator;

	return (
		<InfoView>
			<User>
				<Username>@{creator?.username}</Username>
			</User>
			<Movie>
				<MovieTitle>
					<Text>{title} ({year})</Text>
				</MovieTitle>
			</Movie>
		</InfoView>
	);
}

