import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';

const InfoView = styled.View`
	flex: 1;
	justify-content: flex-end;
	margin: 0 0 150px 13px;
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

	const title = (titleObject && titleObject.title) 
		? titleObject.title + ' ' 
		: 'Title not found\ ';

	const year = (titleObject && titleObject.release_date && titleObject.release_date.length >= 4)
		? ('(' + titleObject.release_date.slice(0,4) + ')')
		: '';	

	return (
		<InfoView>
			<User>
				<Username>@{user.username}</Username>
			</User>
			<Movie>
				<MovieTitle>
					{titleObject && <Text>{title}{year} </Text>}
					{!titleObject && <Text>{movie.title}</Text>}
				</MovieTitle>
			</Movie>
		</InfoView>
	);
}

export default ReelayInfo;