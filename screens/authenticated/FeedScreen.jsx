import React from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import styled from 'styled-components/native';

export default function FeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `

    // valid feed sources: [global, following, theaters, streaming, festivals]
    const initialFeedSource = route?.params?.initialFeedSource ?? 'global';
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const isOnFeedTab = route?.params?.isOnFeedTab ?? true;
    const forceRefresh = route?.params?.forceRefresh ?? null;
    const pinnedReelay = route?.params?.pinnedReelay ?? null;
    const preloadedStackList = route?.params?.preloadedStackList ?? null;

    console.log('Feed screen is rendering');

    return (
        <TransparentContainer>
            <ReelayFeed
                forceRefresh={forceRefresh}
                initialFeedSource={initialFeedSource}
                initialStackPos={initialStackPos}
                initialFeedPos={initialFeedPos}
                isOnFeedTab={isOnFeedTab}
                navigation={navigation}
                pinnedReelay={pinnedReelay}
                preloadedStackList={preloadedStackList}
            />
        </TransparentContainer>
    );
};