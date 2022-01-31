import React, { useContext, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { addToMyWatchlist, removeFromMyWatchlist } from '../../api/WatchlistApi';

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

    const removeFromLocalWatchlist = () => {
        const nextWatchlistItems = myWatchlistItems.filter((nextItem) => {
            const { tmdbTitleID, titleType } = nextItem;
            const isSeries = (titleType === 'tv');
            return !((tmdbTitleID === titleObj.id) && (isSeries === titleObj.isSeries));    
        });
        setMyWatchlistItems(nextWatchlistItems);
    }

    const addOrRemoveFromWatchlist = async () => {
        const titleType = titleObj.isSeries ? 'tv' : 'film';
        const tmdbTitleID = titleObj.id;

        if (isAdded) {
            // remove from watchlist
            const dbResult = await removeFromMyWatchlist(reelayDBUser?.sub, tmdbTitleID, titleType);
            if (!dbResult.error) {
                removeFromLocalWatchlist();
                setIsAdded(false);
            }
            console.log(dbResult);    
        } else {
            // add to watchlist
            const dbResult = await addToMyWatchlist(reelayDBUser?.sub, tmdbTitleID, titleType);
            if (!dbResult.error) {
                const nextWatchlistItems = [...myWatchlistItems, dbResult];
                setMyWatchlistItems(nextWatchlistItems);
                setIsAdded(true);
            }
            console.log(dbResult);    
        }
    }

    return (
        <Pressable onPress={addOrRemoveFromWatchlist}>
            <Image source={(isAdded) ? WatchlistIconAdded : WatchlistIconNotAdded} style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
            }} />
        </Pressable>
    );
}