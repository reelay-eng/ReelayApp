import React, { useContext, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, View } from 'react-native';
import { useDispatch } from "react-redux";
import TopicStack from './TopicStack';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getTopics, getTopicsByCreator } from '../../api/TopicsApi';
import moment from 'moment';

const { height, width } = Dimensions.get('window');

const TopicsFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`
export default TopicsFeed = ({ 
    navigation, 
    preloadedTopics,
    initTopicIndex, 
    initReelayIndex,
    source,
    creatorOnProfile=null,
    topicsOnProfile=null,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);

    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const followingTopics = useSelector(state => state.myHomeContent?.following?.topics);

    const page = useRef(0);
	const dispatch = useDispatch();
    const feedPager = useRef();

    let displayTopics;
    switch (source) {
        case 'discover':
            displayTopics = discoverTopics ?? [];
            break;
        case 'following':
            displayTopics = followingTopics ?? [];
            break;
        case 'search':
            displayTopics = preloadedTopics;
            break;
        case 'profile':
            displayTopics = topicsOnProfile;
            break;
        default:
            displayTopics = [];
            break;
    }

    const hasReelays = (topic) => topic?.reelays?.length > 0;
    const displayTopicsWithReelays = displayTopics.filter(hasReelays);
    const displayTopicStacks = displayTopicsWithReelays.map(topic => topic.reelays);
        
    const [feedPosition, setFeedPosition] = useState(initTopicIndex);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        if (source === 'search') return;
        
        try {
            setRefreshing(true);
            const nextTopics = (source === 'profile') 
                ? await getTopicsByCreator({
                    creatorSub: creatorOnProfile?.sub,
                    reqUserSub: reelayDBUser?.sub,
                    page: 0,
                })
                : await getTopics({ 
                    authSession, 
                    page: 0, 
                    reqUserSub: reelayDBUser?.sub, 
                    source,
                });

            const payload = {};
            payload[source] = nextTopics;
            dispatch({ type: 'setTopics', payload });

            setRefreshing(false);    
        } catch (error) {
            console.log(error);
            setRefreshing(false);
        }
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const extendFeed = async () => {
        if (source === 'search') return;
        try {
            page.current += 1;
            const nextTopics = (source === 'profile')
                ? await getTopicsByCreator({
                    creatorSub: creatorOnProfile?.sub,
                    reqUserSub: reelayDBUser?.sub,
                    page: 0,
                })
                : await getTopics({ 
                    authSession, 
                    page: page.current, 
                    reqUserSub: reelayDBUser?.sub, 
                    source,
                });

            const payload = {};
            payload[source] = [...displayTopics, ...nextTopics];
            dispatch({ type: 'setTopics', payload });

        } catch (error) {
            console.log(error);
        }
    }

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const renderStack = ({ item, index }) => {
        const stackViewable = (index === feedPosition);
        const initialStackPos = (index === initTopicIndex) ? initReelayIndex : 0;
        return (
            <TopicStack 
                initialStackPos={initialStackPos}
                navigation={navigation}
                onRefresh={onRefresh}
                stackViewable={stackViewable}
                topic={displayTopicsWithReelays[index]}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = displayTopicStacks[nextFeedPosition];
            const prevStack = displayTopicStacks[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                source: 'topics',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setFeedPosition(nextFeedPosition);
        }
    }

    return (
        <TopicsFeedContainer>
            {displayTopicStacks.length < 1 && <ActivityIndicator />}
            {displayTopicStacks.length >= 1 && (
                <FlatList
                    data={displayTopicStacks}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={1}
                    initialScrollIndex={feedPosition}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={(stack) => `${stack[0].title.id}-${stack[0].sub}`}
                    maxToRenderPerBatch={1}
                    onEndReached={extendFeed}
                    onRefresh={onRefresh}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    refreshing={refreshing}
                    ref={feedPager}
                    renderItem={renderStack}
                    refreshControl={<RefreshControl 
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />}
                    showsVerticalScrollIndicator={false}
                    style={{
                        backgroundColor: "transparent",
                        height: height,
                        width: width,
                    }}
                    windowSize={3}
                />
            )}
        </TopicsFeedContainer>
    );
}
