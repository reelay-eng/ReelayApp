import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';

import ReelayFeed from '../components/home/ReelayFeed';
import ReelayFeed2 from '../components/home/ReelayFeed2';
import { SafeAreaView } from 'react-native-safe-area-context';

const TransparentContainer = styled.View`
	flex: 1;
	background: transparent;
`

export default function HomeFeedScreen({ navigation }) {
	return (
			<TransparentContainer>
				<ReelayFeed2 navigation={navigation} />
			</TransparentContainer>
	)
};