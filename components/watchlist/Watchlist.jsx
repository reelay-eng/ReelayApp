import React, { useContext, useEffect, useState } from 'react';
import { Pressable, FlatList, RefreshControl, ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { refreshMyWatchlist } from '../../api/ReelayUserApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';
import { RecommendedByLine, ReelayedByLine } from './RecPills';

import moment from 'moment';

export default Watchlist = ({ category, navigation, refresh, watchlistItems }) => {
    const WatchlistItemContainer = styled(Pressable)`
        background-color: #1c1c1c;
        border-color: #2d2d2d;
        border-radius: 8px;
        border-width: 0.3px;
        margin: 10px;
    `
    const WatchlistItemSeparator = styled(View)`
        height: 12px;
    `
    const [refreshing, setRefreshing] = useState(false);
    const { reelayDBUser, setMyWatchlistItems } = useContext(AuthContext);

    const byDateUpdated = (watchlistItem0, watchlistItem1) => {
        const dateAdded0 = moment(watchlistItem0.updatedAt);
        const dateAdded1 = moment(watchlistItem1.updatedAt);
        return dateAdded1.diff(dateAdded0, 'seconds');
    }

    const onRefresh = async () => {
        const refreshedWatchlistItems = await refreshMyWatchlist(reelayDBUser?.sub);
        const sortedWatchlistItems = refreshedWatchlistItems.sort(byDateUpdated);
        setMyWatchlistItems(sortedWatchlistItems);
    }

    useEffect(() => {
        if (refresh) onRefresh();
    }, []);

    const renderWatchlistItem = ({ item, index }) => {
        return (
            <React.Fragment>
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
                { renderWatchlistItemUnderContainer(item) }
            </React.Fragment>
        );
    }

    const renderWatchlistItemUnderContainer = (item) => {
        const shouldRenderUnderContainer = (item.recommendations.length > 0) || (!!item.recommendedReelaySub);
        if (shouldRenderUnderContainer) {
            return (
                <React.Fragment>
                    { item.recommendations.length > 0 && 
                        <RecommendedByLine navigation={navigation} watchlistItem={item} /> 
                    }
                    { !!item.recommendedReelaySub && 
                        <ReelayedByLine navigation={navigation} watchlistItem={item} />
                    }
                    <WatchlistItemSeparator />
                </React.Fragment>
            );
        } else {
            return <React.Fragment />
        }
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
            try {
                recItem.recommendations.push({ recommendedBySub, recommendedByUsername, recommendedReelaySub });
            } catch (error) {
                console.log('Could not push: ', nextItemHasUniqueTitle);
                console.log(error);
            }
        }
        return nextItemHasUniqueTitle;
    });

    return (
        <View style={{height: '100%'}}>
            <FlatList 
                data={uniqueWatchlistItems}
                horizontal={false}
                keyboardShouldPersistTaps={"handled"}
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