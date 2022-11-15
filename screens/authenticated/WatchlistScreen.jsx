import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
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
import FanOfPosters from '../../components/watchlist/FanOfPosters';
import BackButton from '../../components/utils/BackButton';
import WatchlistItemCard from '../../components/watchlist/WatchlistItemCard';
import { getWatchlistItems } from '../../api/WatchlistApi';

const { height, width } = Dimensions.get('window');

const AddToWatchlistPressable = styled(TouchableOpacity)`
    position: absolute;
    right: 24px;
    top: 10px;
`
const AddToWatchlistText = styled(ReelayText.Body2Bold)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
`
const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`
const FilterPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.isSelected 
        ? ReelayColors.reelayBlue 
        : 'rgba(255,255,255, 0.2)'
    };
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 8px;
`
const FilterRowView = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 16px;
    width: 100%;
`
const FilterText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const HeaderCardGradient = styled(LinearGradient)`
    border-radius: 12px;
    height: ${props => props.topOffset + 400}px;
    opacity: 0.3;
    position: absolute;
    top: ${props => -1 * props.topOffset}px;
    width: 100%;
`
const TopBarView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 12px;
    padding-right: 12px;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
    z-index: 100;
`
const WatchlistHeaderSubtext = styled(ReelayText.Caption)`
    color: white;
    font-size: 16px;
    margin-top: 12px;
`
const WatchlistHeaderText = styled(ReelayText.H5)`
    color: white;
    font-size: 32px;
    line-height: 40px;
`
const WatchlistHeaderView = styled(View)`
    align-items: center;
    margin-top: ${props => props.topOffset + 60}px;
    width: 100%;
`
const WatchlistScreenContainer = styled(View)`
    align-items: center;
    background-color: black;
    height: ${props => height - props.topOffset}px;
    width: 100%;
`

export default WatchlistScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const topOffset = useSafeAreaInsets().top;

    const hasAcceptedRec = (watchlistItem) => watchlistItem?.hasAcceptedRec ?? true;
    const hasNotSeenTitle = (watchlistItem) => !watchlistItem?.hasSeenTitle;
    const hasSeenTitle = (watchlistItem) => watchlistItem?.hasSeenTitle;
    const isFilm = (watchlistItem) => watchlistItem?.titleType === 'film';
    const isSeries = (watchlistItem) => watchlistItem?.titleType === 'tv';

    // we don't want to use selector here, else it will rerender the whole list whenever we update
    const myWatchlistItems = route?.params?.myWatchlistItems ?? [];

    const [displayItems, setDisplayItems] = useState(myWatchlistItems.filter(hasAcceptedRec));
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    console.log('rerendering watchlist screen');

    const getDisplayItems = () => {
        const filterSeen = selectedFilters.includes('seen');
        const filterUnseen = selectedFilters.includes('unseen');
        const filterMovies = selectedFilters.includes('movie');
        const filterTV = selectedFilters.includes('TV');

        const allFilters = (watchlistItem) => {
            if (filterSeen && hasNotSeenTitle(watchlistItem)) return false;
            if (filterUnseen && hasSeenTitle(watchlistItem)) return false;
            if (filterMovies && isSeries(watchlistItem)) return false;
            if (filterTV && isFilm(watchlistItem)) return false;
            return true;
        }
        return  myWatchlistItems.filter(allFilters);
    }

    const onMoveToFront = (watchlistItem) => {
        const filterWatchlistItem = (nextItem) => nextItem?.id !== watchlistItem?.id;
        const filteredWatchlist = displayItems.filter(filterWatchlistItem);
        const nextDisplayItems = [ watchlistItem, ...filteredWatchlist];
        setDisplayItems(nextDisplayItems);
    }

    const onRefresh = async () => {
        setRefreshing(true);
        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })
        setRefreshing(false);
    }

    const onRemoveItem = (watchlistItem) => {
        const filterWatchlistItem = (nextItem) => nextItem?.id !== watchlistItem?.id;
        const filteredWatchlist = displayItems.filter(filterWatchlistItem);
        setDisplayItems(filteredWatchlist);
    }

    const Refresher = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    const renderWatchlistItem = ({ item, index }) => {
        return (
            <WatchlistItemCard
                onMoveToFront={onMoveToFront}
                onRemoveItem={onRemoveItem}
                navigation={navigation}
                watchlistItem={item}
            />
        );
    }

    useEffect(() => {
        logAmplitudeEventProd('openMyWatchlist', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }, [navigation]);

    useEffect(() => {
        if (refreshing) return;
        const nextDisplayItems = getDisplayItems();
        setDisplayItems(nextDisplayItems);
    }, [refreshing, selectedFilters]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Watchlist' />
    }

    const AddToWatchlistButton = () => {
        const onPress = () => navigation.push('SearchScreen', { addToWatchlist: true });
        const topOffset = useSafeAreaInsets().top + 8;
        return (
            <AddToWatchlistPressable onPress={onPress} topOffset={topOffset}>
                <AddToWatchlistText>{'Add'}</AddToWatchlistText>
            </AddToWatchlistPressable>
        );
    }

    const FilterButton = ({ filterKey }) => {
        const isSelected = selectedFilters.includes(filterKey);

        const getOppositeKey = () => {
            if (filterKey === 'seen') return 'unseen';
            if (filterKey === 'unseen') return 'seen';
            if (filterKey === 'movie') return 'TV';
            if (filterKey === 'TV') return 'movie';
            return '';
        }

        const onPress = () => {
            if (isSelected) { 
                const nextFilters = selectedFilters.filter(key => key !== filterKey);
                console.log('next filters: ', nextFilters);
                setSelectedFilters(nextFilters);
            } else {
                const oppositeKey = getOppositeKey();
                console.log('opposite key: ', oppositeKey);
                const filterOppositeKey = (key) => key !== oppositeKey;
                const nextFilters = [...selectedFilters, filterKey];
                console.log('next filters: ', nextFilters);
                setSelectedFilters(nextFilters.filter(filterOppositeKey));
            }
        }

        return (
            <FilterPressable isSelected={isSelected} onPress={onPress}>
                <FilterText>{filterKey}</FilterText>
            </FilterPressable>
        )
    }

    const TopBar = () => {
        return (
            <TopBarView topOffset={topOffset}>
                <BackButton navigation={navigation} />
                <AddToWatchlistButton />
            </TopBarView>
        );
    }

    const WatchlistFilters = () => {
        const filterKeys = ['seen', 'unseen', 'movie', 'TV'];        
        return (
            <FilterRowView>
                { filterKeys.map(key => <FilterButton key={key} filterKey={key} /> ) }
            </FilterRowView>
        )
    }

    const WatchlistHeader = ({ condensed = false }) => {
        const gradientTopOffset = useSafeAreaInsets().top + 60;
        const titleCount = myWatchlistItems.filter(hasAcceptedRec).length;
        const seenCount = myWatchlistItems.filter(hasSeenTitle).length;
        const watchlistHeaderSubtext = `${titleCount} titles, ${seenCount} seen`;

        return (
            <WatchlistHeaderView topOffset={topOffset}>
                <HeaderCardGradient 
                    colors={['#1A8BF2', 'black']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    topOffset={gradientTopOffset} 
                />
                <FanOfPosters titles={myWatchlistItems.map(item => item.title)} />
                <WatchlistHeaderText>{'My watchlist'}</WatchlistHeaderText>
                <WatchlistHeaderSubtext>{watchlistHeaderSubtext}</WatchlistHeaderSubtext>
                <WatchlistFilters />
            </WatchlistHeaderView>
        );
    }

    return (
		<WatchlistScreenContainer topOffset={topOffset}>
            <TopBar />
            <FlatList
                ListHeaderComponent={(<WatchlistHeader />)}
                data={displayItems}
                numColumns={3}
                estimatedItemSize={100}
                keyExtractor={item => item.id}
                renderItem={renderWatchlistItem}
                refreshControl={Refresher}
                showsVerticalScrollIndicator={false}
            />
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
		</WatchlistScreenContainer>
	);
};
