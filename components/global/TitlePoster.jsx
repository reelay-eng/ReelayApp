import React, { memo, useState } from 'react';
import { ActivityIndicator, Image, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { getTitlePosterURI } from '../../api/ReelayLocalImageCache';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/native';
import Constants from 'expo-constants';

const canUseFastImage = (Constants.appOwnership !== 'expo');

const MAX_BORDER_RADIUS = 16;
const PLACEHOLDER_POSTER_SOURCE = require('../../assets/images/reelay-splash-with-dog-black.png');
const WELCOME_VIDEO_POSTER_SOURCE = require('../../assets/images/welcome-video-poster-with-dog.png');

const TitlePoster = ({ onLoad = () => {}, title, onPress, width = 60 }) => {
    const borderRadius = Math.min(width / 10, MAX_BORDER_RADIUS);
    const height = width * 1.5;
    const style = { borderRadius, height, width };

    const source = {
        uri: getTitlePosterURI(title?.posterPath, false),
        priority: FastImage.priority.normal,
    }

	const PosterContainer = (onPress) 
        ? styled(TouchableOpacity)`
            z-index: 3;
        `
        : styled(View)`
            z-index: 3;
    `
	const PosterImage = styled(Image)`
		border-radius: ${borderRadius}px;
        height: ${height}px;
		width: ${width}px;
	`

    if (!title) return <View />;
    if (canUseFastImage && title?.posterPath) {
        return (
            <PosterContainer onPress={onPress}>
                <FastImage source={source} style={style} />
            </PosterContainer>
        );    
    }

    const [loadState, setLoadState] = useState('local');

    const getTitlePosterSource = () => {
        if (title?.posterSource === PLACEHOLDER_POSTER_SOURCE) return PLACEHOLDER_POSTER_SOURCE;
        if (title?.posterSource === WELCOME_VIDEO_POSTER_SOURCE) return WELCOME_VIDEO_POSTER_SOURCE;
        if (loadState === 'local') {
            return { uri: getTitlePosterURI(title?.posterPath, true) };
        } else if (loadState === 'remote') {
            return { uri: getTitlePosterURI(title?.posterPath, false) };
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
                    onLoadEnd={onLoad}
                    source={getTitlePosterSource()}
                    PlaceholderContent={<ActivityIndicator />}
                    onError={onLoadError}
                /> }
			</PosterContainer>
		</SafeAreaView>
	);
};

const areEqual = (title1, title2) => {
    return title1.id === title2.id;
}

export default memo(TitlePoster, areEqual);