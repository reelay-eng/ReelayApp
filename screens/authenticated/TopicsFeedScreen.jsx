import React, { useContext, useEffect } from 'react';
import TopicsFeed from '../../components/topics/TopicsFeed';
import styled from 'styled-components/native';

export default TopicsFeedScreen = ({ navigation, route }) => {
    const FeedContainer = styled.View`
        flex: 1;
        background-color: black;
    `
    const initTopicIndex = route.params?.initTopicIndex ?? 0;
    const initReelayIndex = route.params?.initReelayIndex ?? 0;
    const preloadedTopics = route.params?.preloadedTopics ?? null;
    const creatorOnProfile = route.params?.creatorOnProfile ?? null;
    const topicsOnProfile = route.params?.topicsOnProfile ?? null;
    const source = route.params?.source ?? 'discoverNew';

    return (
        <FeedContainer>
            <TopicsFeed
                initTopicIndex={initTopicIndex}
                initReelayIndex={initReelayIndex}
                navigation={navigation}
                preloadedTopics={preloadedTopics}
                source={source}
                creatorOnProfile={creatorOnProfile}
                topicsOnProfile={topicsOnProfile}
            />
        </FeedContainer>
    );
};
