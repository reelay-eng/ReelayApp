import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import { Image, Pressable, View, Animated, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import SeeMore from '../global/SeeMore';
import { useDispatch, useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import TopOfTheWeek from './TopOfTheWeek';
import ReelayThumbnailWithMovie from '../global/ReelayThumbnailWithMovie';
import ReelayFeedNew from '../feed/ReelayFeedNew';
import { getDiscoverFeed } from '../../api/FeedApi';
import { getFeed } from '../../api/ReelayDBApi';
import { coalesceFiltersForAPI } from '../utils/FilterMappings';
import AllFeedFilters from '../feed/AllFeedFilters';
import ReelayTile from './ReelayTile';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const InTheatersContainer = styled(View)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`
const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-top: 0px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
const FilterPressable = styled(TouchableOpacity)`
    align-items: center;
    border-width: ${props => props.isSelected ? 1 : 0};
    border-color:#fff;
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 6px;
`
const FilterRowView = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    padding: 10px;
    padding-top:0px;
    width: 100%;
`
const FilterText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`

const TopReelaysContainer = styled(View)`
	width: 100%;
`
const TopReelaysHeader = styled(ReelayText.H5Emphasized)`
	padding: 10px;
	color: white;
`
const filterKeys = ['Newest', 'Following', 'Watchlist', 'More Filters'];
const SectionDiscover = memo(({ navigation, route, refreshControl }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    const [selectedSection, setSelectedSection] = useState('Newest');
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayItems, setDisplayItems] = useState([]);
    const pager = useRef(null);
    const topOfTheWeek = useSelector(state => state.myHomeContent?.global);
    const [showAllFilters, setShowAllFilters] = useState(false);


    const myStreamingVenues = useSelector(state => state.myStreamingSubscriptions)
        .map(subscription => subscription.platform);

    const feedSource = route?.params?.feedSource ?? 'discover';
    const initialFeedFilters = route?.params?.initialFeedFilters ?? [];
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const forceRefresh = route?.params?.forceRefresh ?? null;
    const pinnedReelay = route?.params?.pinnedReelay ?? null;
    const preloadedStackList = route?.params?.preloadedStackList ?? [];

    const authSession = useSelector(state => state.authSession);

    const discoverMostRecent = useSelector(state => state.discoverMostRecent);
    const discoverThisWeek = useSelector(state => state.discoverThisWeek);
    const discoverThisMonth = useSelector(state => state.discoverThisMonth);
    const discoverAllTime = useSelector(state => state.discoverAllTime);
    const emptyGlobalTopics = useSelector(state => state.emptyGlobalTopics);
    const sortedThreadData = {
        mostRecent: discoverMostRecent,
        thisWeek: discoverThisWeek,
        thisMonth: discoverThisMonth,
        allTime: discoverAllTime,
    }
    const [sortMethod, setSortMethod] = useState('mostRecent');
    const isFirstRender = useRef(true);
    const initNextPage = (feedSource === 'discover') ? sortedThreadData[sortMethod].nextPage : 1;
    const nextPage = useRef(initNextPage);

    const initReelayThreads = (feedSource === 'discover')
        ? sortedThreadData[sortMethod].content
        : preloadedStackList;
    const [selectedFilters, setSelectedFilters] = useState(initialFeedFilters);

    const [reelayThreads, setReelayThreads] = useState(initReelayThreads);

    const FilterButton = ({ filterKey }) => {
        const isSelected = selectedSection.includes(filterKey);

        const getOppositeKey = () => {
            if (filterKey === 'Newest') return 0;
            if (filterKey === 'Following') return 1;
            if (filterKey === 'Watchlist') return 2;
            if (filterKey === 'More Filters') return 3;
            return '';
        }

        const onPress = () => {
            const oppositeKey = getOppositeKey();
            if (activeIndex !== oppositeKey) {
                setDisplayItems([]);
                setActiveIndex(oppositeKey)
                setSelectedSection(filterKey);
                pager.current?.setPage?.(oppositeKey);
                if (oppositeKey == 3) {
                    setShowAllFilters(true)
                }
            }
        }

        return (
            <FilterPressable isSelected={isSelected} onPress={onPress}>
                <FilterText>{filterKey}</FilterText>
            </FilterPressable>
        )
    }

    const WatchlistFilters = () => {
        const filterKeys = ['Newest', 'Following', 'Watchlist', 'More Filters']//'seen', 'unseen', 'movie', 'TV', '<90 min'];        
        return (
            <FilterRowView>
                {filterKeys.map(key => <FilterButton key={key} filterKey={key} />)}
            </FilterRowView>
        )
    }

    const goToReelay = (item, index) => {
        console.log("goToReelay", index)

        if (index !== 0)
            return;

        navigation.push("TitleFeedScreen", {
            initialStackPos: index,
            fixedStackList: topOfTheWeek,
        });
    };

    const extendFeed = async () => {
        console.log("extendFeed")
        const page = (feedSource === 'discover')
            ? discoverMostRecent.nextPage
            : nextPage.current;

        const fetchedThreads = (feedSource === 'discover')
            ? await getDiscoverFeed({
                authSession,
                filters: coalesceFiltersForAPI(selectedFilters, myStreamingVenues),
                page,
                reqUserSub: reelayDBUser?.sub,
                sortMethod,
            })
            : await getFeed({
                authSession,
                feedSource,
                page,
                reqUserSub: reelayDBUser?.sub,
            });

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const threadEntries = {};
        const addToThreadEntries = (fetchedThread) => {
            const reelay = fetchedThread[0];
            threadEntries[reelay?.sub ?? reelay?.id] = 1;
        }
        reelayThreads.forEach(addToThreadEntries);

        const notAlreadyInStack = (fetchedThread) => {
            const reelay = fetchedThread[0];
            const alreadyInStack = threadEntries[reelay?.sub ?? reelay?.id];
            if (alreadyInStack) console.log('Filtering stack ', reelay?.sub ?? reelay?.id);
            return !alreadyInStack;
        }

        const filteredThreads = fetchedThreads.filter(notAlreadyInStack);
        const allThreads = [...reelayThreads, ...filteredThreads];

        if (feedSource === 'discover') {
            let dispatchAction = 'setDiscoverMostRecent';
            if (sortMethod === 'thisWeek') dispatchAction = 'setDiscoverThisWeek';
            if (sortMethod === 'thisMonth') dispatchAction = 'setDiscoverThisMonth';
            if (sortMethod === 'allTime') dispatchAction = 'setDiscoverAllTime';

            const payload = {
                content: allThreads,
                filters: {},
                nextPage: page + 1,
            }
            console.log('dispatching payload with threads: ', allThreads.length);
            dispatch({ type: dispatchAction, payload });
        }

        nextPage.current = page + 1;
        setReelayThreads(allThreads);
        return allThreads;
    }



    const TopReelays = ({ goToReelay, topReelays }) => {
        // TODO: move scroll view into a flatlist

        const renderReelayThumbnail = ({ item, index }) => {
            const reelay = item[0];
            return (
                <ReelayThumbnailWithMovie
                    reelay={reelay}
                    asTopOfTheWeek={true}
                    showVenue={false}
                    onPress={() => goToReelay(item[0], index)}
                    // showPoster={true}
                    showLikes={false}
                />

            );
        }

        return (
            <TopReelaysContainer>
                <FlatList
                    data={topReelays}
                    refreshControl={refreshControl}
                    columnWrapperStyle={{ justifyContent: "center" }}
                    contentContainerStyle={{ paddingBottom: 220 }}
                    // estimatedItemSize={180}
                    numColumns={2}
                    key={reelay => reelay?.id}
                    // keyExtractor={reelay => reelay?.id}
                    renderItem={renderReelayThumbnail}
                    // onEndReached={extendFeed}
                    showsHorizontalScrollIndicator={false}
                />
            </TopReelaysContainer>
        );
    };
    const getOppositeKey = (item) => {
        if (item === 0) return 'Newest';
        if (item === 1) return 'Following';
        if (item === 2) return 'Watchlist';
        if (item === 3) return 'More Filters';
        return '';
    }

    const onPressS = (item) => {
        console.log(item, activeIndex)
        if (activeIndex == item) {
            return false;
        }
        setActiveIndex(item)
        const oppositeKey = getOppositeKey(item);
        // const filterOppositeKey = (key) => key !== oppositeKey;
        setDisplayItems([]);
        setSelectedSection(oppositeKey);
        pager.current?.setPage?.(item);
    }
    const closeAllFiltersList = () => setShowAllFilters(false);

    return (
        <InTheatersContainer>
            <HeaderContainer>
                <WatchlistFilters />
            </HeaderContainer>

            <AnimatedPagerView
                // style={{height:"100%",width:"100%"}} 
                ref={pager} layoutDirection="ltr"
                onPageSelected={({ nativeEvent }) => onPressS(nativeEvent.position)}
                orientation="horizontal" scrollEnabled={true} initialPage={0}>
                {filterKeys.map((items, index) =>
                    //     <View style={{flexDirection:"row",flexWrap: 'wrap',flex:1}}>
                    //     <TopOfTheWeek navigation={navigation} />
                    //     </View>
                    // <></>
                    // </ScrollView>
                    <ReelayTile navigation={navigation} keys={index} refreshControl={refreshControl} goToReelay={goToReelay} topReelays={topOfTheWeek} />
                )}
                {/* <TopReelays goToReelay={goToReelay} topReelays={topOfTheWeek}/> */}


            </AnimatedPagerView>

            {showAllFilters && (
                <AllFeedFilters
                    closeAllFiltersList={closeAllFiltersList}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                />
            )}
            {/* <ReelayFeedNew 
                    forceRefresh={forceRefresh}
                    feedSource={feedSource}
                    initialFeedFilters={initialFeedFilters}
                    initialFeedPos={initialFeedPos}
                    initialStackPos={initialStackPos}
                    navigation={navigation}
                    pinnedReelay={pinnedReelay}
                    preloadedStackList={preloadedStackList}
                /> */}
            {/* <ActivityIndicator size={"small"} color={"#fff"}/> */}
        </InTheatersContainer>
    )
});

export default SectionDiscover;