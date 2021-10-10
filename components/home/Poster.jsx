import React, { memo, useContext } from 'react';
import { Image, Pressable, View, SafeAreaView } from 'react-native';
import { getPosterURL } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';
import * as Amplitude from 'expo-analytics-amplitude';

const areEqual = (title1, title2) => title1.id === title2.id;

export default Poster = memo(({ title }) => {

	const PosterContainer = styled(Pressable)`
		z-index: 3;
	`
	const PosterImage = styled(Image)`
		height: 150px;
		width: 100px;
		margin-top: 10px;
		margin-bottom: 10px;
		border-radius: 8px;
	`;
	const { user } = useContext(AuthContext);
	const {
		overlayVisible,
		setOverlayData,
		setOverlayVisible,
	} = useContext(VisibilityContext);

	if (!title) {
		return (<View />);
	}

	const posterImageSource = getPosterURL(title.posterURI);

	const onPosterPress = () => {
		if (overlayVisible) {
			setOverlayVisible(false);
			Amplitude.logEventWithPropertiesAsync('closedOverlay', {
                username: user.username,
				titleID: title.id,
                title: title.display,
            });
		} else {
			setOverlayData({
				type: 'TITLE',
				title: title,
			});
			setOverlayVisible(true);	
			Amplitude.logEventWithPropertiesAsync('openedOverlay', {
                username: user.username,
				titleID: title.id,
                title: title.display,
            });

		}
	}

	return (
		<SafeAreaView>
			<PosterContainer onPress={onPosterPress}>
				{ posterImageSource && <PosterImage source={{ uri: posterImageSource }} />}
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);