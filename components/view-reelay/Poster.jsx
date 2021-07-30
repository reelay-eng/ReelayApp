import React, { useContext } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

import { getPosterURI } from '../../api/TMDbApi';
import { VisibilityContext } from '../../context/VisibilityContext';

const TitleContainer = styled.View`
    flex: 0.9;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-end;
	margin-right: 10px;
`
const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 120px;
`

export default Poster = ({ titleObject, showTitle }) => {

	const visibilityContext = useContext(VisibilityContext);

	if (!titleObject) {
		return <View />;
	}

    const title = titleObject.title ? titleObject.title + ' ' : 'Title not found\ ';
    const year = (titleObject.release_date && titleObject.release_date.length >= 4)
        ? ('(' + titleObject.release_date.slice(0,4) + ')'): '';

	const posterImageUri = getPosterURI(titleObject.poster_path);

	const onPosterPress = () => {
		console.log('poster pressed');
		if (visibilityContext.overlayVisible) {
			visibilityContext.setOverlayVisible(false);
		} else {
			visibilityContext.setOverlayData({
				type: 'TITLE',
				titleObject: titleObject,
			});
			visibilityContext.setOverlayVisible(true);	
			console.log(visibilityContext);
		}
	}

	return (
			// <TitleContainer>
				<Pressable>
					{posterImageUri && <Image 
						source={{ uri: posterImageUri }} 
						style={{ height: 180, width: 120, 
							marginTop: 10, marginBottom: 10,
							borderRadius: 8,
						}}
					/>}
					{showTitle && <MovieTitle>{title}{year}</MovieTitle>}
				</Pressable>
			// </TitleContainer>
	);
}