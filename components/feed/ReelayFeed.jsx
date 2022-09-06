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

const { height, width } = Dimensions.get('window');
const WEAVE_EMPTY_TOPIC_INDEX = 7;

const FeedView = styled(View)`
    height: 100%;
    width: 100%;
`

export default ReelayFeed = ({ navigation, 
    initialStackPos = 0,
    initialFeedPos = 0,
    forceRefresh = false, 
    initialFeedSource = 'discover',
    preloadedStackList = null,
    pinnedReelay = null,
}) => {
    const feedPager = useRef();
    const nextPage = useRef(preloadedStackList?.length ? 1 : 0);

    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();

    const feedSource = initialFeedSource;
    const [feedPosition, setFeedPosition] = useState(initialFeedPos);
    const [reelayThreads, setReelayThreads] = useState(preloadedStackList ?? []);
    const [refreshing, setRefreshing] = useState(false);
    const stackEmpty = (!reelayThreads.length) || (pinnedReelay && reelayThreads.length === 1);

    const emptyGlobalTopics = useSelector(state => state.emptyGlobalTopics);
    const wovenReelayThreads = reelayThreads.reduce((curWovenThreadsObj, nextThread, index) => {
        const { curWovenThreads } = curWovenThreadsObj;
        curWovenThreads.push(nextThread);
        if (index % WEAVE_EMPTY_TOPIC_INDEX === 0 && index !== 0) {
            const nextEmptyTopicIndex = Math.floor(index / WEAVE_EMPTY_TOPIC_INDEX);
            const hasMoreEmptyTopics = (emptyGlobalTopics.length > nextEmptyTopicIndex);
            if (!hasMoreEmptyTopics) return curWovenThreadsObj;

            const nextEmptyTopic = emptyGlobalTopics[nextEmptyTopicIndex];
            curWovenThreads.push(nextEmptyTopic);
        }
        return curWovenThreadsObj;
    }, { curWovenThreads: [] }).curWovenThreads;

    useEffect(() => {
        loadSelectedFeed();
    }, []);

    useEffect(() => {
        if (feedSource === 'discover' && nextPage.current === 1) {
            checkDiscoverForUnseenReelays();
        }
    }, [reelayThreads]);

    useFocusEffect(useCallback(() => {
        dispatch({ type: 'setTabBarVisible', payload: true }); // to ensure tab bar is always here
        if (initialFeedSource === 'discover') {
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

    const loadSelectedFeed = async () => {
        console.log("loading", feedSource, " feed....");
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        await extendFeed();
    }

    const extendFeed = async () => {
        const page = nextPage.current;
        const fetchedStacks = await getFeed({ feedSource: feedSource, reqUserSub: reelayDBUser?.sub, page });

        // probably don't need to create this every time, but we want to avoid unnecessary state
        // const titleIDEntries = {};
        // const addToTitleEntries = (reelayStack) => titleIDEntries[reelayStack[0].title.id] = 1;
        // reelayThreads.forEach(addToTitleEntries);

        // const notAlreadyInStack = (fetchedStack) => {
        //     const alreadyInStack = titleIDEntries[fetchedStack[0].title.id];
        //     if (alreadyInStack) console.log('Filtering stack ', fetchedStack[0].title.id);
        //     return !alreadyInStack;
        // }

        // const filteredStacks = fetchedStacks.filter(notAlreadyInStack);
        const newStackList = [...reelayThreads, ...fetchedStacks];
        nextPage.current = page + 1;

        setReelayThreads(newStackList);
        return fetchedStacks;
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

    const refreshFeed = async () => {
        console.log('REFRESHING FEED'); 
        logAmplitudeEventProd('refreshFeed', {
            'source': feedSource,
        });    
        setRefreshing(true);
        const fetchedStacks = await getFeed({ 
            feedSource: feedSource, 
            reqUserSub: reelayDBUser?.sub, 
            page: 0 
        });

        setReelayThreads(fetchedStacks);
        nextPage.current = 1;
        setRefreshing(false);
        showMessageToast('You\'re at the top', 'top');
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
            <FlatList
                data={wovenReelayThreads}
                getItemLayout={getItemLayout}
                horizontal={false}
                initialNumToRender={2}
                initialScrollIndex={initialFeedPos}
                keyboardShouldPersistTaps={"handled"}
                keyExtractor={(stack) => `${stack[0]?.id ?? stack?.id}`}
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
            <ReelayFeedHeader 
                feedSource={feedSource}
                navigation={navigation}
            />
        </FeedView>
    );
}
