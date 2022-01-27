import React from 'react';
import { ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';

export default Watchlist = ({ navigation, watchlistItems, source }) => {

    const ROW_HEIGHT = 165
    const WatchlistItemContainer = styled(View)`
        height: ${ROW_HEIGHT}px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `

    const ScrollContainer = styled(ScrollView)`
        margin-bottom: ${ROW_HEIGHT + 105}px;
    `;

    const addUniqueWatchlistItem = (nextItem, index, allItems) => {
        const { 
            recommendedBySub,
            recommendedReelaySub,
            title, 
            tmdbTitleID, 
            titleType 
        } = nextItem;

        const isSameTitle = (title0, title1) => {
            return (title0.id === title1.id) 
                && (title0.isSeries === title1.isSeries);
        }

        let nextItemHasUniqueTitle = true;
        allItems.slice(0, index).forEach((prevItem) => {
            console.log('PREV ITEM: ', prevItem);
            if (isSameTitle(prevItem.title, title)) {
                nextItemHasUniqueTitle = false;
            }
        });

        if (nextItemHasUniqueTitle) {
            nextItem.recommendations = [];
        }

        if (recommendedBySub) {
            nextItem.recommendations.push({
                recommendedBySub,
                recommendedReelaySub,
            })
        } 

        return nextItemHasUniqueTitle;
    }

    const uniqueWatchlistItems = watchlistItems.filter(addUniqueWatchlistItem);

    console.log('unique watchlist items: ', uniqueWatchlistItems);

    return (
        <View>
            { uniqueWatchlistItems?.length >= 1 &&
                <ScrollContainer>
                    { uniqueWatchlistItems.map((item) => {
                        return (
                            <WatchlistItemContainer key={item?.id}>
                                <WatchlistItem navigation={navigation} watchlistItem={item} source={source} />
                            </WatchlistItemContainer>
                        );
                    })}
                </ScrollContainer>
            }
        </View>
    );
}