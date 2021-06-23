import React from 'react';
import { useSelector } from 'react-redux';
import { View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const TMDB_IMAGE_API_BASE_URL = 'http://image.tmdb.org/t/p/w500/';

const InfoView = styled.View`
	flex: 1;
    flex-direction: row;
	justify-content: flex-end;
	margin: 0px 0px 240px 13px;
`
const Movie = styled.View`
    flex: 0.9;
	flex-direction: column;
	align-items: flex-end;
`
const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 120px;
`

export default TitleInfo = ({ titleObject }) => {

	if (!titleObject) {
		return <InfoView />;
	}

    const title = titleObject.title ? titleObject.title + ' ' : 'Title not found\ ';
    const year = (titleObject.release_date && titleObject.release_date.length >= 4)
        ? ('(' + titleObject.release_date.slice(0,4) + ')'): '';

	const posterImageUri = titleObject.poster_path 
        ? `${TMDB_IMAGE_API_BASE_URL}${titleObject.poster_path}` : null;

	return (
		<InfoView>
			<Movie>
				{posterImageUri && <Image 
                    source={{ uri: posterImageUri }} 
                    style={{ height: 180, width: 120, 
						marginTop: 10, marginBottom: 10,
						marginLeft: 10, marginRight: 10,
					}}
				/>}
				<MovieTitle>{title}{year}</MovieTitle>
			</Movie>
		</InfoView>
	);
}