import React, { useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import ClubFeed from '../../components/clubs/ClubFeed';

const ActivityScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`

export default ClubFeedScreen = ({ navigation, route }) => {
    const { club } = route.params;
    const initFeedIndex = route?.params?.initFeedIndex ?? 0;
    const initStackIndex = route?.params?.initStackIndex ?? 0;

    return (
        <ActivityScreenContainer>
            <ClubFeed
                club={club}
                initFeedIndex={initFeedIndex}
                initStackIndex={initStackIndex}
                navigation={navigation}
            />
        </ActivityScreenContainer>
    );
}