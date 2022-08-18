import React, { useContext, useEffect, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems } from '../../api/WatchlistApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';
import { useDispatch } from 'react-redux';
import { FlashList } from '@shopify/flash-list';

export default Watchlist = ({ navigation, refresh, watchlistItems }) => {
    const WatchlistItemContainer = styled(Pressable)`
        background-color: #1c1c1c;
        border-color: #2d2d2d;
        border-radius: 8px;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
        border-width: 0.3px;
        margin: 6px;
        margin-left: 12px;
        margin-right: 12px;
    `
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);

    const onRefresh = async () => {
        setRefreshing(true);
        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })
        setRefreshing(false);
    }

    useEffect(() => {
        if (refresh) onRefresh();
    }, []);

    const renderWatchlistItem = ({ item, index }) => {
        const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj: item.title });
        return (
            <WatchlistSwipeableRow onRefresh={onRefresh} watchlistItem={item}>
                <WatchlistItemContainer key={item?.id} onPress={advanceToTitleScreen}>
                    <WatchlistItem navigation={navigation} watchlistItem={item} />
                </WatchlistItemContainer>
            </WatchlistSwipeableRow>
        );
    }

    return (
        <View style={{ height: '100%' }}>
            <FlashList
                data={watchlistItems}
                estimatedItemSize={100}
                keyboardShouldPersistTaps={"handled"}
                keyExtractor={item => String(item.id)}
                renderItem={renderWatchlistItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}