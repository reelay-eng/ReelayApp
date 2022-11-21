import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../global/Text';

import { AddedToClubsIconSVG, AddToClubsIconSVG, ClubsIconSolidSVG, ClubsIconSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToMyWatchlist, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { showMessageToast } from '../utils/toasts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';

const LabelText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 16px;
    margin-right: 10px;
`
const ShareButtonBackground = styled(LinearGradient)`
    border-radius: 50px;
    height: 45px;
    opacity: 0.9;
    position: absolute;
    right: 6px;
    width: 45px;
`
const WatchlistButtonCircleView = styled(View)`
    align-items: center;
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    overflow: hidden;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.3;
    width: 45px;
`
const WatchlistButtonOuterView = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding-right: 6px;
`

export default AddToWatchlistButton = ({ 
    navigation, 
    shouldGoToWatchlist = false, 
    showLabel = false,
    titleObj, 
    reelay 
}) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const matchWatchlistItem = (nextItem) => {
        const { tmdbTitleID, titleType, hasAcceptedRec } = nextItem;
        const isSeries = (titleType === 'tv');
        return (tmdbTitleID === titleObj.id) 
            && (isSeries === titleObj.isSeries)
            && (hasAcceptedRec === true);
    }

    const watchlistItem = useSelector(state => state.myWatchlistItems.find(matchWatchlistItem));    
    const inWatchlist = !!watchlistItem;
    const hasSeenTitle = watchlistItem?.hasSeenTitle;
    const markedSeen = (inWatchlist && inWatchlist?.hasSeenTitle);

    const getGradientColors = () => {
        if (hasSeenTitle) return [ReelayColors.reelayGreen, ReelayColors.reelayGreen];
        if (inWatchlist) return [ReelayColors.reelayGreen, '#0789FD'];
        return ['#0789FD', '#0789FD'];
    }

    const gradientColors = getGradientColors();
    const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

    const addToWatchlistOnPress = async () => {
        if (shouldGoToWatchlist) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            showMessageToast(`Added ${titleObj.display} to your watchlist`);
        }

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
    }

    const removeFromWatchlistOnPress = async () => {
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
    }
    
    const onPress = async () => {
        if (showMeSignupIfGuest()) return;
        if (inWatchlist) {
            removeFromWatchlistOnPress();
        } else {
            addToWatchlistOnPress();
        }
    }

    const Label = () => {
        if (!showLabel) return <View />;
        const label = (inWatchlist) ? 'In watchlist' : 'Add to watchlist';
        return (
            <LabelText>{label}</LabelText>
        )
    }

    return (
        <WatchlistButtonOuterView onPress={(onPress)}>
            <Label />
            <ShareButtonBackground colors={gradientColors} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }} 
            />
            <WatchlistButtonCircleView>
                { (inWatchlist) && <AddedToClubsIconSVG /> }
                { (!inWatchlist && !hasSeenTitle) && <AddToClubsIconSVG /> }
            </WatchlistButtonCircleView>
        </WatchlistButtonOuterView>
    );
}