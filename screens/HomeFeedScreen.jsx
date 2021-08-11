import React, { useContext } from 'react';
import ReelayFeed from '../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default function HomeFeedScreen({ navigation }) {

	const TransparentContainer = styled.View`
		flex: 1;
		background-color: black;
	`

	return (
			<TransparentContainer>
				<ReelayFeed navigation={navigation} />
			</TransparentContainer>
	)
};