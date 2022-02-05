import React, { useContext, useState, useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems } from '../../api/WatchlistApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';

import moment from 'moment';

export default Watchlist = ({ navigation, watchlistItems, category }) => {

    const ROW_HEIGHT = 125;
    const WatchlistItemContainer = styled(Pressable)`
        background-color: black;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `
    const ScrollContainer = styled(ScrollView)`
        margin-top: 16px;
        margin-bottom: 180px;
    `
    const [refreshing, setRefreshing] = useState(false);
    const { cognitoUser, setMyWatchlistItems } = useContext(AuthContext);

    const byDateUpdated = (watchlistItem0, watchlistItem1) => {
        const dateAdded0 = moment(watchlistItem0.updatedAt);
        const dateAdded1 = moment(watchlistItem1.updatedAt);
        return dateAdded1.diff(dateAdded0, 'seconds');
    }

    const onRefresh = async () => {
        const refreshedWatchlistItems = await getWatchlistItems(cognitoUser?.attributes?.sub);
        const sortedWatchlistItems = refreshedWatchlistItems.sort(byDateUpdated);
        setMyWatchlistItems(sortedWatchlistItems);
    }

    // compress duplicate watchlist items by title, keeping their accumuluated recs
    // in a new `recommendations` field
    const sortedWatchlistItems = watchlistItems.sort(byDateUpdated);
    const uniqueWatchlistItems = sortedWatchlistItems.filter((nextItem, index, allItems) => {
        const { recommendedBySub, recommendedByUsername, recommendedReelaySub, title } = nextItem;
        let nextItemHasUniqueTitle = true;
        let prevItemSameTitle = null;

        const isSameTitle = (title0, title1) => {
            return (title0.id === title1.id) 
                && (title0.isSeries === title1.isSeries);
        }

        // check all previous watchlist items
        allItems.slice(0, index).forEach((prevItem) => {
            // filter out items for the same title...
            if (isSameTitle(prevItem.title, title)) {
                nextItemHasUniqueTitle = false;
                prevItemSameTitle = prevItem;
            }
        });

        if (nextItemHasUniqueTitle) {
            nextItem.recommendations = [];
        }

        const recItem = (nextItemHasUniqueTitle) ? nextItem : prevItemSameTitle;
        if (recommendedBySub) {
            recItem.recommendations.push({ recommendedBySub, recommendedByUsername, recommendedReelaySub });
        }
        return nextItemHasUniqueTitle;
    });

    return (
        <View style={{height: '100%'}}>
            <ScrollContainer style={{height: '100%'}}  refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                { uniqueWatchlistItems?.length >= 1 &&
                    <React.Fragment>
                        { uniqueWatchlistItems.map((nextItem) => {
                            return (
                                <WatchlistSwipeableRow key={nextItem.id} 
                                        category={category}
                                        navigation={navigation} 
                                        onRefresh={onRefresh}
                                        watchlistItem={nextItem}>
                                    <WatchlistItemContainer key={nextItem?.id} onPress={() => {
                                        navigation.push('TitleDetailScreen', { titleObj: nextItem.title });
                                    }}>
                                        <WatchlistItem category={category} navigation={navigation} watchlistItem={nextItem} />
                                    </WatchlistItemContainer>
                                </WatchlistSwipeableRow>
                            );
                        })}
                    </React.Fragment>
                }
            </ScrollContainer>
        </View>
    );
}