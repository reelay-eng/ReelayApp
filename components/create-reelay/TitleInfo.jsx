import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

const InfoView = styled.View`
	flex: 1;
    flex-direction: row;
	justify-content: flex-end;
	margin: 0px 0px 240px 13px;
`
const Movie = styled.View`
    flex: 0.9;
	flex-direction: row;
	align-items: flex-end;
    justify-content: flex-end;
`
const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 10px;
	width: 80%;
`
const MovieYear = styled.Text`
    font-size: 17px;
    color: rgba(255, 255, 255, 1.2);
    letter-spacing: -0.2px;
    margin-top: 6px;
    width: 80%;
`

export default TitleInfo = () => {

    const titleObject = useSelector((state) => state.createReelay.titleObject);

    const title = titleObject.title ? titleObject.title + ' ' : 'Title not found\ ';
    const year = (titleObject.release_date && titleObject.release_date.length >= 4)
        ? ('(' + titleObject.release_date.slice(0,4) + ')'): '';

	return (
		<InfoView>
			<Movie>
				<MovieTitle>{title}{year}</MovieTitle>
			</Movie>
		</InfoView>
	)
}