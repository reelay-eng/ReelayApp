import React from 'react';
import { View } from 'react-native';
import TitleInfo from '../view-reelay/TitleInfo';
import styled from 'styled-components/native';

const InfoView = styled.View`
	flex: 1;
	justify-content: flex-end;
	margin: 0 0 240px 13px;
`
const User = styled.View`
	flex-direction: row;
	align-items: center;
`
const Username = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1);
	text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
	font-weight: bold;
	letter-spacing: -0.3px;
`
const Movie = styled.View`
	flex-direction: row;
	align-items: center;
`
const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 6px;
	width: 80%;
`

const ReelayInfo = ({ user, movie, titleObject }) => {

	return (
		<View>
			<InfoView>
				<User>
					<Username>@{user.username}</Username>
				</User>
				<Movie>
					<MovieTitle>
						{titleObject && (titleObject.title)}
						{!titleObject && movie.title}
					</MovieTitle>
				</Movie>
			</InfoView>
		</View>
	);
}

export default ReelayInfo;