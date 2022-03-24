import React, { memo } from 'react';
import { Image, View, SafeAreaView } from 'react-native';

import styled from 'styled-components/native';

const areEqual = (title1, title2) => title1.id === title2.id;

export default Poster = memo(({ title }) => {

	const PosterContainer = styled(View)`
		z-index: 3;
	`
	const PosterImage = styled(Image)`
		border-radius: 8px;
		width: 60px;
		height: 90px;
		margin: 5px;
	`;

    const changeSize = (sourceURI, newSizeIndex) => {
		if (!(sourceURI?.uri)) return sourceURI;
        const sizes=['w92', 'w154', 'w185', 'w342', 'w500', 'w780']
        var uriArr = sourceURI.uri.split('/');
        uriArr[5] = sizes[newSizeIndex];
        return {uri: uriArr.join('/')}
    }

	if (!title) {
		return (<View />);
	}

	return (
		<SafeAreaView>
			<PosterContainer>
				{ <PosterImage source={changeSize(title.posterSource, 1)} /> }
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);
