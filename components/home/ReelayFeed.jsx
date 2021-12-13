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
    initialFeedPos = 0,
    initialStackPos = 0,
    fixedStackList = [],
    forceRefresh = false, 
}) => {

    const feedPager = useRef();
    const nextPage = useRef(0);

    const { cognitoUser } = useContext(AuthContext);
    const { overlayVisible } = useContext(FeedContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [feedSource, setFeedSource] = useState('global');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);

    const [tabPressCounter, setTabPressCounter] = useState(0);

    const isFixedStack = fixedStackList.length != 0;

    useEffect(() => {
        const stackEmpty = !stackList.length;
        if (!stackEmpty && !forceRefresh) {
            console.log('feed already loaded');
            return;
        }

        console.log('gotta load the feed');
        if (isFixedStack) {
            setStackList(fixedStackList);
        } else {
            extendFeed();
        }
    }, [navigation]);

    useEffect(() => {
        refreshFeed();
    }, [feedSource])

    useFocusEffect(() => {
        if (fixedStackList.length) return;
        const unsubscribe = navigation.dangerouslyGetParent()
            .addListener('tabPress', e => {
                e.preventDefault();
                onTabPress();
            });
        return unsubscribe;
    });

    const extendFeed = async () => {
        if (isFixedStack) return;

        const page = nextPage.current;
        const fetchedStacks = (feedSource === 'global') 
            ? await getGlobalFeed({ reqUserSub: cognitoUser.attributes.sub, page })
            : await getFollowingFeed({ reqUserSub: cognitoUser.attributes.sub, page });

        const newStackList = [...stackList, ...fetchedStacks];
        nextPage.current = page + 1;
        setStackList(newStackList);

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

        const feedDeletePosition = stackList.findIndex(stack => stack[0].title.id === reelay.title.id);
        const stack = stackList[feedDeletePosition];

        if (stack.length === 1) {
            setStackList(stackList.filter(stack => stack[0].id !== reelay.id));
        } else {
            const nextStack = stack.filter(nextReelay => nextReelay.id !== reelay.id);
            stackList[feedDeletePosition] = nextStack;
            setStackCounter(stackCounter + 1);
        }
    };

    const onTabPress = async () => {
        if (!stackList.length) return;
        navigation.navigate('HomeFeedScreen');

        console.log('IN ON TAB PRESS, count: ', tabPressCounter);
        if (feedPosition === 0) {
            refreshFeed();
        } else {
            console.log('feed positioning to 0');
            // feedPager.current.setPage(0);
            setFeedPosition(0);
            feedPager.current.scrollToOffset({
                offset: 0, animated: true,
            });
        }
    };

    const refreshFeed = async () => {
        if (isFixedStack) return;
        console.log('REFRESHING FEED');     
        setRefreshing(true);   
        const fetchedStacks = (feedSource === 'global') 
            ? await getGlobalFeed({ reqUserSub: cognitoUser.attributes.sub, page: 0 })
            : await getFollowingFeed({ reqUserSub: cognitoUser.attributes.sub, page: 0 });

        setRefreshing(false);
        nextPage.current = 1;
        setStackList(fetchedStacks);        
        // the user is at the top of the feed
        // but the message is at the bottom of the screen
        showMessageToast('You\'re at the top', { position: 'bottom' });
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        console.log(`Rendering stack for ${stack[0].title.display}`);
        console.log(`index: ${index} feed position: ${feedPosition}, viewable? ${stackViewable}`);

        return (
            <ReelayStack 
                stack={stack} stackViewable={stackViewable}
                feedIndex={index}
                initialStackPos={initialStackPos}
                isFixedStack={isFixedStack}
                navigation={navigation}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = stackList[nextFeedPosition];
            const prevStack = stackList[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            Amplitude.logEventWithPropertiesAsync('swipedFeed', logProperties);
            setFeedPosition(nextFeedPosition);
        }
    }

    return (
        <ReelayFeedContainer>
            { stackList.length < 1 && <ActivityIndicator /> }
            { stackList.length >= 1 && 
                <FlatList
                    data={stackList}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={3}
                    initialScrollIndex={initialFeedPos}
                    keyExtractor={stack => String(stack[0].title.id)}
                    maxToRenderPerBatch={3}
                    onEndReached={extendFeed}
                    onRefresh={refreshFeed}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    refreshing={refreshing}
                    ref={feedPager}
                    renderItem={renderStack}
                    showsVerticalScrollIndicator={false}
                    style = {{
                        backgroundColor: 'transparent',
                        height: height,
                        width: width,
                    }}
                    windowSize={3}
                />        
            }
            { overlayVisible && 
                <FeedOverlay navigation={navigation} onDeleteReelay={onDeleteReelay} />
            }
            <FeedSourceSelectorButton
                feedSource={feedSource} 
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
            />
            { drawerOpen && 
                <FeedSourceSelectorDrawer 
                    feedSource={feedSource} 
                    setFeedSource={setFeedSource}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                />
            }
        </ReelayFeedContainer>
    );
}