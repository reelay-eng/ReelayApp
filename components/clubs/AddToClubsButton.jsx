import React, { useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { AddToWatchlistIconSVG, WatchlistAddedIconSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';
import AddToClubsDrawer from './AddToClubsDrawer';

const ClubsButtonCircleContainer = styled(View)`
    align-items: center;
    align-self: center;
    background: ${({ isAdded }) => (isAdded) ? ReelayColors.reelayBlue : 'rgba(255, 255, 255, 0.40)'};
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const ClubsButtonOuterContainer = styled(Pressable)`
    align-items: flex-end;
    justify-content: center;
    width: 60px;
`

export default AddToClubsButton = ({ titleObj, reelay }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const inWatchlist = !!myWatchlistItems.find((nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    });

    const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(inWatchlist);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
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
        <ClubsButtonOuterContainer onPress={openAddToClubsDrawer}>
            <ClubsButtonCircleContainer isAdded={isAddedToWatchlist}>
                { isAddedToWatchlist && <WatchlistAddedIconSVG /> }
                { !isAddedToWatchlist && <AddToWatchlistIconSVG /> }
            </ClubsButtonCircleContainer>
            { drawerVisible && (
                <AddToClubsDrawer 
                    titleObj={titleObj}
                    reelay={reelay}
                    drawerVisible={drawerVisible}
                    setDrawerVisible={setDrawerVisible}
                    setIsAddedToWatchlist={setIsAddedToWatchlist}
                />
            )}
        </ClubsButtonOuterContainer>
    );
}