import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import FixedReelayFeed from '../../components/feed/FixedReelayFeed';
import styled from 'styled-components/native';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

const LoadingContainer = styled(View)`
    align-items: center;
    justify-content: center;
    background-color: black;
    height: 100%;
    width: 100%;
`
const TitleFeedContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
`

export default SingleReelayScreen = ({ navigation, route }) => {
    const preparedReelay = route.params?.preparedReelay;
    const reelaySub = route.params?.reelaySub ?? preparedReelay?.sub;
    
    const dispatch = useDispatch();
    const [singleReelay, setSingleReelay] = useState(preparedReelay);

    const loadSingleReelay = async () => {
        const fetchedReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(fetchedReelay);  
        setSingleReelay(preparedReelay);
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    useEffect(() => {
        if (!singleReelay) loadSingleReelay();
    }, []);

    if (!singleReelay) {
        return (
            <LoadingContainer>
                <ActivityIndicator />
            </LoadingContainer>
        );
    }

    return (
        <TitleFeedContainer>
            <FixedReelayFeed 
                fixedStackList={[[singleReelay]]} 
                feedSource='single'
                initialStackPos={0} 
                navigation={navigation} 
            />
        </TitleFeedContainer>
    );
}
