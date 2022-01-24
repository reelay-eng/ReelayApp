import React from 'react';
import { View } from 'react-native';

import UserReelayFeed from '../../components/home/FixedReelayStack';
import styled from 'styled-components/native';

export default SingleReelayScreen = ({ navigation, route }) => {
    const { preparedReelay } = route.params;

    const TitleFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    return (
        <TitleFeedContainer>
            <UserReelayFeed 
                navigation={navigation} 
                initialStackPos={0} 
                fixedStackList={[[preparedReelay]]} 
            />
        </TitleFeedContainer>
    );
}
