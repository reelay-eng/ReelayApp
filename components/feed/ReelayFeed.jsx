import React, { useCallback, useContext, useEffect, useState, useRef, memo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import { useDispatch, useSe, useSelector } from "react-redux";
import ReelayStack from './ReelayStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { getFeed } from '../../api/ReelayDBApi';

import styled from 'styled-components/native';
import { showMessageToast } from '../utils/toasts';
import { useFocusEffect } from '@react-navigation/core';

const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`

const ReelayFeed = ({ navigation, 
    initialStackPos = 0,
    initialFeedPos = 0,
    forceRefresh = false, 
    initialFeedSource = 'global',
    initStackList = [],
    preloadedStackList = null,
    pinnedReelay = null,
}) => {
    const feedPager = useRef();
    const nextPage = useRef(preloadedStackList?.length ? 1 : 0);

    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();

    const feedSource = initialFeedSource;
    const [refreshing, setRefreshing] = useState(false);

    const [selectedStackList, setSelectedStackList] = useState(preloadedStackList ?? initStackList);
    const [selectedFeedPosition, setSelectedFeedPosition] = useState(initialFeedPos);
    const stackEmpty = (!selectedStackList.length) || (pinnedReelay && selectedStackList.length === 1);

    useEffect(() => {
        loadSelectedFeed();
    }, []);

    useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: true }); // to ensure tab bar is always here
    })

    useEffect(() => {
        if (feedSource === 'global' && nextPage.current === 1) {
            checkForUnseenGlobalReelays();
        }
    }, [selectedStackList]);

    const checkForUnseenGlobalReelays = async () => {
        try {
            const lastReelayPostTime = selectedStackList[0][0].postedDateTime;
            const lastOnGlobal = await AsyncStorage.getItem('lastOnGlobalFeed');
            const hasUnseenGlobalReelays = lastOnGlobal ? (lastOnGlobal < lastReelayPostTime) : true;
            dispatch({ type: 'setHasUnseenGlobalReelays', payload: hasUnseenGlobalReelays });    
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

    useEffect(() => {
        // show the other feed
        const stackEmpty = (!selectedStackList.length) || (pinnedReelay && selectedStackList.length === 1);
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        extendFeed();
    }, [feedSource]);

    useFocusEffect(useCallback(() => {
        if (initialFeedSource === 'global') {
            AsyncStorage.setItem('lastOnGlobalFeed', new Date().toISOString());
            dispatch({ type: 'setHasUnseenGlobalReelays', payload: false });

            const unsubscribe = navigation.getParent()
            .addListener('tabPress', e => {
                e.preventDefault();
                onTabPress();
            });
            return unsubscribe;
        }
    }));

    const extendFeed = async () => {
        const page = nextPage.current;
        const fetchedStacks = await getFeed({ feedSource: feedSource, reqUserSub: reelayDBUser?.sub, page });

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const titleIDEntries = {};
        const addToTitleEntries = (reelayStack) => titleIDEntries[reelayStack[0].title.id] = 1;
        selectedStackList.forEach(addToTitleEntries);

        const notAlreadyInStack = (fetchedStack) => {
            const alreadyInStack = titleIDEntries[fetchedStack[0].title.id];
            if (alreadyInStack) console.log('Filtering stack ', fetchedStack[0].title.id);
            return !alreadyInStack;
        }

        const filteredStacks = fetchedStacks.filter(notAlreadyInStack);
        const newStackList = [...selectedStackList, ...filteredStacks];
        nextPage.current = page + 1;
        setSelectedStackList(newStackList);

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

        if (selectedFeedPosition === 0) {
            refreshFeed();
        } else {
            console.log('feed positioning to 0');
            // feedPager.current.setPage(0);
            setSelectedFeedPosition(0);
            if (feedSource === "global") {
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
        nextPage.current = 1;
        setSelectedStackList(fetchedStacks);
        setRefreshing(false);
        showMessageToast('You\'re at the top', 'top');
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === selectedFeedPosition);

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

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < selectedFeedPosition ? 'up' : 'down';
            
            const nextStack = selectedStackList[nextFeedPosition];
            const prevStack = selectedStackList[selectedFeedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                source: feedSource,
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setSelectedFeedPosition(nextFeedPosition);
        }
    }

    return (
      <ReelayFeedContainer>
        {selectedStackList.length < 1 && <ActivityIndicator />}
        {selectedStackList.length >= 2 && (
          <FlatList
            data={selectedStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={1}
            initialScrollIndex={selectedFeedPosition}
            keyboardShouldPersistTaps={"handled"}
            keyExtractor={(stack) => `${stack[0].title.id}-${stack[0].sub}`}
            maxToRenderPerBatch={1}
            onEndReached={extendFeed}
            onRefresh={refreshFeed}
            onScroll={onFeedSwiped}
            pagingEnabled={true}
            refreshing={refreshing}
            ref={feedPager}
            renderItem={renderStack}
            showsVerticalScrollIndicator={false}
            style={{
              backgroundColor: "transparent",
              height: height,
              width: width,
            }}
            windowSize={3}
          />
        )}
      </ReelayFeedContainer>
    );
}

export default memo(ReelayFeed, (prevProps, nextProps) => {
    console.log('reelay feed memo is called: ', prevProps, nextProps);
    return true;
});