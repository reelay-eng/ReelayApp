import React, { useContext, useEffect } from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import styled from 'styled-components/native';

export default function FeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `
    const forceRefresh = route?.params?.forceRefresh;

    // valid feed sources: [global, following, theaters, streaming, festivals]
    const initialFeedSource = route?.params?.initialFeedSource;
    const initialStackPos = route?.params?.initialStackPos;
    const initialFeedPos = route?.params?.initialFeedPos;
    const isOnFeedTab = route?.params?.isOnFeedTab;

    return (
        <TransparentContainer>
            <ReelayFeed
                forceRefresh={forceRefresh}
                initialFeedSource={initialFeedSource ?? 'global'}
                initialStackPos={initialStackPos ?? 0}
                initialFeedPos={initialFeedPos ?? 0}
                isOnFeedTab={isOnFeedTab ?? true}
                navigation={navigation}
            />
        </TransparentContainer>
    );
};