import React, { memo, useState } from 'react';
import { ActivityIndicator, Image, View, SafeAreaView, Pressable } from 'react-native';
import { getTitlePosterURI } from '../../api/ReelayLocalImageCache';

import styled from 'styled-components/native';

const areEqual = (title1, title2) => title1.id === title2.id;
const MAX_BORDER_RADIUS = 16;
const PLACEHOLDER_POSTER_SOURCE = require('../../assets/images/reelay-splash-with-dog.png');
const WELCOME_VIDEO_POSTER_SOURCE = require('../../assets/images/welcome-video-poster-with-dog.png');

export default TitlePoster = memo(({ title, onPress, width = 60 }) => {
    const [loadState, setLoadState] = useState('local');
	const PosterContainer = (onPress) 
        ? styled(Pressable)`
            z-index: 3;
        `
        : styled(View)`
            z-index: 3;
        `
	const PosterImage = styled(Image)`
		border-radius: ${Math.min(width / 10, MAX_BORDER_RADIUS)}px;
		width: ${width}px;
		height: ${width * 1.5}px;
	`
    if (!title) {
		return (<View />);
	}

    const getTitlePosterSource = () => {
        if (title.posterSource === PLACEHOLDER_POSTER_SOURCE) return PLACEHOLDER_POSTER_SOURCE;
        if (title.posterSource === WELCOME_VIDEO_POSTER_SOURCE) return WELCOME_VIDEO_POSTER_SOURCE;
        if (loadState === 'local') {
            return { uri: getTitlePosterURI(title.posterPath, true) };
        } else if (loadState === 'remote') {
            return { uri: getTitlePosterURI(title.posterPath, false) };
        } else {
            return PLACEHOLDER_POSTER_SOURCE;
        }
    }

    const onLoadError = () => {
        if (loadState === 'local') {
            setLoadState('remote');
        } else if (loadState === 'remote') {
            setLoadState('default');
        }
    }

	return (
		<SafeAreaView>
			<PosterContainer onPress={() => {
                if (onPress) onPress();
            }}>
				{ <PosterImage 
                    source={getTitlePosterSource()}
                    PlaceholderContent={<ActivityIndicator />}
                    onError={onLoadError}
                /> }
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);
