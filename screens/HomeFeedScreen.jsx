import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';

import Header from '../components/home/Header';
import ReelayFeed from '../components/home/ReelayFeed';
import { SafeAreaView } from 'react-native-safe-area-context';

const TransparentContainer = styled.View`
	flex: 1;
	background: transparent;
`

export default function HomeFeedScreen({ navigation }) {
	const [isFocused, setIsFocused] = useState(false);

	useEffect(() => {
		const focusUnsubscribe = navigation.addListener('focus', () => {
			setIsFocused(true);
			console.log('on home feed screen');
		});
		const blurUnsubscribe = navigation.addListener('blur', () => {
			setIsFocused(false);
			console.log('not focused on home feed screen');
		});
		// return the cleanup function
		// fetch reelays every time the user navigates back to this tab
		return () => {
			focusUnsubscribe();
			blurUnsubscribe();
		}
	}, [navigation]);

	return (
		<SafeAreaView>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<TransparentContainer>
				<Header />
				<ReelayFeed navigation={navigation} isFocused={isFocused} />
			</TransparentContainer>
		</SafeAreaView>
	)
};