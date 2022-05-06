import React, { useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import ClubBanner from '../../components/clubs/ClubBanner';

const ActivityScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`

export default ClubFeedScreen = ({ navigation, route }) => {
    const { club } = route.params;
    return (
        <ActivityScreenContainer>
            <ClubBanner club={club} navigation={navigation} />
        </ActivityScreenContainer>
    );
}