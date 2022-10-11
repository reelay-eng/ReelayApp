import React, { useContext, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { AddedToClubsIconSVG, AddToClubsIconSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import AddToClubsDrawer from './AddToClubsDrawer';
import { addToMyWatchlist } from '../../api/WatchlistApi';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { showMessageToast } from '../utils/toasts';

const ClubsButtonCircleContainer = styled(View)`
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
const ClubsButtonOuterContainer = styled(TouchableOpacity)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default AddToClubsButton = ({ navigation, showCircle=true, titleObj, reelay }) => {
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

    const [markedSeen, setMarkedSeen] = useState(inWatchlist && inWatchlist?.hasSeenTitle);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}
    
    const onPress = async () => {
        const addToWatchlistResult = await addToMyWatchlist({
            reqUserSub: reelayDBUser?.sub,
            reelaySub: reelay?.sub,
            creatorName: reelay?.creator?.username,
            tmdbTitleID: reelay?.title?.id,
            titleType: reelay?.title?.titleType,
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

    const openAddToClubsDrawer = () => {
        if (showMeSignupIfGuest()) return;
        setDrawerVisible(true);
        logAmplitudeEventProd('openedAddToClubsDrawer', {
            username: reelayDBUser?.username,
            creatorName: reelay?.creator?.username,
            title: titleObj.display,
        });
    }

    return (
        <ClubsButtonOuterContainer onPress={(onPress)}>
            <ClubsButtonCircleContainer 
                isAddedToWatchlist={inWatchlist && !isMyReelay}
                showCircle={showCircle}
            >
                { (inWatchlist || markedSeen) && <AddedToClubsIconSVG /> }
                { (!inWatchlist && !markedSeen) && <AddToClubsIconSVG /> }
            </ClubsButtonCircleContainer>
            { drawerVisible && (
                <AddToClubsDrawer 
                    navigation={navigation}
                    titleObj={titleObj}
                    reelay={reelay}
                    drawerVisible={drawerVisible}
                    setDrawerVisible={setDrawerVisible}
                    markedSeen={markedSeen}
                    setMarkedSeen={setMarkedSeen}
                />
            )}
        </ClubsButtonOuterContainer>
    );
}