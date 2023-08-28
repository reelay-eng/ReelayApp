import React from 'react';
import ReelayFeed from '../../components/feed/ReelayFeed';
import { useSelector } from 'react-redux';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';

export default function FeedScreen({ navigation, route }) {
    try {
        firebaseCrashlyticsLog('feed screen mounted');
        const feedSource = route?.params?.feedSource ?? 'discover';
        const initialFeedFilters = route?.params?.initialFeedFilters ?? [];
        const initialFeedPos = route?.params?.initialFeedPos ?? 0;
        const initialStackPos = route?.params?.initialStackPos ?? 0;
        const forceRefresh = route?.params?.forceRefresh ?? null;
        const pinnedReelay = route?.params?.pinnedReelay ?? null;
        const preloadedStackList = route?.params?.preloadedStackList ?? [];

        return (
            <ReelayFeed
                forceRefresh={forceRefresh}
                feedSource={feedSource}
                initialFeedFilters={initialFeedFilters}
                initialFeedPos={initialFeedPos}
                initialStackPos={initialStackPos}
                navigation={navigation}
                pinnedReelay={pinnedReelay}
                preloadedStackList={preloadedStackList}
            />
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};