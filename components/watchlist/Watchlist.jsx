import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, Pressable, RefreshControl, View } from 'react-native';

import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { useDispatch, useSelector } from 'react-redux';

import ExpandedTitleDrawer from './ExpandedTitleDrawer';
import TitlePoster from '../global/TitlePoster';
import MarkSeenButton from './MarkSeenButton';
 
const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;
const WATCHLIST_CARD_WIDTH = (width / 2) - (CARD_SIDE_MARGIN * 2);

const MarkSeenOnPosterView = styled(View)`
    position: absolute;
    right: 6px;
    top: 6px;
`
const WatchlistCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${CARD_SIDE_MARGIN}px;
    width: ${WATCHLIST_CARD_WIDTH}px;
`
const WatchlistView = styled(View)`
    height: 100%;
`

const WatchlistCard = ({ watchlistItem, setExpandedTitle }) => {
    const [markedSeen, setMarkedSeen] = useState(watchlistItem?.hasSeenTitle);
    return (
        <WatchlistCardView onPress={() => setExpandedTitle(watchlistItem)}>
            <TitlePoster title={watchlistItem.title} width={WATCHLIST_CARD_WIDTH} />
            { markedSeen && (
                <MarkSeenOnPosterView>
                    <MarkSeenButton
                        markedSeen={markedSeen}
                        setMarkedSeen={setMarkedSeen}
                        showText={false}
                        titleObj={watchlistItem?.title}
                    />
                </MarkSeenOnPosterView>
            )}
        </WatchlistCardView>
    );
}


export default Watchlist = ({ navigation, watchlistItems }) => {
    const dispatch = useDispatch();
    const [expandedTitle, setExpandedTitle] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);

    const onRefresh = async () => {
        setRefreshing(true);
        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })
        setRefreshing(false);
    }

    const renderWatchlistItem = ({ item, index }) => {   
        return <WatchlistCard watchlistItem={item} setExpandedTitle={setExpandedTitle} />;
    }

    return (
        <WatchlistView>
            <FlatList
                data={watchlistItems}
                numColumns={2}
                estimatedItemSize={100}
                keyboardShouldPersistTaps={"handled"}
                keyExtractor={item => item.id}
                renderItem={renderWatchlistItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            />
            { expandedTitle && (
                <ExpandedTitleDrawer 
                    expandedTitle={expandedTitle} 
                    navigation={navigation}
                    onRefresh={onRefresh}
                    setExpandedTitle={setExpandedTitle} 
                /> 
            )}
        </WatchlistView>
    );
}