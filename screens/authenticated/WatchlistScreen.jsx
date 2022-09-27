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
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');

const AddToWatchlistPressable = styled(TouchableOpacity)`
    position: absolute;
    right: 24px;
    top: 10px;
`
const AddToWatchlistText = styled(ReelayText.Body2Bold)`
    color: ${ReelayColors.reelayBlue};
`
const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`
const WatchlistScreenContainer = styled(View)`
    background-color: black;
    height: ${props => height - props.topOffset}px;
    top: ${props => props.topOffset}px;
    width: 100%;
`

export default WatchlistScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const topOffset = useSafeAreaInsets().top;

    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

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

    const AddToWatchlistButton = () => {
        const onPress = () => navigation.push('SearchScreen', { addToWatchlist: true });
        const topOffset = useSafeAreaInsets().top + 8;
        return (
            <AddToWatchlistPressable onPress={onPress} topOffset={topOffset}>
                <AddToWatchlistText>{'Add'}</AddToWatchlistText>
            </AddToWatchlistPressable>
        );
    }

    return (
		<WatchlistScreenContainer topOffset={topOffset}>
            <HeaderWithBackButton navigation={navigation} text={'My watchlist'} />
            { myUnreelayedWatchlistItems.length > 0 && <AddToWatchlistButton /> }
            { myUnreelayedWatchlistItems.length > 0 && (
                <Watchlist
                    navigation={navigation}
                    watchlistItems={myUnreelayedWatchlistItems}
                />
            )}
            { myUnreelayedWatchlistItems.length === 0 && (
                <EmptyWatchlistCard navigation={navigation} />
            )}
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</WatchlistScreenContainer>
	);
};
