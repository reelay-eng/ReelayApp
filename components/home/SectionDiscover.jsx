import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import { Image, Pressable, View, Animated, ScrollView, Dimensions, ActivityIndicator, Modal, SafeAreaView, RefreshControl } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { faEdit, faPencil, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import ReelayColors from '../../constants/ReelayColors';
import ReelayDiscVideo from '../global/ReelayDiscVideo';
import { Video } from 'expo-av';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import TitleBannerDiscover from '../feed/TitleBannerDiscover';
import StarRating from '../global/StarRating';
import { FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { height, width } = Dimensions.get('window');

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);
const POSTER_WIDTH = width / 2.3;

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
    flex-direction:row;
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

const CreatorLineContainer = styled(View)`
align-items: center;
flex-direction: row;
margin-left: 5px;
`
const GradientContainer = styled(View)`
align-items: flex-start;
border-radius: 8px;
height: 100%;
justify-content: flex-end;
position: absolute;
width: 100%;
`

const TItleContainer = styled(View)`
align-items: flex-start;
flex-direction: row;
position: absolute;
top: 0px;
left: 0px;
`
const StarRatingContainer = styled(View)`
align-items: center;
flex-direction: row;
margin-top: -15px;
margin-bottom: 6px;
`
const ThumbnailContainer = styled(Pressable)`
justify-content: center;
margin: 10px;
width: ${POSTER_WIDTH};
`
const ThumbnailGradient = styled(LinearGradient)`
border-radius: 0px;
flex: 1;
opacity: 0.6;
height: 100%;
width: 100%;
overflow:hidden;
`
const UsernameText = styled(ReelayText.Subtitle2)`
line-height: 18px;
margin-top:3px;
font-size: 14px;
color: white;
flex: 1;
`
const filterKeys = ['Newest', 'Following', 'Watchlist', 'More Filters'];
const SectionDiscover = ({ navigation, route, refreshControl }) => {
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


    const newestReels = useSelector(state => state.newestReels);
    const followingReels = useSelector(state => state.followingReels);
    const watchlistReels = useSelector(state => state.watchlistReels);
    const moreFiltersReels = useSelector(state => state.moreFiltersReels);

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
    const [feedLoad, setFeedLoad] = useState(false);

    const [reelayThreads, setReelayThreads] = useState(initReelayThreads);
    const [extendLoad, setExtendLoad] = useState(false);
    const [endLoop, setEndLoop] = useState(false);
    const [muteIndex, setMuteIndex] = useState(0);
    const [focusedIndex, setFocusedIndex] = useState();

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
                setMuteIndex(0)
                setEndLoop(false)
            }
        }

        return (
            <FilterPressable isSelected={isSelected} onPress={onPress}>
                <FilterText>{filterKey}</FilterText>
                {filterKey == "More Filters" &&
               <TouchableOpacity onPress={()=> setShowAllFilters(true)}>
               <FontAwesomeIcon style={{marginLeft:5}} icon={faPencil} color={ReelayColors.reelayBlue} size={14} />
               </TouchableOpacity>}
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
            fixedStackList: item,
        });
    };

    var dataProvider = new DataProvider((r1, r2) => {
        return r1 !== r2;
    });

    useEffect(() => {
        loadFeed("Newest");
        loadFeed("Following");
        loadFeed("Watchlist");
        loadFeed("More Filters");
        }, []);


      useEffect(() => {
        console.log("selectFil inside")

        if(selectedSection == "More Filters")
        loadFeed("More Filters");

        }, [selectedFilters]);

    const loadFeed = async (items) => {
        setFeedLoad(true)
        const silSelect = items == "Following"? [{
            "category": "community",
            "display": "my friends",
            "option": "following",
        }]:
        items == "Watchlist" ? [{  
            "category": "watchlist",
            "display": "on my watchlist",
            "option": "on_my_watchlist",
        }]:
        items == "Newest"? []:selectedFilters;

        const fetchedThreads = 
            await getDiscoverFeed({ 
                authSession, 
                filters: coalesceFiltersForAPI(silSelect, myStreamingVenues), 
                page: 0, 
                reqUserSub: reelayDBUser?.sub, 
                sortMethod,
            })

        if (feedSource === 'discover') {
            let dispatchAction = 'setDiscoverMostRecent';
            if (sortMethod === 'thisWeek') dispatchAction = 'setDiscoverThisWeek';
            if (sortMethod === 'thisMonth') dispatchAction = 'setDiscoverThisMonth';
            if (sortMethod === 'allTime') dispatchAction = 'setDiscoverAllTime';

            const payload = {
                content: fetchedThreads,
                filters: {},
                nextPage: 1,
            }
            dispatch({ type: dispatchAction, payload });
        }

        nextPage.current = 1;
        if(items == "Newest"){
            // console.log("fetchedThreads",fetchedThreads[1])
            // console.error("reelData?.length",fetchedThreads.length)
            dispatch({ type: 'setNewestReels', payload: fetchedThreads });
            // dataProvider = dataProvider.cloneWithRows(fetchedThreads);
        }
        if(items == "Following"){
            dispatch({ type: 'setFollowingReels', payload: fetchedThreads });
        }
        if(items == "Watchlist"){
            dispatch({ type: 'setWatchlistReels', payload: fetchedThreads });
        }
        if(items == "More Filters"){
            dispatch({ type: 'setMoreFiltersReels', payload: fetchedThreads });
            // closeAllFiltersList()
        }
        
        setFeedLoad(false)

    }

    const extendFeed = async (items) => {
        setExtendLoad(true)
        console.log("extendFeed",nextPage.current,items)
        const page = (feedSource === 'discover')
            ? discoverMostRecent.nextPage
            : nextPage.current;
        const silSelect = items == "Following"? [{
            "category": "community",
            "display": "my friends",
            "option": "following",
          },
        ]:items == "Watchlist"? [{  
            "category": "watchlist",
            "display": "on my watchlist",
            "option": "on_my_watchlist",
          },
        ]:items == "Newest"? []:selectedFilters;

        const fetchedThreads = await getDiscoverFeed({ 
                authSession, 
                filters: coalesceFiltersForAPI(silSelect, myStreamingVenues), 
                page, 
                reqUserSub: reelayDBUser?.sub,
                sortMethod,
            })

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const threadEntries = {};
        const addToThreadEntries = (fetchedThread) => {
            const reelay = fetchedThread[0];
            threadEntries[reelay?.sub ?? reelay?.id] = 1;
        }
        const reelayThread = items == "Watchlist"?watchlistReels:items == "Following"?followingReels:items == "Newest"?newestReels:moreFiltersReels;
        reelayThread?.forEach(addToThreadEntries);

        const notAlreadyInStack = (fetchedThread) => {
            const reelay = fetchedThread[0];
            const alreadyInStack = threadEntries[reelay?.sub ?? reelay?.id];
            if (alreadyInStack) console.log('Filtering stack ', reelay?.sub ?? reelay?.id);
            return !alreadyInStack;
        }

        const filteredThreads = fetchedThreads.filter(notAlreadyInStack);
        const allThreads = [...reelayThread, ...filteredThreads];
        if(allThreads?.length == reelayThread?.length){
            setEndLoop(true)
        }
        setExtendLoad(false)

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
        
        if(items == "Newest"){
            dispatch({ type: 'setNewestReels', payload: allThreads });
        }
        if(items == "Following"){
            dispatch({ type: 'setFollowingReels', payload: allThreads });
        }
        if(items == "Watchlist"){
            dispatch({ type: 'setWatchlistReels', payload: allThreads });
        }
        if(items == "More Filters"){
            dispatch({ type: 'setMoreFiltersReels', payload: allThreads });
            // closeAllFiltersList()
        }

    }

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
    const closeAllFilters = () => {};


  

    const layoutProvider = new LayoutProvider(
        index => {
            return index;
        },
        (type, dimension) => {
            dimension.height = 240;
            dimension.width = 180;
        }
    );

    const rowRenderer = ( {item, index}) => {
        const reelay = item[0];
        const starRating = (reelay?.starRating ?? 0) + (reelay?.starRatingAddHalf ? 0.5 : 0);
        // var muteIndex = 0;
        // const onPlaybackStatusUpdate = (playbackStatus,index) =>{
        //     if(playbackStatus?.positionMillis > 6000){
        //         setMuteIndex(index + 1)
        //     }
        // }
        const gotoDetail=(reelay)=>{
            setMuteIndex(-1)
            navigation.push('SingleReelayScreen', { reelaySub:reelay?.sub })
        }
        return (
             // <ReelayThumbnailWithMovie
            // navigation={navigation}
            //     reelay={item[0]}
            //     // onPress={() => goToReelay(item[0], index)}
            //     index={index}
            //     onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            // />
            <ThumbnailContainer key={index} onPress={()=> gotoDetail(reelay)//goToReelay(item,index)
            // navigation.push('SingleReelayScreen', { reelaySub:reelay?.sub })
        }
            >
                 <Video
					isLooping = {false}
					isMuted={muteIndex == index ? false:true}
					key={index}
					rate={1.0}
                    // ref={videoRef}
					// progressUpdateIntervalMillis={50}
					resizeMode='cover'
					shouldPlay={muteIndex == index ? true:false}
					source={{ uri: reelay?.content?.videoURI }}
					style={{
						height: 240,
						width: POSTER_WIDTH,
						borderRadius: 12,
					}}
					useNativeControls={false}
					volume={1.0}
                    // onPlaybackStatusUpdate={(playbackStatus) => onPlaybackStatusUpdate(playbackStatus,index)}                   
				/>
                {/* <ReelayDiscVideo
                reelay={reelay}
                index={index}
                muteIndex={muteIndex}
                setMuteIndex={setMuteIndex}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                /> */}
                <TItleContainer>
				 <TitleBannerDiscover
                    titleObj={reelay?.title}
                    reelay={reelay}
                />
			    </TItleContainer>
                <GradientContainer>
                    <ThumbnailGradient colors={["transparent", "#0B1424"]} />
                    <BlurView intensity={15} tint='dark'
                        style={{
                            flexDirection: "row", justifyContent: "space-between", alignItems: 'center',
                            width: '100%', height: 40, borderBottomRightRadius: 12, borderBottomLeftRadius: 12, overflow: "hidden"
                        }}>
                        <View style={{ flexDirection: "row", height: 40, width: "80%" }}>
                            <>
                            <CreatorLineContainer>
                                <ProfilePicture user={reelay?.creator} size={26} border />
                            </CreatorLineContainer>
                            </>
                            <View style={{ marginLeft: 5, width: "75%" }}>
                                <UsernameText numberOfLines={2}>
                                    {reelay?.creator?.username}
                                </UsernameText>
                                {starRating > 0 &&
                                 <StarRatingContainer>
                                    <StarRating
                                        disabled={true}
                                        rating={starRating}
                                        starSize={12}
                                        starStyle={{ paddingRight: 2 }}
                                    />
                                </StarRatingContainer>}
                            </View>
                        </View>
                        <>
                            {muteIndex !== index ?
                                
                                <Ionicons onPress={()=>setMuteIndex(index)} name='volume-mute' color={"#fff"} size={24} style={{marginRight:8}}/>
                                :
                                <Ionicons onPress={()=>setMuteIndex(-1)} name='volume-high' color={"#fff"} size={24} style={{ marginRight: 4 }} />}
                        </>
                    </BlurView>
                </GradientContainer>
            </ThumbnailContainer>
        );
    };
    const refreshControls = <RefreshControl tintColor={"#fff"} refreshing={feedLoad} onRefresh={() => loadFeed(selectedSection)} />;
    const handleScroll = React.useCallback(({ nativeEvent: { contentOffset: { y } } }) => {
        const offset = Math.round(y / 240);
        // console.log("offset",offset * 2)
        setMuteIndex(offset * 2)
        setFocusedIndex(offset)
      }, [focusedIndex]);

    return (
        <InTheatersContainer>
            <HeaderContainer>
                <WatchlistFilters />
            </HeaderContainer>
            {/* <AnimatedPagerView
                style={{height:"100%",width:"100%"}} 
                ref={pager} layoutDirection="ltr"
                onPageSelected={({ nativeEvent }) => onPressS(nativeEvent.position)}
                orientation="horizontal" scrollEnabled={false} initialPage={0}> */}
                {/* {filterKeys.map((items, index) => */}
               {!feedLoad ?
                <View style={{}}>
                    {/* {selectedSection == "Newest" || selectedSection == "Following"|| selectedSection == "Watchlist" || selectedSection == "More Filters" ?
                    //     <ReelayTile navigation={navigation} keys={selectedSection} refreshControl={refreshControl} 
                    //     goToReelay={goToReelay} topReelays={topOfTheWeek} items={selectedSection}
                    //     closeAllFiltersList={closeAllFiltersList} showAllFilters={showAllFilters} 
                    //     extendedFeed={extendFeed} extendLoad={extendLoad} loadFeed={loadFeed} endLoop={endLoop} feedLoad={feedLoad}/>:null}

                        // <RecyclerListView
                        //     // style={{ flex: 1 ,}}
                        //     contentContainerStyle={{ margin: 3 }}
                        //     onEndReached={() => !endLoop && extendFeed(selectedSection)}
                        //     dataProvider={dataProvider}
                        //     layoutProvider={layoutProvider}
                        //     showsVerticalScrollIndicator={false}
                        //     rowRenderer={rowRenderer}
                        //     renderFooter={extendLoad && <ActivityIndicator style={{ margin: 10 }} size={"small"} color={"#fff"} />}
                        // /> */}
                        <FlatList
                        data={selectedSection == "Watchlist" ? watchlistReels : selectedSection == "Following" ? followingReels : selectedSection == "Newest" ? newestReels : moreFiltersReels}
                        refreshControl={refreshControls}
                        onScroll={handleScroll}
                        columnWrapperStyle={{ justifyContent: "center" }}
                        contentContainerStyle={{ paddingBottom: 220 }}
                        // estimatedItemSize={142}
                        numColumns={2}
                        removeClippedSubviews={false}
                        // keyExtractor={(item, index) => index.toString()}
                        renderItem={(item,index)=>rowRenderer(item,index)}
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={extendLoad && <ActivityIndicator style={{ margin: 10 }} size={"small"} color={"#fff"} />}
                        onEndReached={() => !endLoop && extendFeed(selectedSection)}
                        showsHorizontalScrollIndicator={false}
                        // pagingEnabled={true}
                    // initialNumToRender = {10}
                    // onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum = false; }}
    
                    />
                        {/* :null} */}
                        </View>
                    :null}

                {/* )} */}
                {/* </AnimatedPagerView> */}
                {selectedSection == "More Filters" && showAllFilters &&
			    <Modal animationType="slide" transparent={true} visible={true}>
                    <SafeAreaView style={{}}>
                        <AllFeedFilters
                            closeAllFiltersList={closeAllFiltersList}
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            newDiscover={true}
                            />
                    </SafeAreaView>
                </Modal>
                }
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
            {feedLoad && <ActivityIndicator style={{marginTop:height*0.3}} size={"small"} color={"#fff"}/>}
        </InTheatersContainer>
    )
};

export default memo(SectionDiscover);