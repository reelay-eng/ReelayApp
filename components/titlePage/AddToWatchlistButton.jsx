import React, { useContext, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { addToMyWatchlist } from '../../api/WatchlistApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const ICON_SIZE = 22;

import WatchlistIconAdded from '../../assets/icons/global/watchlist-added-icon.png';
import WatchlistIconNotAdded from '../../assets/icons/global/watchlist-icon-filled.png';
import { showMessageToast } from '../utils/toasts';

export default AddToWatchlistButton = ({ titleObj, reelay }) => {
    const { reelayDBUser, myWatchlistItems, setMyWatchlistItems } = useContext(AuthContext);

    const inWatchlist = !!myWatchlistItems.find((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    });

    const [isAdded, setIsAdded] = useState(inWatchlist);

    const addToWatchlist = async () => {
        setIsAdded(true);
        const titleType = titleObj.isSeries ? 'tv' : 'film';
        const tmdbTitleID = titleObj.id;
        const reqBody = { reqUserSub: reelayDBUser?.sub, tmdbTitleID, titleType };

        if (reelay?.sub) {
            reqBody.reelaySub = reelay.sub;
            reqBody.creatorName = reelay.creator.username;
        }
        
        const dbResult = await addToMyWatchlist(reqBody);
        if (!dbResult.error) {
            const nextWatchlistItems = [...myWatchlistItems, dbResult];
            setMyWatchlistItems(nextWatchlistItems);
            showMessageToast('Added to your watchlist');

            logAmplitudeEventProd('addToMyWatchlist', {
                username: reelayDBUser?.username,
                creatorName: reelay?.creator?.username,
                title: titleObj.display,
                source: 'sendRecScreen',
            });
        }
    }
    // new icon type : "reorder-three"
    return (
        <Pressable onPress={addToWatchlist} disabled={isAdded}>
            <Image source={(isAdded) ? WatchlistIconAdded : WatchlistIconNotAdded} style={{
                height: ICON_SIZE,
                width: ICON_SIZE,
                marginBottom: 2,
            }} />
        </Pressable>
    );
}