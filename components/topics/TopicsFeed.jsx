import React, { useContext, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import { useDispatch } from "react-redux";
import TopicStack from './TopicStack';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { showMessageToast } from '../utils/toasts';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const BackButtonContainer = styled(View)`
    background-color: transparent;
    position: absolute;
    top: 150px;
    z-index: 4;
`
const TopicsFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`
export default TopicsFeed = ({ initTopicIndex, navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();
    const feedPager = useRef();
    const globalTopics = useSelector(state => state.globalTopics);
    const globalTopicStacks = globalTopics.map(topic => topic.reelays).filter(stack => stack.length > 0);

    const [feedPosition, setFeedPosition] = useState(initTopicIndex);
    const [refreshing, setRefreshing] = useState(false);

    console.log('global topic stacks: ', globalTopicStacks);

    useEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: true }); // to ensure tab bar is always here
        // loadSelectedFeed();
    }, []);

    const extendFeed = () => {
        // todo
    }

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const refreshFeed = () => {
        // todo
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        return (
            <TopicStack 
                stack={stack} 
                stackViewable={stackViewable}
                feedIndex={index}
                initialStackPos={0}
                navigation={navigation}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = globalTopicStacks[nextFeedPosition];
            const prevStack = globalTopicStacks[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                source: 'topics',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setFeedPosition(feedPosition);
        }
    }

    return (
        <TopicsFeedContainer>
            {globalTopicStacks.length < 1 && <ActivityIndicator />}
            {globalTopicStacks.length >= 1 && (
                <FlatList
                    data={globalTopicStacks}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={1}
                    initialScrollIndex={feedPosition}
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
        </TopicsFeedContainer>
    );
}
