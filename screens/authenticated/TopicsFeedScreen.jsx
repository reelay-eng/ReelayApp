import React, { useContext, useEffect } from 'react';
import TopicsFeed from '../../components/topics/TopicsFeed';
import styled from 'styled-components/native';

export default function TopicsFeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `
    const initTopicIndex = route?.params?.initTopicIndex;
    const showTabBarOnReturn = route?.params?.showTabBarOnReturn ?? true;

    return (
        <TransparentContainer>
            <TopicsFeed
                initTopicIndex={initTopicIndex}
                navigation={navigation}
                showTabBarOnReturn={showTabBarOnReturn}
            />
        </TransparentContainer>
    );
};
