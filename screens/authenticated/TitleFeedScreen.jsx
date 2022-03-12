import React from 'react';
import { View } from 'react-native';

import FixedReelayFeed from '../../components/feed/FixedReelayFeed';
import styled from 'styled-components/native';

export default TitleFeedScreen = ({ navigation, route }) => {
    const { initialStackPos, fixedStackList } = route.params;
    const TitleFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
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