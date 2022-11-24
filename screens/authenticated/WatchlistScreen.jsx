import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';

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
import { getWatchlistItems, getWatchlistRecs } from '../../api/WatchlistApi';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRefresh, faRepeat, faXmark } from '@fortawesome/free-solid-svg-icons';
import TitlePoster from '../../components/global/TitlePoster';
import AddToWatchlistButton from '../../components/watchlist/AddToWatchlistButton';

const { height, width } = Dimensions.get('window');
const REC_TITLE_CUTOFF_INDEX = 9;
const CARD_SIDE_MARGIN = 6;
const WATCHLIST_CARD_WIDTH = (width / 3) - (CARD_SIDE_MARGIN * 2);

const AddToWatchlistPressable = styled(TouchableOpacity)`
    margin-right: 12px;;
`
const AddToWatchlistText = styled(ReelayText.Body2Bold)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
`
const BackButtonView = styled(View)`
    margin-bottom: -4px;
    margin-left: 2px;
`
const BottomBar = styled(View)`
    background-color: black;
    bottom: 0px;
    height: ${props => props.bottomOffset + 52}px;
    position: absolute;
    shadow-offset: 0px -2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 100%;
`
const RefreshRecsPressable = styled(TouchableOpacity)`
    justify-content: center;
    margin-right: 12px;
    padding: 6px;
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
    height: ${props => (2 * props.topOffset) + (height * 0.4)}px;
    opacity: 0.3;
    position: absolute;
    top: ${props => -2 * props.topOffset}px;
    width: 100%;
`
const RecBottomSpacer = styled(View)`
    height: ${props => props.height ?? 24}px;
`
const RecHeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const RecHeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
`
const RecHeaderView = styled(View)`
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 16px;
    margin-left: 8px;
    margin-bottom: 8px;
`
const RecHeaderViewLeft = styled(View)`
    display: flex;
    flex: 1;
`
const RecTitleRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px;
`
const RecTitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const RecYearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const RecTitleTextView = styled(View)`
    display: flex;
    justify-content: center;
`
const TitleInfoView = styled(View)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
`
const TopBarView = styled(View)`
    align-items: center;
    background-color: black;
    flex-direction: row;
    justify-content: space-between;
    position: absolute;
    padding-top: ${props => props.topOffset}px;
    padding-bottom: 6px;
    shadow-offset: 0px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 100%;
    z-index: 100;
`
const UnderlineView = styled(View)`
    margin-top: 5px;
    margin-right: 8px;
    width: 100%;
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
    margin-top: 12px;
`
const WatchlistHeaderView = styled(View)`
    align-items: center;
    margin-top: ${props => props.topOffset + 60}px;
    width: ${width}px;
`
const WatchlistScreenContainer = styled(View)`
    align-items: center;
    background-color: black;
    height: ${height}px;
    width: 100%;
`

export default WatchlistScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;

    const hasAcceptedRec = (watchlistItem) => watchlistItem?.hasAcceptedRec ?? true;
    const hasNotSeenTitle = (watchlistItem) => !watchlistItem?.hasSeenTitle;
    const hasSeenTitle = (watchlistItem) => watchlistItem?.hasSeenTitle;
    const isFilm = (watchlistItem) => watchlistItem?.titleType === 'film';
    const isSeries = (watchlistItem) => watchlistItem?.titleType === 'tv';
    const isUnder90Mins = (watchlistItem) => {
        if (watchlistItem?.title?.runtime > 0) {
            return watchlistItem?.title?.runtime < 90;
        }
        return watchlistItem?.title?.titleType === 'tv';
    }

    // we don't want to use selector here, else it will rerender the whole list whenever we update
    const myWatchlistItems = route?.params?.myWatchlistItems ?? [];
    const myWatchlistRecs = route?.params?.myWatchlistRecs ?? [];

    const [displayItems, setDisplayItems] = useState(myWatchlistItems.filter(hasAcceptedRec));
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);

    const displayItemsWithCutoff = displayItems.slice(0, REC_TITLE_CUTOFF_INDEX);
    const displayItemsPostCutoff = displayItems.slice(REC_TITLE_CUTOFF_INDEX);

    const getDisplayItems = () => {
        const filterSeen = selectedFilters.includes('seen');
        const filterUnseen = selectedFilters.includes('unseen');
        const filterMovies = selectedFilters.includes('movie');
        const filterTV = selectedFilters.includes('TV');
        const filter90 = selectedFilters.includes('<90 min');

        const allFilters = (watchlistItem) => {
            if (filterSeen && hasNotSeenTitle(watchlistItem)) return false;
            if (filterUnseen && hasSeenTitle(watchlistItem)) return false;
            if (filterMovies && isSeries(watchlistItem)) return false;
            if (filterTV && isFilm(watchlistItem)) return false;
            if (filter90 && !isUnder90Mins(watchlistItem)) return false;
            return true;
        }
        return  myWatchlistItems.filter(allFilters);
    }

    const getWatchlistItemLayout = (item, index) => {
        return {
            length: WATCHLIST_CARD_WIDTH + CARD_SIDE_MARGIN,
            offset: index * (WATCHLIST_CARD_WIDTH + CARD_SIDE_MARGIN),
            index,
        }
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
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems });
        setDisplayItems(nextWatchlistItems.filter(hasAcceptedRec));
        setRefreshing(false);
    }

    const onRemoveItem = (watchlistItem) => {
        const filterWatchlistItem = (nextItem) => nextItem?.id !== watchlistItem?.id;
        const filteredWatchlist = displayItems.filter(filterWatchlistItem);
        setDisplayItems(filteredWatchlist);
    }

    const Refresher = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    const renderWatchlistItem = ({ item }) => {
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

    useEffect(() => {
        const nextDisplayItems = myWatchlistItems.filter(hasAcceptedRec);
        if (nextDisplayItems?.length !== displayItems?.length) {
            setDisplayItems(nextDisplayItems);
        }
    }, [myWatchlistItems]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText='My Watchlist' />
    }

    const AddToWatchlistFromSearchButton = () => {
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
                setSelectedFilters(nextFilters);
            } else {
                const oppositeKey = getOppositeKey();
                const filterOppositeKey = (key) => key !== oppositeKey;
                const nextFilters = [...selectedFilters, filterKey];
                setSelectedFilters(nextFilters.filter(filterOppositeKey));
            }
        }

        return (
            <FilterPressable isSelected={isSelected} onPress={onPress}>
                <FilterText>{filterKey}</FilterText>
            </FilterPressable>
        )
    }

    const RecommendedTitles = () => {
        const initRecDisplayTitles = myWatchlistRecs;
        const [recDisplayTitles, setRecDisplayTitles] = useState(initRecDisplayTitles);
        const recQueryPageRef = useRef(1);
        const [recsRefreshing, setRecsRefreshing] = useState(false);

        const RefreshRecsButton = () => {

            const refreshRecs = async () => {
                setRecsRefreshing(true);
                const nextRecs = await getWatchlistRecs({
                    authSession,
                    reqUserSub: reelayDBUser?.sub,
                    category: 'all',
                    page: recQueryPageRef.current,
                })
                recQueryPageRef.current += 1;
                dispatch({ type: 'setMyWatchlistRecs', payload: nextRecs });

                setRecDisplayTitles(nextRecs);
                setRecsRefreshing(false);
            }

            return (
                <RefreshRecsPressable onPress={refreshRecs}>
                    { recsRefreshing && <ActivityIndicator /> }
                    { !recsRefreshing && <FontAwesomeIcon icon={faRefresh} color='white' size={20} /> }
                </RefreshRecsPressable>
            )
        }

        const RecommendedHeader = () => {
            return (
                <RecHeaderView bottomOffset={bottomOffset}>
                    <RecHeaderViewLeft>
                        <RecHeaderText>{'Recommended'}</RecHeaderText>
                        <RecHeaderSubText>{'People you follow added these titles'}</RecHeaderSubText>
                    </RecHeaderViewLeft>
                    <RefreshRecsButton />
                </RecHeaderView>
            );    
        }

        const RecTitleInfo = ({ titleObj }) => {
            const displayTitle = titleObj?.display;
            const hasDisplayYear = (titleObj?.releaseDate && titleObj?.releaseDate.length >= 4);
            const displayYear = (hasDisplayYear) ? titleObj.releaseDate.slice(0,4) : '';
    
            return (
                <TitleInfoView>
                    <RecTitleTextView>
                        <RecTitleText numberOfLines={2} ellipsizeMode={"tail"}>
                            {displayTitle}
                        </RecTitleText>
                    </RecTitleTextView>
                    <UnderlineView>
                        { displayYear?.length > 0 && <RecYearText>{displayYear}</RecYearText> }
                    </UnderlineView>
                </TitleInfoView>
            );
        }    

        const renderRecTitleRow = (titleObj) => {
            const advanceToTitleDetailScreen = () => navigation.push('TitleDetailScreen', {
                titleObj
            });

            const titleKey = `${titleObj?.titleType}-${titleObj?.id}`;
            return (
                <RecTitleRowView key={titleKey}>
                    <TitlePoster onPress={advanceToTitleDetailScreen} title={titleObj} width={45} />
                    <RecTitleInfo titleObj={titleObj} />
                    <AddToWatchlistButton 
                        navigation={navigation}
                        reelay={null}
                        shouldGoToWatchlist={true}
                        titleObj={titleObj}
                    />
                </RecTitleRowView>
            )
        }

        return (
            <Fragment>
                <RecommendedHeader />
                { recDisplayTitles.map(renderRecTitleRow)}
                <RecBottomSpacer height={24} />
            </Fragment>
        )
    }

    const TopBar = () => {
        return (
            <TopBarView topOffset={topOffset}>
                <BackButtonView>
                    <BackButton navigation={navigation} />
                </BackButtonView>
                <RecTitleText>{'My watchlist'}</RecTitleText>
                <AddToWatchlistFromSearchButton />
            </TopBarView>
        );
    }

    const WatchlistFilters = () => {
        const filterKeys = ['seen', 'unseen', 'movie', 'TV', '<90 min'];        
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
                    start={{ x: 0, y: 0.2 }}
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
                ListFooterComponent={(
                    <Fragment>
                        <RecommendedTitles />
                        <FlatList
                            data={displayItemsPostCutoff}
                            decelerationRate={2}
                            estimatedItemSize={100}
                            getItemLayout={getWatchlistItemLayout}
                            keyboardShouldPersistTaps="always"
                            keyExtractor={item => item.id}
                            numColumns={3}
                            renderItem={renderWatchlistItem}
                            refreshControl={Refresher}
                            showsVerticalScrollIndicator={false}
                            snapToStart={false}
                        />
                        <RecBottomSpacer height={bottomOffset + 60} />
                    </Fragment>    
                )}
                data={displayItemsWithCutoff}
                decelerationRate={2}
                numColumns={3}
                estimatedItemSize={100}
                keyboardShouldPersistTaps="always"
                keyExtractor={item => item.id}
                renderItem={renderWatchlistItem}
                refreshControl={Refresher}
                showsVerticalScrollIndicator={false}
            />
            <BottomBar bottomOffset={bottomOffset} /> 
		</WatchlistScreenContainer>
	);
};
