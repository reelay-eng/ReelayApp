import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';
import ReelayStack from './ReelayStack';
import FeedSourceSelectorDrawer from './FeedSourceSelectorDrawer';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';

import { getFollowingFeed, getGlobalFeed } from '../../api/ReelayDBApi';

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
const FeedSourceSelectorButton = ({ feedSource, setDrawerOpenFeedSource }) => {
    const insets = useSafeAreaInsets();
    const SourceSelectorPressable = styled(Pressable)`
        margin-top: ${insets.top}px;
        margin-left: 20px;
        position: absolute;
    `
    const iconName = (feedSource === 'global') ? 'earth' : 'people-circle';
    const onPress = () => {
        setDrawerOpenFeedSource(true);
    }

    return (
        <SourceSelectorPressable onPress={onPress}>
            <Icon type='ionicon' name={iconName} color={'white'} size={27} />
        </SourceSelectorPressable>
    );
}

export default ReelayFeed = ({ navigation, 
    initialStackPos = 0,
    forceRefresh = false, 
}) => {

    const feedPager = useRef();
    const nextPage = useRef(0);

    const { cognitoUser } = useContext(AuthContext);

    const [globalFeedPosition, setGlobalFeedPosition] = useState(0);
    const [followingFeedPosition, setFollowingFeedPosition] = useState(0);
    const [feedSource, setFeedSource] = useState('global');
    const [drawerOpenFeedSource, setDrawerOpenFeedSource] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [globalStackList, setGlobalStackList] = useState([]);
    const [followingStackList, setFollowingStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);

    var currStackList = (feedSource === 'global') ? globalStackList : followingStackList;

    useEffect(() => {
        loadFollowingFeed();
        loadGlobalFeed();
        console.log("what feed to load...", feedSource)
    }, [navigation]);

    const loadFollowingFeed = async () => {
        console.log("loading following feed....");
        const stackEmpty = !currStackList.length;
        if (!stackEmpty && !forceRefresh) {
            console.log("following feed already loaded");
            return;
        }

        console.log("gotta load the feed");
        await extendFeed();
    }

    const loadGlobalFeed = async () => {
        console.log("loading", feedSource, " feed....");
        const stackEmpty = !currStackList.length;
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        await extendFeed();
    }

    useEffect(() => {
        // show the other feed
        currStackList =
            feedSource === "global" ? globalStackList : followingStackList;
        // display currStackList
        const stackEmpty = !currStackList.length;
        if (!stackEmpty && !forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        extendFeed();
    }, [feedSource]);

    useFocusEffect(() => {
        const unsubscribe = navigation.getParent()
            .addListener('tabPress', e => {
                e.preventDefault();
                onTabPress();
            });
        return unsubscribe;
    });

    const extendFeed = async () => {
        const page = nextPage.current;
        const fetchedStacks = (feedSource === 'global') 
            ? await getGlobalFeed({ reqUserSub: cognitoUser?.attributes?.sub, page })
            : await getFollowingFeed({ reqUserSub: cognitoUser?.attributes?.sub, page });

        console.log("extending", feedSource, "feed");

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const titleIDEntries = {};
        currStackList.forEach((curStack) => titleIDEntries[curStack[0].title.id] = 1);

        const notAlreadyInStack = (fetchedStack) => {
            const alreadyInStack = titleIDEntries[fetchedStack[0].title.id];
            if (alreadyInStack) console.log('Filtering stack ', fetchedStack[0].title.id);
            return !alreadyInStack;
        }

        const filteredStacks = fetchedStacks.filter(notAlreadyInStack);
        const newStackList = [...currStackList, ...filteredStacks];
        nextPage.current = page + 1;
        console.log(nextPage)
        if (feedSource === "global") {
            setGlobalStackList(newStackList)
        }
        else {
            setFollowingStackList(newStackList)
        }

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
        navigation.navigate('HomeFeedScreen');
        const feedPosition = (feedSource === 'global') ? globalFeedPosition : followingFeedPosition;

        if (feedPosition === 0) {
            refreshFeed();
        } else {
            console.log('feed positioning to 0');
            // feedPager.current.setPage(0);
            if (feedSource === "global") {
                setGlobalFeedPosition(0);
                logAmplitudeEventProd('openHomeFeed', {
                    'source': feedSource,
                    username: cognitoUser?.attributes?.sub,
                    });
            } else {
                setFollowingFeedPosition(0);
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
        const fetchedStacks = (feedSource === 'global') 
            ? await getGlobalFeed({ reqUserSub: cognitoUser?.attributes?.sub, page: 0 })
            : await getFollowingFeed({ reqUserSub: cognitoUser?.attributes?.sub, page: 0 });

        nextPage.current = 1;
        if (feedSource === "global") {
            setGlobalStackList(fetchedStacks);
        } else {
            setFollowingStackList(fetchedStacks);
        }     
        setRefreshing(false);
        // the user is at the top of the feed
        // but the message is at the bottom of the screen
        showMessageToast('You\'re at the top', { position: 'bottom' });
    }
    

    const renderStack = ({ item, index }) => {
        const feedPosition =
          feedSource === "global" ? globalFeedPosition : followingFeedPosition;

        const stack = item;
        const stackViewable = (index === feedPosition);

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

        const feedPosition = (feedSource === 'global') ? globalFeedPosition : followingFeedPosition;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = currStackList[nextFeedPosition];
            const prevStack = currStackList[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                source: feedSource,
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            if (feedSource === "global") {
                setGlobalFeedPosition(nextFeedPosition);
            } else {
                setFollowingFeedPosition(nextFeedPosition);
            }
        }
    }

    console.log('feed is rendering');

    return (
      <ReelayFeedContainer>
        {currStackList.length < 1 && <ActivityIndicator />}
        {currStackList.length >= 1 && feedSource === "global" && (
          <FlatList
            data={globalStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={1}
            initialScrollIndex={globalFeedPosition}
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
        {currStackList.length >= 1 && feedSource === "following" && (
          <FlatList
            data={followingStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={1}
            initialScrollIndex={followingFeedPosition}
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
        <FeedSourceSelectorButton
            feedSource={feedSource}
            drawerOpenFeedSource={drawerOpenFeedSource}
            setDrawerOpenFeedSource={setDrawerOpenFeedSource}
        />
        {drawerOpenFeedSource && (
            <FeedSourceSelectorDrawer
                feedSource={feedSource}
                setFeedSource={setFeedSource}
                drawerOpen={drawerOpenFeedSource}
                setDrawerOpen={setDrawerOpenFeedSource}
            />
        )}
      </ReelayFeedContainer>
    );
}