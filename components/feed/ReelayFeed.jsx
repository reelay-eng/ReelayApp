import React, { Fragment, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import ReelayStack from './ReelayStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { getFeed } from '../../api/ReelayDBApi';

import { showMessageToast } from '../utils/toasts';
import { useFocusEffect } from '@react-navigation/core';
import ReelayFeedHeader from './ReelayFeedHeader';
import styled from 'styled-components/native';
import EmptyTopic from './EmptyTopic';
import { getDiscoverFeed } from '../../api/FeedApi';
import { streamingVenues } from '../utils/VenueIcon';

const { height, width } = Dimensions.get('window');
const WEAVE_EMPTY_TOPIC_INDEX = 10;

const FeedView = styled(View)`
    height: 100%;
    width: 100%;
`
const RefreshView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    width: 100%;
`

export default ReelayFeed = ({ navigation, 
    initialStackPos = 0,
    initialFeedPos = 0,
    forceRefresh = false, 
    feedSource = 'discover',
    preloadedStackList = [],
    pinnedReelay = null,
}) => {
    const feedPager = useRef();
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const myStreamingVenues = useSelector(state => state.myStreamingSubscriptions)
        .map(subscription => subscription.platform);

	const dispatch = useDispatch();

    const discoverMostRecent = useSelector(state => state.discoverMostRecent);
    const discoverThisWeek = useSelector(state => state.discoverThisWeek);
    const discoverThisMonth = useSelector(state => state.discoverThisMonth);
    const discoverAllTime = useSelector(state => state.discoverAllTime);

    const sortedThreadData = {
        mostRecent: discoverMostRecent,
        thisWeek: discoverThisWeek,
        thisMonth: discoverThisMonth,
        allTime: discoverAllTime,
    }

    const [feedPosition, setFeedPosition] = useState(initialFeedPos);
    const [refreshing, setRefreshing] = useState(false);
    const resetFilter = { category: 'all', option: 'reset', display: 'all' };

    const [sortMethod, setSortMethod] = useState('mostRecent');
    const [selectedFilters, setSelectedFilters] = useState([resetFilter]);

    const isFirstRender = useRef(true);
    const initNextPage = (feedSource === 'discover') ? sortedThreadData[sortMethod].nextPage: 1;
    const nextPage = useRef(initNextPage);

    const initReelayThreads = (feedSource === 'discover') 
        ? sortedThreadData[sortMethod].content
        : preloadedStackList;

    const [reelayThreads, setReelayThreads] = useState(initReelayThreads);

    const emptyGlobalTopics = useSelector(state => state.emptyGlobalTopics);
    const wovenReelayThreads = reelayThreads.reduce((curWovenThreadsObj, nextThread, index) => {
        const { curWovenThreads } = curWovenThreadsObj;
        curWovenThreads.push(nextThread);
        if (index % WEAVE_EMPTY_TOPIC_INDEX === 0 && index !== 0) {
            const nextEmptyTopicIndex = Math.floor(index / WEAVE_EMPTY_TOPIC_INDEX) - 1;
            const hasMoreEmptyTopics = (emptyGlobalTopics.length > nextEmptyTopicIndex);
            if (!hasMoreEmptyTopics) return curWovenThreadsObj;

            const nextEmptyTopic = emptyGlobalTopics[nextEmptyTopicIndex];
            curWovenThreads.push(nextEmptyTopic);
        }
        return curWovenThreadsObj;
    }, { curWovenThreads: [] }).curWovenThreads;

    useEffect(() => {
        if (isFirstRender.current) {
            if (feedSource === 'discover' && nextPage.current === 1) {
                checkDiscoverForUnseenReelays();
            }    
            isFirstRender.current = false;
        } else {
            setFeedPosition(0);
            feedPager.current.scrollToOffset({
                offset: 0, animated: false,
            });
            refreshFeed(false);
        }
    }, [sortMethod, selectedFilters]);

    useFocusEffect(useCallback(() => {
        dispatch({ type: 'setTabBarVisible', payload: true }); // to ensure tab bar is always here
        if (feedSource === 'discover') {
            AsyncStorage.setItem('lastOnDiscoverFeed', new Date().toISOString());
            dispatch({ type: 'setDiscoverHasUnseenReelays', payload: false });

            const unsubscribe = navigation.getParent().addListener('tabPress', e => {
                e.preventDefault();
                onTabPress();
            });
            return unsubscribe;
        }
    }));

    const checkDiscoverForUnseenReelays = async () => {
        try {
            const lastReelayPostTime = reelayThreads[0][0].postedDateTime;
            const lastOnDiscover = await AsyncStorage.getItem('lastOnDiscoverFeed');
            const hasUnseenReelays = lastOnDiscover ? (lastOnDiscover < lastReelayPostTime) : true;
            dispatch({ type: 'setDiscoverHasUnseenReelays', payload: hasUnseenReelays });    
        } catch (error) {
            console.log(error);
            return;
        }
    }

    const extendFeed = async () => {
        const page = (feedSource === 'discover')
            ? discoverMostRecent.nextPage
            : nextPage.current;

        const fetchedThreads = (feedSource === 'discover') 
            ? await getDiscoverFeed({ authSession, filters: {}, page, reqUserSub: reelayDBUser?.sub })
            : await getFeed({ authSession, feedSource, page, reqUserSub: reelayDBUser?.sub });

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const titleIDEntries = {};
        const addToTitleEntries = (fetchedThread) => titleIDEntries[fetchedThread[0].title.id] = 1;
        reelayThreads.forEach(addToTitleEntries);

        const notAlreadyInStack = (fetchedThread) => {
            const alreadyInStack = titleIDEntries[fetchedThread[0].title.id];
            if (alreadyInStack) console.log('Filtering stack ', fetchedThread[0].title.id);
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

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const onTabPress = async () => {
        navigation.navigate('FeedScreen');

        if (feedPosition === 0) {
            refreshFeed();
        } else {
            console.log('feed positioning to 0');
            // feedPager.current.setPage(0);
            setFeedPosition(0);
            if (feedSource === "discover") {
                logAmplitudeEventProd('openHomeFeed', {
                    'source': feedSource,
                    username: reelayDBUser?.sub,
                });
            } else {
                logAmplitudeEventProd('openFollowingFeed', {
                    'Source': feedSource,
                });
            }
            feedPager.current.scrollToOffset({
                offset: 0, animated: true,
            });
        }
    };

    const refreshFeed = async (shouldShowMessageToast = true) => {
        logAmplitudeEventProd('refreshFeed', {
            'source': feedSource,
        });    
        setRefreshing(true);
        const fetchedThreads = (feedSource === 'discover')
            ? await getDiscoverFeed({ 
                authSession, 
                filters: {}, 
                page: 0, 
                reqUserSub: reelayDBUser?.sub, 
                sortMethod,
            })
            : await getFeed({ 
                feedSource: feedSource, 
                reqUserSub: reelayDBUser?.sub, 
                page: 0 
            });

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
        setReelayThreads(fetchedThreads);
        setRefreshing(false);
        
        if (shouldShowMessageToast) {
            showMessageToast('You\'re at the top', 'top');
        }
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        if (stack.isEmptyTopic) {
            return <EmptyTopic navigation={navigation} topic={stack} />
        }

        return (
            <ReelayStack 
                feedSource={feedSource}
                initialStackPos={initialStackPos}
                navigation={navigation}
                onRefresh={refreshFeed}
                stack={stack} 
                stackViewable={stackViewable}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextFeedPosition = Math.round(y / height);

        if (nextFeedPosition === feedPosition) return;
        const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
        
        const nextStack = wovenReelayThreads[nextFeedPosition];
        const prevStack = wovenReelayThreads[feedPosition];

        const logProperties = {
            nextReelayTitle: nextStack[0]?.title?.display ?? nextStack?.title,
            prevReelayTitle: prevStack[0]?.title?.display ?? prevStack?.title,
            source: feedSource,
            swipeDirection: swipeDirection,
            username: reelayDBUser?.username,
        }
        logAmplitudeEventProd('swipedFeed', logProperties);
        setFeedPosition(nextFeedPosition);
    }

    if (reelayThreads.length < 1) {
        return <ActivityIndicator />;
    }

    return (
        <FeedView>
            { !refreshing && (
                <FlatList
                    data={wovenReelayThreads}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={2}
                    initialScrollIndex={initialFeedPos}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={(stack) => `${stack?.[0]?.sub ?? stack?.id}`}
                    maxToRenderPerBatch={2}
                    onEndReached={extendFeed}
                    onRefresh={refreshFeed}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    refreshing={refreshing}
                    ref={feedPager}
                    renderItem={renderStack}
                    showsVerticalScrollIndicator={false}
                    windowSize={3}
                />
            )}
            { refreshing && (
                <RefreshView>
                    <ActivityIndicator />
                </RefreshView>
            )}
            <ReelayFeedHeader 
                feedSource={feedSource}
                navigation={navigation}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                sortMethod={sortMethod}
                setSortMethod={setSortMethod}
            />
        </FeedView>
    );
}
