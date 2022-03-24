import React, { memo } from 'react';
import { Image, View, SafeAreaView } from 'react-native';
import { changeSize } from '../../api/TMDbApi';

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

	if (!title) {
		return (<View />);
	}

	return (
		<SafeAreaView>
			<PosterContainer>
				{ <PosterImage source={changeSize(title.posterSource, 'w154')} /> }
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);
