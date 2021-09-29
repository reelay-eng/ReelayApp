import React, { memo, useContext } from 'react';
import { Image, Pressable, View, SafeAreaView } from 'react-native';
import { getPosterURI } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import { VenueIcon } from '../utils/VenueIcon';

import styled from 'styled-components/native';
import * as Amplitude from 'expo-analytics-amplitude';

export default Poster = ({ reelay }) => {

	const PosterContainer = styled(Pressable)`
		z-index: 3;
	`
	const PosterImage = styled(Image)`
		height: 180px;
		width: 120px;
		margin-top: 10px;
		margin-bottom: 10px;
		border-radius: 8px;
	`
	const VenueIconContainer = styled(View)`
		align-self: flex-end;
		margin-top: 10px;
		position: absolute;
	`
	const authContext = useContext(AuthContext);
	const {
		overlayVisible,
		setOverlayData,
		setOverlayVisible,
	} = useContext(VisibilityContext);

	if (!reelay) return (<View />);
	const posterImageUri = getPosterURI(reelay.posterURI);

	const onPosterPress = () => {
		if (overlayVisible) {
			setOverlayVisible(false);
			Amplitude.logEventWithPropertiesAsync('closedOverlay', {
                username: authContext.user.username,
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
                title: reelay.title,
            });
		} else {
			setOverlayData({
				type: 'TITLE',
				reelay: reelay,
			});
			setOverlayVisible(true);	
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
				{posterImageUri && <PosterImage source={{ uri: posterImageUri }} />}
				{reelay.venue && (
					<VenueIconContainer>
						<VenueIcon size={24} venue={reelay.venue} borderRadius={8} />
					</VenueIconContainer>
				)}
			</PosterContainer>
		</SafeAreaView>
	);
};