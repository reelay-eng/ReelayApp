import React from 'react';
import ReelayFeed from '../../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default function HomeFeedScreen({ navigation, route }) {

	const TransparentContainer = styled.View`
		flex: 1;
		background-color: black;
	`

	const forceRefresh = route?.params?.forceRefresh;
	console.log('force refresh: ', forceRefresh);
	
	return (
		<TransparentContainer>
			<ReelayFeed forceRefresh={forceRefresh} navigation={navigation} />
		</TransparentContainer>
	)
};