import React, { memo, useContext } from 'react';
import { Image, Pressable, View, SafeAreaView } from 'react-native';
import { getPosterURI } from '../../api/TMDbApi';

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
		height: 180px;
		width: 120px;
		margin-top: 10px;
		margin-bottom: 10px;
		border-radius: 8px;
	`;
	const authContext = useContext(AuthContext);
	const {
		overlayVisible,
		setOverlayData,
		setOverlayVisible,
	} = useContext(VisibilityContext);

	if (!title) return (<View />);
	const posterImageSource = getPosterURI(title.posterURI);

	const onPosterPress = () => {
		if (overlayVisible) {
			setOverlayVisible(false);
			// Amplitude.logEventWithPropertiesAsync('closedOverlay', {
            //     username: authContext.user.username,
			// 	reelayID: reelay.id,
			// 	reelayCreator: reelay.creator.username,
            //     title: reelay.title,
            // });
		} else {
			setOverlayData({
				type: 'TITLE',
				title: title,
			});
			setOverlayVisible(true);	
			// Amplitude.logEventWithPropertiesAsync('openedOverlay', {
            //     username: authContext.user.username,
			// 	reelayID: reelay.id,
			// 	reelayCreator: reelay.creator.username,
            //     title: reelay.title,
            // });
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