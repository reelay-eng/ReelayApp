import React from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';

export default function FeedScreen({ navigation, route }) {
    const TransparentContainer = styled.View`
        flex: 1;
        background-color: black;
    `
    const myStacksGlobal = useSelector(state => state.myDiscoverContent?.global);
    // valid feed sources: [global, following, theaters, streaming, festivals]
    const initialFeedSource = route?.params?.initialFeedSource ?? 'global';
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const forceRefresh = route?.params?.forceRefresh ?? null;
    const pinnedReelay = route?.params?.pinnedReelay ?? null;
    const preloadedStackList = route?.params?.preloadedStackList ?? myStacksGlobal;

    console.log('Feed screen is rendering');

    return (
        <TransparentContainer>
            <ReelayFeed
                forceRefresh={forceRefresh}
                initialFeedSource={initialFeedSource}
                initialStackPos={initialStackPos}
                initialFeedPos={initialFeedPos}
                navigation={navigation}
                pinnedReelay={pinnedReelay}
                preloadedStackList={preloadedStackList}
            />
        </TransparentContainer>
    );
};