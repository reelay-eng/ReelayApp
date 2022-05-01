import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import FixedReelayFeed from '../../components/feed/FixedReelayFeed';
import styled from 'styled-components/native';

import { getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { getSingleTopic } from '../../api/TopicsApi';

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
    const { preparedReelay, reelaySub } = route.params;
    const [singleReelay, setSingleReelay] = useState(preparedReelay);
    const [topic, setTopic] = useState(null);

    const loadSingleReelay = async () => {
        const fetchedReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(fetchedReelay);  
        setSingleReelay(preparedReelay);

        if (preparedReelay.topicID) {
            const topicObj = await getSingleTopic(preparedReelay.topicID);
            setTopic(topicObj);
            // todo: tappable banner directing you to single topic feed
        }
    }

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
                initialStackPos={0} 
                navigation={navigation} 
            />
        </TitleFeedContainer>
    );
}
