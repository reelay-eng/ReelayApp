import React from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import styled from 'styled-components/native';

export default function FeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `

    // valid feed sources: [global, following, theaters, streaming, festivals]
    const initialFeedSource = route?.params?.initialFeedSource;
    const initialStackPos = route?.params?.initialStackPos;
    const initialFeedPos = route?.params?.initialFeedPos;
    const isOnFeedTab = route?.params?.isOnFeedTab;
    const forceRefresh = route?.params?.forceRefresh;
    const pinnedReelay = route?.params?.pinnedReelay;
    const preloadedStackList = route?.params?.preloadedStackList;

    console.log('Feed screen is rendering');

    return (
        <TransparentContainer>
            <ReelayFeed
                forceRefresh={forceRefresh}
                initialFeedSource={initialFeedSource ?? 'global'}
                initialStackPos={initialStackPos ?? 0}
                initialFeedPos={initialFeedPos ?? 0}
                isOnFeedTab={isOnFeedTab ?? true}
                navigation={navigation}
                pinnedReelay={pinnedReelay}
                preloadedStackList={preloadedStackList}
            />
        </TransparentContainer>
    );
};