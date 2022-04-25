import React, { useContext, useEffect } from 'react';
import TopicsFeed from '../../components/topics/TopicsFeed';
import styled from 'styled-components/native';

export default function TopicsFeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `
    const initTopicIndex = route?.params?.initTopicIndex;

    return (
        <TransparentContainer>
            {/* <ReelayFeed
                initialFeedSource={'topics'}
                initialStackPos={0}
                initialFeedPos={globalTopicIndex}
                isOnFeedTab={false}
                navigation={navigation}
                preloadedStackList={globalStacks}
            /> */}
            <TopicsFeed
                initTopicIndex={initTopicIndex}
                navigation={navigation}
            />
        </TransparentContainer>
    );
};
