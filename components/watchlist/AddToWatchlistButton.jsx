import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { AddedToClubsIconSVG, AddToClubsIconSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToMyWatchlist, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { showMessageToast } from '../utils/toasts';

const WatchlistButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${({ 
        isAddedToWatchlist, 
        showCircle 
    }) => {
        if (!showCircle) return 'transparent';
        return (isAddedToWatchlist) 
            ? 'rgba(41, 119, 239, 0.40)'
            : 'rgba(255, 255, 255, 0.20)'
    }};
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const WatchlistButtonOuterContainer = styled(TouchableOpacity)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default AddToWatchlistButton = ({ navigation, showCircle=true, titleObj, reelay }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const isMyReelay = reelay?.creator?.sub === reelayDBUser?.sub;

    const inWatchlistIndex = myWatchlistItems.findIndex((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    });

    const inWatchlist = inWatchlistIndex !== -1;
    const markedSeen = (inWatchlist && inWatchlist?.hasSeenTitle);

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

    const addToWatchlistOnPress = async () => {
        const addToWatchlistResult = await addToMyWatchlist({
            reqUserSub: reelayDBUser?.sub,
            reelaySub: reelay?.sub ?? null,
            creatorName: reelay?.creator?.username ?? null,
            tmdbTitleID: titleObj?.id,
            titleType: titleObj?.titleType,
        });

        const nextWatchlistItems = [addToWatchlistResult, ...myWatchlistItems];

        // todo: should also be conditional based on user settings
        if (reelay?.creator) {
            notifyOnAddedToWatchlist({
                reelayedByUserSub: reelay?.creator?.sub,
                addedByUserSub: reelayDBUser?.sub,
                addedByUsername: reelayDBUser?.username,
                watchlistItem: addToWatchlistResult,
            });    
        }

        logAmplitudeEventProd('addToMyWatchlist', {
            title: titleObj?.display,
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });

        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems });
        showMessageToast(`Added ${titleObj.display} to your watchlist`);
    }

    const removeFromWatchlistOnPress = async () => {
        console.log('remove: ', {
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID: titleObj?.id,
            titleType: titleObj?.titleType,
        })


        logAmplitudeEventProd('removeItemFromWatchlist', {
            username: reelayDBUser?.username,
            title: titleObj?.display,
            source: 'feed',
        });    

        const nextWatchlistItems = myWatchlistItems.filter(nextItem => {
            const matchTitleID = (nextItem?.tmdbTitleID === titleObj?.id);
            const matchTitleType = (nextItem?.titleType === titleObj?.titleType);
            return !(matchTitleID && matchTitleType);
        })

        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems });
        const removeFromWatchlistResult = await removeFromMyWatchlist({
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID: titleObj?.id,
            titleType: titleObj?.titleType,
        });

        console.log('remove from watchlist result: ', removeFromWatchlistResult);
        showMessageToast(`Removed ${titleObj.display} from your watchlist`);
    }
    
    const onPress = async () => {
        if (showMeSignupIfGuest()) return;
        if (inWatchlist) {
            removeFromWatchlistOnPress();
        } else {
            addToWatchlistOnPress();
        }
    }

    return (
        <WatchlistButtonOuterContainer onPress={(onPress)}>
            <WatchlistButtonCircleContainer 
                isAddedToWatchlist={inWatchlist && !isMyReelay}
                showCircle={showCircle}
            >
                { (inWatchlist || markedSeen) && <AddedToClubsIconSVG /> }
                { (!inWatchlist && !markedSeen) && <AddToClubsIconSVG /> }
            </WatchlistButtonCircleContainer>
        </WatchlistButtonOuterContainer>
    );
}