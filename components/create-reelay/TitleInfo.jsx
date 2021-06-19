import React from 'react'
import styled from 'styled-components/native'

const InfoView = styled.View`
	flex: 1;
    flex-direction: row;
	justify-content: flex-end;
	margin: 0px 0px 240px 13px;
`
const Movie = styled.View`
    flex: 1;
	flex-direction: column;
	align-items: flex-start;
    justify-content: flex-start;
`
const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 6px;
	width: 80%;
`
const MovieYear = styled.Text`
    font-size: 17px;
    color: rgba(255, 255, 255, 1.2);
    letter-spacing: -0.2px;
    margin-top: 6px;
    width: 80%;
`

export default TitleInfo = ({ titleObject }) => {

    const title = titleObject.title ? titleObject.title + '\t' : 'Title not found\t';
    const year = (titleObject.release_date && titleObject.release_date.length >= 4)
        ? ('(' + titleObject.release_date.slice(0,4) + ')'): '';

	return (
		<InfoView>
			<Movie>
				<MovieTitle>{title}</MovieTitle>
                <MovieYear>{year}</MovieYear>
			</Movie>
		</InfoView>
	)
}