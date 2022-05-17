import React from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import FixedReelayFeed from '../../components/feed/FixedReelayFeed';
import styled from 'styled-components/native';

export default TitleFeedScreen = ({ navigation, route }) => {
    const TitleFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `

    const { initialStackPos, fixedStackList } = route.params;
    const dispatch = useDispatch();

    useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: true });
	});

    return (
        <TitleFeedContainer>
            <FixedReelayFeed 
                navigation={navigation} 
                initialStackPos={initialStackPos} 
                fixedStackList={fixedStackList} 
            />
        </TitleFeedContainer>
    );
}