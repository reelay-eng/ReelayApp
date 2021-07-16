import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components/native';

import ReelayFeed from '../components/home/ReelayFeed';

const TransparentContainer = styled.View`
	flex: 1;
	background: transparent;
`

export default function HomeFeedScreen({ navigation }) {
	return (
			<TransparentContainer>
				<ReelayFeed navigation={navigation} />
			</TransparentContainer>
	)
};