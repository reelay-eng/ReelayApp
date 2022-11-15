import React, { Fragment, useContext, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { getWatchlistItems } from '../../api/WatchlistApi';
import { AuthContext } from '../../context/AuthContext';
import FanOfPosters from '../watchlist/FanOfPosters';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const GRID_SIDE_MARGIN = 16;
const GRID_WIDTH = width - (2 * GRID_SIDE_MARGIN);

const POSTER_HALF_MARGIN = 4;
const POSTER_ROW_LENGTH = 4;
const POSTER_WIDTH = (GRID_WIDTH / POSTER_ROW_LENGTH) - (2 * POSTER_HALF_MARGIN);
const POSTER_HEIGHT = 1.5 * POSTER_WIDTH;

const ROW_COUNT = 3;
const POSTER_INDEX_CUTOFF = ROW_COUNT * POSTER_ROW_LENGTH;

const AddToWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding: 15px;
    padding-top: 5px;
    height: 100%;
`
const AddText = styled(ReelayText.Caption)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 4px;
    margin-left: 16px;
    margin-bottom: 8px;
`
const HeaderContainerLeft = styled(View)`
    display: flex;
    flex: 1;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
`
const HomeWatchlistCardFill = styled(View)`
    background-color: #1A8BF2;
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardGradient = styled(LinearGradient)`
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardView = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 12px;
    height: 240px;
    justify-content: center;
    left: 16px;
    margin-bottom: 16px;
    width: ${width - 32}px;
`
const RefreshView = styled(View)`
    align-items: center;
    height: ${(POSTER_HEIGHT + POSTER_HALF_MARGIN) * 3}px;
    justify-content: center;
    width: ${GRID_WIDTH}px;
`
const WatchlistText = styled(ReelayText.H6)`
    color: white;
    font-size: 24px;
`

export default HomeWatchlistCard = ({ navigation }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);

    const myCreatorStacks = useSelector(state => state.myCreatorStacks);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const advanceToAddToWatchlistScreen = () => navigation.push('SearchScreen', { addToWatchlist: true });
    const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen', { myWatchlistItems });

    const AddToWatchlistButton = () => {
        return (
            <Fragment>
                <AddToWatchlistPressable onPress={advanceToAddToWatchlistScreen}>
                    <AddText>{'Add'}</AddText>
                </AddToWatchlistPressable>
            </Fragment>
        );
    }

    const SectionHeader = () => {
        return (
            <HeaderContainer>
                <HeaderContainerLeft>
                    <HeaderText>{'Watchlist'}</HeaderText>
                    <HeaderSubText>{'"What are we gonna watch tonight?" YOU have the answer'}</HeaderSubText>
                </HeaderContainerLeft>
                <AddToWatchlistButton />
            </HeaderContainer>
        );
    }

    const hasNotReelayedTitle = (watchlistItem) => {
        const foundReelay = myCreatorStacks.find((reelayStack) => {
            const tmdbTitleID = reelayStack[0]?.title?.id;
            const titleType = reelayStack[0]?.title?.titleType;
            return (tmdbTitleID === watchlistItem.title?.id 
                && titleType === watchlistItem.title?.titleType);
        });
        return !foundReelay;
    }

    const myUnreelayedWatchlistItems = myWatchlistItems.filter(hasNotReelayedTitle);

    // display unseen titles first in watchlist
    const byHasSeen = (watchlistItem0, watchlistItem1) => {
        if (watchlistItem0.hasSeenTitle) return 1;
        if (watchlistItem1.hasSeenTitle) return -1;
        return 0;
    }

    const inDisplayRange = (watchlistItem, index) => index < POSTER_INDEX_CUTOFF;
    const displayWatchlistItems = myUnreelayedWatchlistItems.sort(byHasSeen).filter(inDisplayRange);

    const onRefresh = async () => {
        setRefreshing(true);
        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })
        setRefreshing(false);
    }
    
    if (displayWatchlistItems?.length === 0) {
        return <View />
    }

    if (refreshing) {
        return (
            <Fragment>
                <SectionHeader />
                <RefreshView>
                    <ActivityIndicator />
                </RefreshView>
            </Fragment>
        )
    }

    return (
        <Fragment>
            <SectionHeader />
            <HomeWatchlistCardView onPress={advanceToWatchlistScreen}>
                <HomeWatchlistCardFill />
                <HomeWatchlistCardGradient colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} />
                <FanOfPosters titles={displayWatchlistItems.map(item => item.title)} />
                <WatchlistText>{'My watchlist'}</WatchlistText>
            </HomeWatchlistCardView>
        </Fragment>
    );
}
