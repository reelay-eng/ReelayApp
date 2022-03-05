import React, { memo } from 'react';
import { Image, View, SafeAreaView } from 'react-native';

import styled from 'styled-components/native';

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

	return (
		<SafeAreaView>
			<PosterContainer>
				{ <PosterImage source={title.posterSource} /> }
			</PosterContainer>
		</SafeAreaView>
	);
}, areEqual);
