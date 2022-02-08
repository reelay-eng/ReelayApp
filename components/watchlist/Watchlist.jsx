import React, { useContext, useEffect, useState } from 'react';
import { Pressable, FlatList, RefreshControl, ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { refreshMyWatchlist } from '../../api/ReelayUserApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';

import moment from 'moment';

export default Watchlist = ({ category, navigation, refresh, watchlistItems }) => {
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
        setRefreshing(true);
        const refreshedWatchlistItems = await refreshMyWatchlist(cognitoUser?.attributes?.sub);
        const sortedWatchlistItems = refreshedWatchlistItems.sort(byDateUpdated);
        setMyWatchlistItems(sortedWatchlistItems);
        setRefreshing(false);
    }

    const renderWatchlistItem = ({ item, index }) => {
        return (
            <WatchlistSwipeableRow key={item.id} 
                    category={category}
                    navigation={navigation} 
                    onRefresh={onRefresh}
                    watchlistItem={item}>
                <WatchlistItemContainer key={item?.id} onPress={() => {
                    navigation.push('TitleDetailScreen', { titleObj: item.title });
                }}>
                    <WatchlistItem category={category} navigation={navigation} watchlistItem={item} />
                </WatchlistItemContainer>
            </WatchlistSwipeableRow>
        );
    }

    useEffect(() => {
        if (refresh) onRefresh();
    }, []);

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
            <FlatList 
                data={uniqueWatchlistItems}
                horizontal={false}
                keyExtractor={item => String(item.id)}
                pagingEnabled={false}
                renderItem={renderWatchlistItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                style={{ 
                    height: '100%', 
                    marginTop: 16, 
                    marginBottom: 180,
                }}
            />
        </View>
    );
}