import React, { useContext, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { addToMyWatchlist } from '../../api/WatchlistApi';

const ICON_SIZE = 30;

import WatchlistIconAdded from '../../assets/icons/global/watchlist-added-icon.png';
import WatchlistIconNotAdded from '../../assets/icons/global/watchlist-icon-filled.png';

export default AddToWatchlistButton = ({ titleObj }) => {
    const { reelayDBUser, myWatchlistItems, setMyWatchlistItems } = useContext(AuthContext);

    const titleSeen = !!myWatchlistItems.find((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    });

    const [isAdded, setIsAdded] = useState(titleSeen); // check if it's actually added

    const addToWatchlist = async () => {
        const titleType = titleObj.isSeries ? 'tv' : 'film';
        const tmdbTitleID = titleObj.id;

        const dbResult = await addToMyWatchlist(reelayDBUser?.sub, tmdbTitleID, titleType);
        if (!dbResult.error) {
            const nextWatchlistItems = [...myWatchlistItems, dbResult];
            setMyWatchlistItems(nextWatchlistItems);
            setIsAdded(true);
        }
        console.log(dbResult);    
    }

    return (
        <Pressable onPress={addToWatchlist} disabled={isAdded}>
            <Image source={(isAdded) ? WatchlistIconAdded : WatchlistIconNotAdded} style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
            }} />
        </Pressable>
    );
}