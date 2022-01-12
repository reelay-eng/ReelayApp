import React, { memo, useContext } from 'react';
import { Image, Pressable, View, SafeAreaView } from 'react-native';
import { getPosterURL } from '../../api/TMDbApi';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import styled from 'styled-components/native';
import * as Amplitude from 'expo-analytics-amplitude';

const areEqual = (title1, title2) => title1.id === title2.id;

export default Poster = memo(({ title }) => {

	const PosterContainer = styled(View)`
		z-index: 3;
	`
	const PosterImage = styled(Image)`
		height: 120px;
		width: 80px;
		margin-top: 10px;
		margin-bottom: 10px;
		border-radius: 8px;
	`;

	if (!title) {
		return (<View />);
	}

	const posterImageSource = getPosterURL(title.posterURI);

	return (
		<SafeAreaView>
			<PosterContainer>
				{ posterImageSource && <PosterImage source={{ uri: posterImageSource }} />}
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);