import React, { useCallback, useContext, useEffect, useState, useRef, memo } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';
import ReelayStack from './ReelayStack';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';

import { getFeed } from '../../api/ReelayDBApi';

import { showErrorToast, showMessageToast } from '../utils/toasts';
import { useFocusEffect } from '@react-navigation/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    isOnFeedTab = true
}) => {

    const feedPager = useRef();
    const nextPage = useRef(0);

    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const { setTabBarVisible } = useContext(FeedContext);

    const [feedSource, setFeedSource] = useState(initialFeedSource);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedStackList, setSelectedStackList] = useState([]);
    const [selectedFeedPosition, setSelectedFeedPosition] = useState(initialFeedPos);

    useEffect(() => {
        setTabBarVisible(true); // to ensure tab bar is always here
        loadSelectedFeed();
    }, []);

    const loadSelectedFeed = async () => {
        console.log("loading", feedSource, " feed....");
        const stackEmpty = !selectedStackList.length;
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        await extendFeed();
    }

    useEffect(() => {
        // show the other feed
        const stackEmpty = !selectedStackList.length;
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        extendFeed();
    }, [feedSource]);

    useFocusEffect(useCallback(() => {
        if (initialFeedSource === 'global' && isOnFeedTab) {
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
        
        console.log("extending", feedSource, "feed, with page = ", page, "and stacks length", fetchedStacks.length);

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const titleIDEntries = {};
        selectedStackList.forEach((selectedStack) => titleIDEntries[selectedStack[0].title.id] = 1);

        const notAlreadyInStack = (fetchedStack) => {
            const alreadyInStack = titleIDEntries[fetchedStack[0].title.id];
            if (alreadyInStack) console.log('Filtering stack ', fetchedStack[0].title.id);
            return !alreadyInStack;
        }

        const filteredStacks = fetchedStacks.filter(notAlreadyInStack);
        const newStackList = [...selectedStackList, ...filteredStacks];
        nextPage.current = page + 1;
        console.log(nextPage)
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
                    username: cognitoUser?.attributes?.sub,
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
        const fetchedStacks = await getFeed({ feedSource: feedSource, reqUserSub: reelayDBUser?.sub, page: 0 });

        nextPage.current = 1;
        setSelectedStackList(fetchedStacks);
        setRefreshing(false);
        // the user is at the top of the feed
        // but the message is at the bottom of the screen
        showMessageToast('You\'re at the top', { position: 'bottom' });
    }
    

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === selectedFeedPosition);

        return (
            <ReelayStack 
                stack={stack} stackViewable={stackViewable}
                feedIndex={index}
                initialStackPos={initialStackPos}
                navigation={navigation}
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
                username: cognitoUser.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setSelectedFeedPosition(nextFeedPosition);
        }
    }

    console.log('feed is rendering: ', initialStackPos, forceRefresh);

    return (
      <ReelayFeedContainer>
        {selectedStackList.length < 1 && <ActivityIndicator />}
        {selectedStackList.length >= 1 && (
          <FlatList
            data={selectedStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={1}
            initialScrollIndex={selectedFeedPosition}
            keyExtractor={(stack) => String(stack[0].title.id)}
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

export default memo(ReelayFeed, (prevProps, nextProps) => true);