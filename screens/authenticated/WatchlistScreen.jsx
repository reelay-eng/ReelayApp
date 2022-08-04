import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { HeaderWithBackButton } from '../../components/global/Headers'
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import Watchlist from '../../components/watchlist/Watchlist';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ReelayText from '../../components/global/Text';
import EmptyWatchlistCard from '../../components/watchlist/EmptyWatchlistCard';
import ReelayColors from '../../constants/ReelayColors';

const { height, width } = Dimensions.get('window');

const AddToWatchlistPressable = styled(TouchableOpacity)`
    top: ${props => props.topOffset}px;
    position: absolute;
    right: 24px;
`
const AddToWatchlistText = styled(ReelayText.Body2Bold)`
    color: ${ReelayColors.reelayBlue};
`
const WatchlistScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: ${props => height - props.bottomOffset - 120}px;
    width: 100%;
`

export default WatchlistScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const bottomOffset = useSafeAreaInsets().bottom;

    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const category = route?.params?.category ?? 'My List';
    const refresh = route?.params?.refresh ?? false;

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }, [navigation]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Watchlist' />
    }

    const findInMyReelays = (watchlistItem) => {
        return myCreatorStacks.find((reelayStack) => {
            const tmdbTitleID = reelayStack[0]?.title?.id;
            const titleType = reelayStack[0]?.title?.titleType;
            return (tmdbTitleID === watchlistItem.title?.id 
                && titleType === watchlistItem.title?.titleType);
        });
    }

    // yes this is inefficient but bear with me
    const myUnreelayedWatchlistItems = myWatchlistItems.filter((item) => !findInMyReelays(item));

    // display unseen titles first in watchlist
    const byHasSeen = (a, b) => {
        if (a.hasSeenTitle) return 1;
        if (b.hasSeenTitle) return -1;
        return 0;
    }
    const sortedWatchlistItems = myUnreelayedWatchlistItems.sort(byHasSeen);

    const AddToWatchlistButton = () => {
        const onPress = () => navigation.push('SearchScreen', { addToWatchlist: true });
        const topOffset = useSafeAreaInsets().top + 24;
        return (
            <AddToWatchlistPressable onPress={onPress} topOffset={topOffset}>
                <AddToWatchlistText>{'Add'}</AddToWatchlistText>
            </AddToWatchlistPressable>
        );
    }

    return (
		<WatchlistScreenContainer bottomOffset={bottomOffset}>
            <HeaderWithBackButton navigation={navigation} text={'My Watchlist'} />
            { sortedWatchlistItems.length > 0 && <AddToWatchlistButton /> }
            { sortedWatchlistItems.length > 0 && (
                <Watchlist
                    category={category}
                    navigation={navigation}
                    refresh={refresh}
                    watchlistItems={sortedWatchlistItems}
                />
            )}
            { sortedWatchlistItems.length === 0 && (
                <EmptyWatchlistCard navigation={navigation} />
            )}
		</WatchlistScreenContainer>
	);
};
