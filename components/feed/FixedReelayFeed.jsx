import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import ReelayStack from './ReelayStack';

import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import ReelayFeedHeader from './ReelayFeedHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`

const FixedReelayFeed = ({ 
    headerDisplayText,
    initialFeedPos = 0,
    initialStackPos = 0,
    feedSource,
    fixedStackList = [],
    forceRefresh = false, 
    navigation,
    firstReelAfterSignup= false
}) => {
    const dispatch = useDispatch();
    const feedPager = useRef();
    const { reelayDBUser } = useContext(AuthContext);
    const [feedPosition, setFeedPosition] = useState(initialFeedPos);
    const [stackList, setStackList] = useState([]);

    useEffect(() => {
        const stackEmpty = !stackList.length;
        if (!stackEmpty && !forceRefresh) {
            console.log('feed already loaded');
            return;
        }

        console.log('gotta load the feed');
        setStackList(fixedStackList);
    }, [navigation]);

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        return (
            <React.Fragment>
                <ReelayStack 
                    feedSource={feedSource}
                    initialStackPos={initialStackPos}
                    navigation={navigation}
                    stack={stack} 
                    stackViewable={stackViewable}
                    firstReelAfterSignup={firstReelAfterSignup}
                />
            </React.Fragment>
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextFeedPosition = Math.round(y / height);
        if (nextFeedPosition === feedPosition) return;

        const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
        const nextStack = stackList[nextFeedPosition];
        const prevStack = stackList[feedPosition];

        const logProperties = {
            nextReelayTitle: nextStack[0].title.display,
            prevReelayTitle: prevStack[0].title.display,
            source: 'fixedStack',
            swipeDirection: swipeDirection,
            username: reelayDBUser?.username,
        }
        logAmplitudeEventProd('swipedFeed', logProperties);
        setFeedPosition(nextFeedPosition);
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    })

    return (
        <ReelayFeedContainer>
            { stackList.length < 1 && <ActivityIndicator /> }
            { stackList.length >= 1 && 
                <FlatList
                    data={stackList}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={2}
                    initialScrollIndex={initialFeedPos}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={stack => String(stack[0].title.id)}
                    maxToRenderPerBatch={2}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
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
            <ReelayFeedHeader 
                displayText={headerDisplayText ?? null}
                feedSource={feedSource}
                navigation={navigation}
            />
        </ReelayFeedContainer>
    );
}

export default memo(FixedReelayFeed, (prevProps, nextProps) => {
    return true;
});