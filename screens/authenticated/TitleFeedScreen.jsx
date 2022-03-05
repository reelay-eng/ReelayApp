import React from 'react';
import { View } from 'react-native';

import FixedReelayStack from '../../components/feed/FixedReelayStack';
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
            <FixedReelayStack 
                navigation={navigation} 
                initialStackPos={initialStackPos} 
                fixedStackList={fixedStackList} 
            />
        </TitleFeedContainer>
    );
}