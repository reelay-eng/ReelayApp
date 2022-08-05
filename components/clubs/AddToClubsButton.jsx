import React, { useContext, useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { AddedToClubsIconSVG, AddToClubsIconSVG, AddToWatchlistIconSVG, ClubsIconSVG, WatchlistAddedIconSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';
import AddToClubsDrawer from './AddToClubsDrawer';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from '@fortawesome/free-solid-svg-icons';

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

    const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(inWatchlist);
    const [markedSeen, setMarkedSeen] = useState(inWatchlist && inWatchlist?.hasSeenTitle);
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
            <ClubsButtonCircleContainer 
                isAddedToWatchlist={isAddedToWatchlist && !isMyReelay}
                showCircle={showCircle}
            >
                { (isAddedToWatchlist || markedSeen) && <AddedToClubsIconSVG /> }
                { (!isAddedToWatchlist && !markedSeen) && <AddToClubsIconSVG /> }
            </ClubsButtonCircleContainer>
            { drawerVisible && (
                <AddToClubsDrawer 
                    navigation={navigation}
                    titleObj={titleObj}
                    reelay={reelay}
                    drawerVisible={drawerVisible}
                    setDrawerVisible={setDrawerVisible}
                    setIsAddedToWatchlist={setIsAddedToWatchlist}
                    markedSeen={markedSeen}
                    setMarkedSeen={setMarkedSeen}
                />
            )}
        </ClubsButtonOuterContainer>
    );
}