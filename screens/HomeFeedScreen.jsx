import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';

import ReelayFeed from '../components/home/ReelayFeed';
import { SafeAreaView } from 'react-native-safe-area-context';

const TransparentContainer = styled.View`
	flex: 1;
	background: transparent;
`

export default function HomeFeedScreen({ navigation }) {
	return (
		<SafeAreaView>
			<StatusBar
				translucent
				backgroundColor='black'
			/>
			<TransparentContainer>
				<ReelayFeed navigation={navigation} />
			</TransparentContainer>
		</SafeAreaView>
	)
};