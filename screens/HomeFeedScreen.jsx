import React, { useContext, useEffect } from 'react';
import ReelayFeed from '../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default function HomeFeedScreen({ navigation, route }) {

	const TransparentContainer = styled.View`
		flex: 1;
		background-color: black;
	`
	let refreshIndex = 0;
	if (route && route.params) {
		const { refreshCount } = route.params;
		refreshIndex = refreshCount;
	}

	useEffect(() => {
		// const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', e => {
		// 	e.preventDefault();
        //     console.log('on tab press');
        // });
		// return unsubscribe;
	}, [navigation]);

	return (
		<TransparentContainer>
			<ReelayFeed navigation={navigation} refreshIndex={refreshIndex} />
		</TransparentContainer>
	)
};