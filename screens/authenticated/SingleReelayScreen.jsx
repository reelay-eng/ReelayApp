import React from 'react';
import { View } from 'react-native';

import FixedReelayStack from '../../components/feed/FixedReelayStack';
import styled from 'styled-components/native';

export default SingleReelayScreen = ({ navigation, route }) => {
    const { openCommentsOnLoad = false, preparedReelay } = route.params;

    const TitleFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    // todo: logic for openCommentsOnLoad
    
    return (
        <TitleFeedContainer>
            <FixedReelayStack 
                fixedStackList={[[preparedReelay]]} 
                initialStackPos={0} 
                navigation={navigation} 
            />
        </TitleFeedContainer>
    );
}
