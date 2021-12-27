import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';
import ReelayStack from './ReelayStack';
import FeedOverlay from '../overlay/FeedOverlay';
import FeedSourceSelectorDrawer from './FeedSourceSelectorDrawer';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';

import { deleteReelay } from '../../api/ReelayApi';
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
const FeedSourceSelectorButton = ({ feedSource, drawerOpen, setDrawerOpen }) => {
    const insets = useSafeAreaInsets();
    const SourceSelectorPressable = styled(Pressable)`
        margin-top: ${insets.top}px;
        margin-left: 20px;
        position: absolute;
    `
    const iconName = (feedSource === 'global') ? 'earth' : 'people-circle';
    const onPress = () => {
        setDrawerOpen(true);
    }

    return (
        <SourceSelectorPressable onPress={onPress}>
            <Icon type='ionicon' name={iconName} color={'white'} size={30} />
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
    const { overlayVisible } = useContext(FeedContext);

    const [globalFeedPosition, setGlobalFeedPosition] = useState(0);
    const [followingFeedPosition, setFollowingFeedPosition] = useState(0);
    const [feedSource, setFeedSource] = useState('following');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [globalStackList, setGlobalStackList] = useState([]);
    const [followingStackList, setFollowingStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);
    const [tabPressCounter, setTabPressCounter] = useState(0);

    const currStackList = (feedSource === 'global') ? globalStackList : followingStackList;
    const feedLoaded = (currStackList && currStackList.length > 0);

    useEffect(() => {
        loadFollowingFeed();
        setFeedSource('global');
        loadGlobalFeed();
    }, [navigation]);

    const loadFollowingFeed = async () => {
        console.log("loading following feed....");
        const stackEmpty = !currStackList.length;
        if (stackEmpty || forceRefresh) {
            console.log("following feed already loaded");
            return;
        }

        console.log("gotta load the feed");
        await extendFeed();
    }

    const loadGlobalFeed = async () => {
        console.log("loading", feedSource, " feed....");
        const stackEmpty = !currStackList.length;
        if (stackEmpty || forceRefresh) {
          console.log("feed already loaded");
          return;
        }
        await extendFeed();
    }

    useEffect(() => {
        // show the other feed
        // currStackList = (feedSource === 'global') ? globalStackList : followingStackList;
        // feedLoaded = currStackList?.length;
        // display currStackList
        const stackEmpty = !currStackList.length;
        // if (!stackEmpty && !forceRefresh) {
        //   console.log("feed already loaded");
        //   return;
        // }
        if (stackEmpty || forceRefresh) {
            extendFeed();
        }
    }, [feedSource]);

    useFocusEffect(() => {
        const unsubscribe = navigation.dangerouslyGetParent()
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
        
        if (!fetchedStacks?.length) {
            return [];
        }

        const newStackList = [...currStackList, ...fetchedStacks];
        nextPage.current = page + 1;
        if (feedSource === 'global') {
            setGlobalStackList(newStackList)
        } else {
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

    const onDeleteReelay = async (reelay) => {
        // todo: this should probably be a try/catch
        const deleteSuccess = deleteReelay(reelay);
        if (!deleteSuccess) {
            showErrorToast('Could not find your Reelay in the database. Strange...');
            return;
        }

        const feedDeletePosition = currStackList.findIndex(stack => stack[0].title.id === reelay.title.id);
        const stack = currStackList[feedDeletePosition];

        if (stack.length === 1) {
           if (feedSource === "global") {
                setGlobalStackList(
                    currStackList.filter((stack) => stack[0].id !== reelay.id)
                )
           }
           else {
                setFollowingStackList(
                    currStackList.filter((stack) => stack[0].id !== reelay.id)
                );
           }
        } else {
            const nextStack = stack.filter(nextReelay => nextReelay.id !== reelay.id);
            currStackList[feedDeletePosition] = nextStack;
            setStackCounter(stackCounter + 1);
        }
    };

    const onTabPress = async () => {
        navigation.navigate('HomeFeedScreen');

        const feedPosition = (feedSource === 'global') ? globalFeedPosition : followingFeedPosition;

        console.log('IN ON TAB PRESS, count: ', tabPressCounter);
        if (feedPosition === 0) {
            refreshFeed();
        } else {
            if (feedSource === "global") {
                setGlobalFeedPosition(0);
            } else {
                setFollowingFeedPosition(0);
            }
            feedPager.current.scrollToOffset({
                offset: 0, animated: true,
            });
        }
    };

    const refreshFeed = async () => {
        console.log('REFRESHING FEED');     
        setRefreshing(true);   
        const fetchedStacks = (feedSource === 'global') 
            ? await getGlobalFeed({ reqUserSub: cognitoUser?.attributes?.sub, page: 0 })
            : await getFollowingFeed({ reqUserSub: cognitoUser?.attributes?.sub, page: 0 });

        setRefreshing(false);
        nextPage.current = 1;
        if (feedSource === "global") {
            setGlobalStackList(fetchedStacks);
        } else {
            setFollowingStackList(fetchedStacks);
        }     
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
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            Amplitude.logEventWithPropertiesAsync('swipedFeed', logProperties);
            if (feedSource === "global") {
                setGlobalFeedPosition(nextFeedPosition);
            } else {
                setFollowingFeedPosition(nextFeedPosition);
            }
        }
    }

    return (
      <ReelayFeedContainer>
        { !feedLoaded && <ActivityIndicator />}
        { feedLoaded && feedSource === "global" && (
          <FlatList
            data={globalStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={3}
            initialScrollIndex={globalFeedPosition}
            keyExtractor={(stack) => String(stack[0].title.id)}
            maxToRenderPerBatch={3}
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
        { feedLoaded && feedSource === "following" && (
          <FlatList
            data={followingStackList}
            getItemLayout={getItemLayout}
            horizontal={false}
            initialNumToRender={3}
            initialScrollIndex={followingFeedPosition}
            keyExtractor={(stack) => String(stack[0].title.id)}
            maxToRenderPerBatch={3}
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
        { overlayVisible && (
          <FeedOverlay
            navigation={navigation}
            onDeleteReelay={onDeleteReelay}
          />
        )}

        <FeedSourceSelectorButton
          feedSource={feedSource}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
        { drawerOpen && (
          <FeedSourceSelectorDrawer
            feedSource={feedSource}
            setFeedSource={setFeedSource}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        )}
      </ReelayFeedContainer>
    );
}