import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import { Image, Pressable, View, Animated, ScrollView, FlatList, Text, Dimensions, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { getDiscoverFeed } from '../../api/FeedApi';
import { coalesceFiltersForAPI } from '../utils/FilterMappings';
import { getFeed } from '../../api/ReelayDBApi';
import ReelayThumbnailWithMovie from '../global/ReelayThumbnailWithMovie';
import FeedTutorial from '../feed/FeedTutorial';
import { RefreshControl } from 'react-native';
import AllFeedFilters from '../feed/AllFeedFilters';
const { height, width } = Dimensions.get('window');
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import TitleBannerDiscover from '../feed/TitleBannerDiscover';
import { BlurView } from 'expo-blur';
import StarRating from '../global/StarRating';
import ClubPicture from '../global/ClubPicture';
import ProfilePicture from '../global/ProfilePicture';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReelayDiscVideo from '../global/ReelayDiscVideo';
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';

const ReelayTile = ({ navigation, route, refreshControl, topReelays, keys, items, closeAllFiltersList, showAllFilters, extendedFeed, extendLoad, loadFeed, endLoop, feedLoad }) => {

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

    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const myStreamingVenues = useSelector(state => state.myStreamingSubscriptions)
        .map(subscription => subscription.platform);
    const showFeedTutorial = useSelector(state => state.showFeedTutorial);

    const feedSource = route?.params?.feedSource ?? 'discover';
    const authSession = useSelector(state => state.authSession);
    const preloadedStackList = route?.params?.preloadedStackList ?? [];
    const initialFeedFilters = route?.params?.initialFeedFilters ?? [];
    const guessingGames = useSelector(state => state?.homeGuessingGames);
    const displayGuessingGames = guessingGames?.content ?? [];
    const [refreshing, setRefreshing] = useState(false);
    const [refreshings, setRefreshings] = useState(false);
    const [muteIndex, setMuteIndex] = useState(0);
    const videoRef = useRef(null);

    // const emptyGlobalTopics = useSelector(state => state.emptyGlobalTopics);
    const isFirstRender = useRef(true);
    const discoverMostRecent = useSelector(state => state.discoverMostRecent);
    const discoverThisWeek = useSelector(state => state.discoverThisWeek);
    const discoverThisMonth = useSelector(state => state.discoverThisMonth);
    const discoverAllTime = useSelector(state => state.discoverAllTime);

    const newestReels = useSelector(state => state.newestReels);
    const followingReels = useSelector(state => state.followingReels);
    const watchlistReels = useSelector(state => state.watchlistReels);
    const moreFiltersReels = useSelector(state => state.moreFiltersReels);

    // const [layoutProvider, setRefreshing] = useState(false);

    const sortedThreadData = {
        mostRecent: discoverMostRecent,
        thisWeek: discoverThisWeek,
        thisMonth: discoverThisMonth,
        allTime: discoverAllTime,
    }

    const [sortMethod, setSortMethod] = useState('mostRecent');
    const [focusedIndex, setFocusedIndex] = useState();
    const initNextPage = (feedSource === 'discover') ? sortedThreadData[sortMethod].nextPage : 1;
    const nextPage = useRef(initNextPage);


    const initReelayThreads = (feedSource === 'discover')
        ? sortedThreadData[sortMethod].content
        : preloadedStackList;
    const [selectedFilters, setSelectedFilters] = useState(initialFeedFilters);

    const [reelayThreads, setReelayThreads] = useState(initReelayThreads);
	const POSTER_WIDTH = width / 2.3;

    console.warn("ReelayTitle")

    // const goToReelay = (item, index) => {
    //     // console.log("goToReelay", index)

    //     navigation.push("TitleFeedScreen", {
    //         initialStackPos: index,
    //         fixedStackList: item,
    //     });
    // };

    const checkShouldShowFeedTutorial = async () => {
        try {
            if (showFeedTutorial) return;
            const hasSeenTutorial = await AsyncStorage.getItem('lastFeedTutorialAt');
            if (!hasSeenTutorial) {
                dispatch({ type: 'setShowFeedTutorial', payload: true });
            }
        } catch (error) {
            console.log(error);
            return true;
        }
    }

    const markFeedTutorialSeen = async () => {
        try {
            dispatch({ type: 'setShowFeedTutorial', payload: false });
            await AsyncStorage.setItem('lastFeedTutorialAt', moment().toISOString());
        } catch (error) {
            console.log(error);
            return true;
        }
    }


    // const getThreadsWithInterstitials = () => {
    //     // add empty topics
    //     const wovenReelayThreads = reelayThreads.reduce((curWovenThreadsObj, nextThread, index) => {
    //         const { curWovenThreads } = curWovenThreadsObj;
    //         curWovenThreads.push(nextThread);
    //         // if (index % WEAVE_EMPTY_TOPIC_INDEX === 0 && index !== 0) {
    //         //     const nextEmptyTopicIndex = Math.floor(index / WEAVE_EMPTY_TOPIC_INDEX) - 1;
    //         //     const hasMoreEmptyTopics = (emptyGlobalTopics.length > nextEmptyTopicIndex);
    //         //     if (!hasMoreEmptyTopics) return curWovenThreadsObj;

    //         //     const nextEmptyTopic = emptyGlobalTopics[nextEmptyTopicIndex];
    //         //     curWovenThreads.push(nextEmptyTopic);
    //         // }
    //         return curWovenThreadsObj;
    //     }, { curWovenThreads: [] }).curWovenThreads;

    //     // add guessing game
    //     // if (displayGuessingGame) {
    //     //     return [displayGuessingGame, ...wovenReelayThreads];
    //     // } else {
    //         return wovenReelayThreads;
    //     // }
    // }

    // const displayReelayThreads = (feedSource === 'discover') 
    //     ? getThreadsWithInterstitials() 
    //     : reelayThreads;


    useEffect(() => {
        // console.warn("selectFil")
        setMuteIndex(0);
        }, [items]);

    const showFeedTutorialOnStack = (
        showFeedTutorial &&
        stack?.topicType !== 'guessingGame' &&
        stackViewable
    );

    const onPlaybackStatusUpdate = (playbackStatus,index) =>{
        // console.log("playbackStatus",playbackStatus)
        if(playbackStatus?.positionMillis > 6000){
            setMuteIndex(index+1)
        }
    }

    const renderReelayThumbnail = ({ item, index }) => {
        const reelay = item[0];
        const starRating = (reelay?.starRating ?? 0) + (reelay?.starRatingAddHalf ? 0.5 : 0);
        return (
            // <ReelayThumbnailWithMovie
            // navigation={navigation}
            //     reelay={item[0]}
            //     // onPress={() => goToReelay(item[0], index)}
            //     index={index}
            //     onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            // />
            <ThumbnailContainer key={index} onPress={()=>//goToReelay(item,index)}
            navigation.push('SingleReelayScreen', { reelay })}
            >
                 {/* <Video
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
                    onPlaybackStatusUpdate={(playbackStatus) => onPlaybackStatusUpdate(playbackStatus,index)}                   
				/> */}
                <ReelayDiscVideo
                reelay={reelay}
                index={index}
                muteIndex={muteIndex}
                setMuteIndex={setMuteIndex}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                />
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
    }

    const refreshControls = <RefreshControl tintColor={"#fff"} refreshing={refreshings} onRefresh={() => loadFeed(items)} />;
    const reelData = items == "Watchlist" ? watchlistReels : items == "Following" ? followingReels : items == "Newest" ? newestReels : moreFiltersReels;

    const handleScroll = React.useCallback(({ nativeEvent: { contentOffset: { y } } }) => {
        const offset = Math.round(y / 240);
        console.log("offset",offset)
        setFocusedIndex(offset)
      }, [setFocusedIndex]);

    

    const data = [[
        {
        "clubID": null,
        "clubName": "",
        "comments":  [],
        "content":  {
          "venue": "disney",
          "videoURI": "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-a5addf82-69d6-4451-a6fe-f0ae4583294b-1689569484751.mp4",
        },
        "creator":  {
          "avatar": "../../assets/images/icon.png",
          "sub": "a5addf82-69d6-4451-a6fe-f0ae4583294b",
          "username": "postcreditsdean",
        },
        "description": "",
        "id": undefined,
        "likes":  [],
        "postedDateTime": "2023-07-17T04:51:24.751Z",
        "reportedContent":  {},
        "starRating": 4,
        "starRatingAddHalf": false,
        "sub": "836dbf8a-cdf0-46db-9b8e-fdf0ac6ff8a8",
        "title":  {
          "director":  {
            "adult": false,
            "credit_id": "52fe4232c3a36847f800b4fd",
            "department": "Directing",
            "gender": 2,
            "id": 1704,
            "job": "Director",
            "known_for_department": "Directing",
            "name": "Gore Verbinski",
            "original_name": "Gore Verbinski",
            "popularity": 6.438,
            "profile_path": "/rSQRdmLNAwdKxrtvBSSlBmWeSsj.jpg",
          },
          "display": "Pirates of the Caribbean: At World's End",
          "displayActors":  [
             {
              "adult": false,
              "cast_id": 4,
              "character": "Jack Sparrow",
              "credit_id": "52fe4232c3a36847f800b50d",
              "gender": 2,
              "id": 85,
              "known_for_department": "Acting",
              "name": "Johnny Depp",
              "order": 0,
              "original_name": "Johnny Depp",
              "popularity": 41.67,
              "profile_path": "/z4wuEcnTW4hlICMYPGn5W8bK2zh.jpg",
            },
             {
              "adult": false,
              "cast_id": 5,
              "character": "Will Turner",
              "credit_id": "52fe4232c3a36847f800b511",
              "gender": 2,
              "id": 114,
              "known_for_department": "Acting",
              "name": "Orlando Bloom",
              "order": 1,
              "original_name": "Orlando Bloom",
              "popularity": 36.197,
              "profile_path": "/lwQoA0qJTCZ6l2FH6PjmhRQjiaB.jpg",
            },
          ],
          "genres":  [
             {
              "id": 12,
              "name": "Adventure",
            },
             {
              "id": 14,
              "name": "Fantasy",
            },
             {
              "id": 28,
              "name": "Action",
            },
          ],
          "id": 285,
          "isSeries": false,
          "overview": "Captain Barbossa, long believed to be dead, has come back to life and is headed to the edge of the Earth with Will Turner and Elizabeth Swann. But nothing is quite as it seems.",
          "posterPath": "/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg",
          "posterSource":  {
            "uri": "http://image.tmdb.org/t/p/w185/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg",
          },
          "rating": "PG-13",
          "releaseDate": "2007-05-19",
          "releaseYear": "2007",
          "runtime": 169,
          "tagline": "At the end of the world, the adventure begins.",
          "titleKey": "film-285",
          "titleType": "film",
          "trailerURI": "HKSZtp_OGHY",
        },
        "titleKey": "film-285",
        "titleType": "film",
        "topicID": null,
        "topicTitle": "",
      },
       {
        "clubID": null,
        "clubName": "",
        "comments":  [],
        "content":  {
          "venue": "disney",
          "videoURI": "https://di92fpd9s7eko.cloudfront.net/public/reelayvid-51a34eb3-c902-4ce0-a87c-f57b503b2503-1684979182900.mp4",
        },
        "creator":  {
          "avatar": "../../assets/images/icon.png",
          "sub": "51a34eb3-c902-4ce0-a87c-f57b503b2503",
          "username": "echowood",
        },
        "description": "*Script optional. ",
        "id": undefined,
        "likes":  [
           {
            "createdAt": "2023-05-25T09:13:10.642Z",
            "creatorName": "echowood",
            "creatorSub": "51a34eb3-c902-4ce0-a87c-f57b503b2503",
            "id": "bff6e8aa-b66f-44f9-9915-94b6e4a41915",
            "postedAt": "2023-05-25T09:13:10.516Z",
            "reelaySub": "374b5007-bc1f-4ea7-8b6e-fe92a6cb48c7",
            "updatedAt": "2023-05-25T09:13:10.642Z",
            "userSub": "27763e94-6f2d-4332-9ebb-bb01bcbbde5a",
            "username": "immigrantfilm",
          },
           {
            "createdAt": "2023-05-25T06:48:27.314Z",
            "creatorName": "echowood",
            "creatorSub": "51a34eb3-c902-4ce0-a87c-f57b503b2503",
            "id": "4193d53e-f320-4727-8e1e-d62b0438d4c4",
            "postedAt": "2023-05-25T06:48:27.208Z",
            "reelaySub": "374b5007-bc1f-4ea7-8b6e-fe92a6cb48c7",
            "updatedAt": "2023-05-25T06:48:27.314Z",
            "userSub": "8143acfe-68a9-4eb0-8f59-1ed2fc5c6adc",
            "username": "phallixander",
          },
        ],
        "postedDateTime": "2023-05-25T01:46:22.900Z",
        "reportedContent":  {},
        "starRating": 2,
        "starRatingAddHalf": false,
        "sub": "374b5007-bc1f-4ea7-8b6e-fe92a6cb48c7",
        "title":  {
          "director":  {
            "adult": false,
            "credit_id": "52fe4232c3a36847f800b4fd",
            "department": "Directing",
            "gender": 2,
            "id": 1704,
            "job": "Director",
            "known_for_department": "Directing",
            "name": "Gore Verbinski",
            "original_name": "Gore Verbinski",
            "popularity": 6.438,
            "profile_path": "/rSQRdmLNAwdKxrtvBSSlBmWeSsj.jpg",
          },
          "display": "Pirates of the Caribbean: At World's End",
          "displayActors":  [
             {
              "adult": false,
              "cast_id": 4,
              "character": "Jack Sparrow",
              "credit_id": "52fe4232c3a36847f800b50d",
              "gender": 2,
              "id": 85,
              "known_for_department": "Acting",
              "name": "Johnny Depp",
              "order": 0,
              "original_name": "Johnny Depp",
              "popularity": 41.67,
              "profile_path": "/z4wuEcnTW4hlICMYPGn5W8bK2zh.jpg",
            },
             {
              "adult": false,
              "cast_id": 5,
              "character": "Will Turner",
              "credit_id": "52fe4232c3a36847f800b511",
              "gender": 2,
              "id": 114,
              "known_for_department": "Acting",
              "name": "Orlando Bloom",
              "order": 1,
              "original_name": "Orlando Bloom",
              "popularity": 36.197,
              "profile_path": "/lwQoA0qJTCZ6l2FH6PjmhRQjiaB.jpg",
            },
          ],
          "genres":  [
             {
              "id": 12,
              "name": "Adventure",
            },
             {
              "id": 14,
              "name": "Fantasy",
            },
             {
              "id": 28,
              "name": "Action",
            },
          ],
          "id": 285,
          "isSeries": false,
          "overview": "Captain Barbossa, long believed to be dead, has come back to life and is headed to the edge of the Earth with Will Turner and Elizabeth Swann. But nothing is quite as it seems.",
          "posterPath": "/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg",
          "posterSource":  {
            "uri": "http://image.tmdb.org/t/p/w185/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg",
          },
          "rating": "PG-13",
          "releaseDate": "2007-05-19",
          "releaseYear": "2007",
          "runtime": 169,
          "tagline": "At the end of the world, the adventure begins.",
          "titleKey": "film-285",
          "titleType": "film",
          "trailerURI": "HKSZtp_OGHY",
        },
        "titleKey": "film-285",
        "titleType": "film",
        "topicID": null,
        "topicTitle": "",
      }]];
    var dataProvider = new DataProvider((r1, r2) => {
        return r1 !== r2;
    });

    if(typeof reelData !== "undefined" && reelData.length !== 0){
        console.error("reelData?.length",reelData.length)
    dataProvider = dataProvider.cloneWithRows(reelData?.length==0?reelData:data);
    }

    const layoutProvider = new LayoutProvider(
        index => {
            return index;
        },
        (type, dimension) => {
            dimension.height = 240;
            dimension.width = 180;
        }
    );

    const rowRenderer = (type, data, index) => {
        const reelay = data[0];
        const starRating = (reelay?.starRating ?? 0) + (reelay?.starRatingAddHalf ? 0.5 : 0);
        return (
             // <ReelayThumbnailWithMovie
            // navigation={navigation}
            //     reelay={item[0]}
            //     // onPress={() => goToReelay(item[0], index)}
            //     index={index}
            //     onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            // />
            <ThumbnailContainer key={index} onPress={()=>//goToReelay(item,index)}
            navigation.push('SingleReelayScreen', { reelay })}
            >
                 {/* <Video
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
                    onPlaybackStatusUpdate={(playbackStatus) => onPlaybackStatusUpdate(playbackStatus,index)}                   
				/> */}
                <ReelayDiscVideo
                reelay={reelay}
                index={index}
                muteIndex={muteIndex}
                setMuteIndex={setMuteIndex}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                />
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


    return (
        <View>
            <View>
                {/* {!feedLoad &&
                <FlatList
                    data={items == "Watchlist" ? watchlistReels : items == "Following" ? followingReels : items == "Newest" ? newestReels : moreFiltersReels}
                    refreshControl={refreshControls}
                    // onScroll={handleScroll}
                    columnWrapperStyle={{ justifyContent: "center" }}
                    contentContainerStyle={{ paddingBottom: 220 }}
                    // estimatedItemSize={142}
                    numColumns={2}
                    removeClippedSubviews={false}
                    // keyExtractor={(item, index) => index.toString()}
                    renderItem={(item,index)=>renderReelayThumbnail(item,index)}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={extendLoad && <ActivityIndicator style={{ margin: 10 }} size={"small"} color={"#fff"} />}
                    onEndReached={() => !endLoop && extendedFeed(items)}
                    showsHorizontalScrollIndicator={false}
                    // pagingEnabled={true}
                // initialNumToRender = {10}
                // onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum = false; }}

                />} */}
                {!feedLoad &&
                <RecyclerListView
                    // style={{ flex: 1 ,}}
                    contentContainerStyle={{ margin: 3 }}
                    onEndReached={() => !endLoop && extendedFeed(items)}
                    dataProvider={dataProvider}
                    layoutProvider={layoutProvider}
                    showsVerticalScrollIndicator={false}
                    rowRenderer={rowRenderer}
                    renderFooter={extendLoad && <ActivityIndicator style={{ margin: 10 }} size={"small"} color={"#fff"} />}
                />}
                {/* extendLoad && */}

            </View>

            {showFeedTutorial && <FeedTutorial onClose={markFeedTutorialSeen} />}
            {refreshing && <ActivityIndicator style={{ flex: 1, justifyContent: "center", marginTop: height * 0.1, alignItems: "center" }} color={"#fff"}></ActivityIndicator>}


        </View>
    )
};

export default memo(ReelayTile);
