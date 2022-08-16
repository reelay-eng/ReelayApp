import React from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import { useSelector } from 'react-redux';

export default function FeedScreen({ navigation, route }) {
    const myStacksGlobal = useSelector(state => state.myHomeContent?.global);
    const initialFeedSource = route?.params?.initialFeedSource ?? 'global';
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const forceRefresh = route?.params?.forceRefresh ?? null;
    const pinnedReelay = route?.params?.pinnedReelay ?? null;
    const preloadedStackList = route?.params?.preloadedStackList ?? myStacksGlobal;

    return (
        <ReelayFeed
            forceRefresh={forceRefresh}
            initialFeedSource={initialFeedSource}
            initialStackPos={initialStackPos}
            initialFeedPos={initialFeedPos}
            navigation={navigation}
            pinnedReelay={pinnedReelay}
            preloadedStackList={preloadedStackList}
        />
    );
};