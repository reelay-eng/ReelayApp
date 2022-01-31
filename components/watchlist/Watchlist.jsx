import React, { useContext, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems } from '../../api/WatchlistApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';

export default Watchlist = ({ navigation, watchlistItems, category }) => {

    const ROW_HEIGHT = 125;
    const WatchlistItemContainer = styled(View)`
        background-color: black;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `

    const ScrollContainer = styled(ScrollView)`
        margin-top: 40px;
        margin-bottom: ${ROW_HEIGHT + 105}px;
    `;

    const [refreshing, setRefreshing] = useState(false);
    const { setMyWatchlistItems } = useContext(AuthContext);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    const onRefresh = async () => {
        setRefreshing(true);
        const refreshedWatchlistItems = await getWatchlistItems(cognitoUser?.attributes?.sub);
        setMyWatchlistItems(refreshedWatchlistItems);
        setRefreshing(false);
    }

    // compress duplicate watchlist items by title, keeping their accumuluated recs
    // in a new `recommendations` field
    const uniqueWatchlistItems = watchlistItems.filter((nextItem, index, allItems) => {
        const { recommendedBySub, recommendedReelaySub, title } = nextItem;
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
        } else if (recommendedBySub) {
            // ...but not before adding their recs to an accumulated list
            prevItemSameTitle.recommendations.push({ recommendedBySub, recommendedReelaySub });
        }
        return nextItemHasUniqueTitle;
    });

    return (
        <View>
            {/* <WatchlistSwipeableRow /> */}
            { uniqueWatchlistItems?.length >= 1 &&
                <ScrollContainer refreshControl={refreshControl}>
                    { uniqueWatchlistItems.map((nextItem) => {
                        return (
                            <WatchlistSwipeableRow key={nextItem.id} 
                                    category={category}
                                    navigation={navigation} 
                                    watchlistItem={nextItem}>
                                <WatchlistItemContainer key={nextItem?.id}>
                                    <WatchlistItem category={category} navigation={navigation} watchlistItem={nextItem} />
                                </WatchlistItemContainer>
                            </WatchlistSwipeableRow>
                        );
                    })}
                </ScrollContainer>
            }
        </View>
    );
}