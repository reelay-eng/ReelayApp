import React, { useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { addToMyWatchlist, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const ICON_SIZE = 24;

import { AddToWatchlistIconSVG, WatchlistAddedIconSVG } from '../global/SVGs';
import { showMessageToast } from '../utils/toasts';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch } from 'react-redux';

const WatchListButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${({ isAdded }) => (isAdded) ? ReelayColors.reelayBlue : 'rgba(255, 255, 255, 0.40)'};
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const WatchlistButtonOuterContainer = styled(Pressable)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default AddToWatchlistButton = ({ titleObj, reelay }) => {
    const { reelayDBUser, myWatchlistItems, setMyWatchlistItems } = useContext(AuthContext);
    const dispatch = useDispatch();

    const inWatchlist = !!myWatchlistItems.find((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    });
    const [isAdded, setIsAdded] = useState(inWatchlist);

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

    const addToWatchlist = async () => {
        if (showMeSignupIfGuest()) return;
        const titleType = titleObj.isSeries ? 'tv' : 'film';
        const tmdbTitleID = titleObj.id;
        const reqBody = { reqUserSub: reelayDBUser?.sub, tmdbTitleID, titleType };

        if (reelay?.sub) {
            reqBody.reelaySub = reelay.sub;
            reqBody.creatorName = reelay.creator.username;
        }

        if (isAdded) {
            // remove from watchlist
            setIsAdded(false);
            const dbResult = await removeFromMyWatchlist(reqBody);
            if (!dbResult.error) {
                const nextWatchlistItems = myWatchlistItems.filter((nextItem) => {
                    const isRemovedTitle = (nextItem?.tmdbTitleID === tmdbTitleID) && (nextItem?.titleType === titleType);
                    return !isRemovedTitle;
                });
                setMyWatchlistItems(nextWatchlistItems);
                showMessageToast('Removed from your watchlist', 'bottom');
    
                logAmplitudeEventProd('removedFromMyWatchlist', {
                    username: reelayDBUser?.username,
                    creatorName: reelay?.creator?.username,
                    title: titleObj.display,
                    source: 'sendRecScreen',
                });

            }    
        } else {
            // add to watchlist
            setIsAdded(true);
            const dbResult = await addToMyWatchlist(reqBody);
            if (!dbResult.error) {
                const nextWatchlistItems = [...myWatchlistItems, dbResult];
                setMyWatchlistItems(nextWatchlistItems);
                showMessageToast('Added to your watchlist', 'bottom');
    
                logAmplitudeEventProd('addToMyWatchlist', {
                    username: reelayDBUser?.username,
                    creatorName: reelay?.creator?.username,
                    title: titleObj.display,
                    source: 'sendRecScreen',
                });
            }    
        }
        
    }

    // new icon type : "reorder-three"
    return (
        <WatchlistButtonOuterContainer onPress={addToWatchlist}>
            <WatchListButtonCircleContainer isAdded={isAdded}>
                { isAdded && <WatchlistAddedIconSVG /> }
                { !isAdded && <AddToWatchlistIconSVG /> }
            </WatchListButtonCircleContainer>
        </WatchlistButtonOuterContainer>
    );
}