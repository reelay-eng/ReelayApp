import React, { useContext } from 'react';
import { Image, Pressable, View, SafeAreaView } from 'react-native';
import { getPosterURI } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';
import * as Amplitude from 'expo-analytics-amplitude';

const MovieTitle = styled.Text`
	font-size: 17px;
	color: rgba(255, 255, 255, 1.2);
	letter-spacing: -0.2px;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 120px;
`
const PosterImage = styled(Image)`
	height: 180px;
	width: 120px;
	margin-top: 10px;
	margin-bottom: 10px;
	border-radius: 8px;
`
const PosterContainer = styled(Pressable)`
	z-index: 3;
`

export default Poster = ({ reelay, showTitle }) => {

	const authContext = useContext(AuthContext);
	const visibilityContext = useContext(VisibilityContext);

	if (!reelay) {
		return <View />;
	}

    const title = reelay.title ? reelay.title : 'Title not found\ ';
    const year = reelay.releaseYear ? reelay.releaseYear : '';

	const posterImageUri = getPosterURI(reelay.posterURI);

	const onPosterPress = () => {
		if (visibilityContext.overlayVisible) {
			visibilityContext.setOverlayVisible(false);
			Amplitude.logEventWithPropertiesAsync('closedOverlay', {
                username: authContext.user.username,
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
                title: reelay.title,
            });
		} else {
			visibilityContext.setOverlayData({
				type: 'TITLE',
				reelay: reelay,
			});
			visibilityContext.setOverlayVisible(true);	
			Amplitude.logEventWithPropertiesAsync('openedOverlay', {
                username: authContext.user.username,
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
                title: reelay.title,
            });
		}
	}

	return (
		<SafeAreaView>
			<PosterContainer onPress={onPosterPress}>
				{posterImageUri && <PosterImage 
					source={{ uri: posterImageUri }} 
				/>}
				{showTitle && <MovieTitle>{title}{year}</MovieTitle>}
			</PosterContainer>
		</SafeAreaView>
	);
}