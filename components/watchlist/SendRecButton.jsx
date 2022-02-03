import React, { useContext, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';

const ICON_SIZE = 30;

export default SendRecButton = ({ navigation, titleObj, reelay }) => {
    const { myWatchlistItems } = useContext(AuthContext);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    const advanceToRecommendScreen = () => {
        const myReelayWatchlistItem = myWatchlistItems.find((nextItem) => {
            const { tmdbTitleID, titleType, hasSeenTitle } = nextItem;
            const isSeries = (titleType === 'tv');

            return (tmdbTitleID === titleObj.id) 
                && (isSeries === titleObj.isSeries)
                && (hasSeenTitle === true);
        });

        navigation.push('SendRecScreen', {
            reelay,
            // TODO: the fallback value is a hack to match the existing route params to the send rec screen
            // from SwipeableRow. It deserves a refactor, especially considering this breaks
            // if SendRecScreen decides it needs more data from watchlistItem that we're not
            // sending over
            watchlistItem: myReelayWatchlistItem ?? {
                title: titleObj,
                tmdbTitleID: titleObj.id,
                titleType: (titleObj.isSeries) ? 'tv' : 'film',
            },
        });
    }

    return (
        <Pressable onPress={advanceToRecommendScreen}>
            <Icon type='ionicon' name='paper-plane' color='white' size={ICON_SIZE} />
        </Pressable>
    );
}
