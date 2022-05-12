import React, { useContext, useEffect, useState } from 'react';
import { Pressable, FlatList, RefreshControl, ScrollView, View } from 'react-native';

import styled from 'styled-components/native';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems } from '../../api/WatchlistApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';
import { RecommendedByLine, ReelayedByLine } from './RecPills';

import { useDispatch } from 'react-redux';

export default Watchlist = ({ category, navigation, refresh, watchlistItems }) => {
    const WatchlistItemContainer = styled(Pressable)`
        background-color: #1c1c1c;
        border-color: #2d2d2d;
        border-radius: 8px;
        border-width: 0.3px;
        margin: 10px;
    `
    const WatchlistItemSeparator = styled(View)`
        height: 12px;
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
        return (
            <React.Fragment>
                    <WatchlistItemContainer key={item?.id} onPress={() => {
                        navigation.push('TitleDetailScreen', { titleObj: item.title });
                    }}>
                        <WatchlistItem category={category} navigation={navigation} watchlistItem={item} />
                    </WatchlistItemContainer>
                {/* { renderWatchlistItemUnderContainer(item) } */}
            </React.Fragment>
        );
    }

    const renderWatchlistItemUnderContainer = (item) => {
        const shouldRenderUnderContainer = (item.recommendations.length > 0) || (!!item.recommendedReelaySub);
        if (shouldRenderUnderContainer) {
            return (
                <React.Fragment>
                    { item.recommendations.length > 0 && 
                        <RecommendedByLine navigation={navigation} watchlistItem={item} /> 
                    }
                    { !!item.recommendedReelaySub && 
                        <ReelayedByLine navigation={navigation} watchlistItem={item} />
                    }
                    <WatchlistItemSeparator />
                </React.Fragment>
            );
        } else {
            return <React.Fragment />
        }
    }

    return (
        <View style={{height: '100%'}}>
            <FlatList 
                data={watchlistItems}
                horizontal={false}
                keyboardShouldPersistTaps={"handled"}
                keyExtractor={item => String(item.id)}
                pagingEnabled={false}
                renderItem={renderWatchlistItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                style={{ 
                    height: '100%', 
                    marginTop: 16, 
                    marginBottom: 16,
                }}
            />
        </View>
    );
}