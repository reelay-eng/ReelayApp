import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { FeedContext } from '../../context/FeedContext';
import ReelayStack from './ReelayStack';
import FeedOverlay from '../overlay/FeedOverlay';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';

import { deleteReelay } from '../../api/ReelayApi';
import { getMostRecentStacks } from '../../api/ReelayDBApi';

import { showErrorToast, showMessageToast } from '../utils/toasts';
const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: center;
    height: ${height}px;
    width: ${width}px;
`

export default ReelayFeed = ({ navigation, 
    initialFeedPos = 0,
    fixedStackList = [],
    forceRefresh = false, 
}) => {

    const feedPager = useRef();
    const nextPage = useRef(0);
    const stackPager = useRef();

    const { user } = useContext(AuthContext);
    const { overlayVisible } = useContext(FeedContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);

    const [tabPressCounter, setTabPressCounter] = useState(0);

    const isFixedStack = fixedStackList.length != 0;

    console.log('FEED IS RENDERING');

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
        // this is DANGEROUS and should be in a try/catch
        // const unsubscribe = navigation.dangerouslyGetParent()
        //     .addListener('tabPress', e => {
        //         e.preventDefault();
        //         onTabPress();
        //     });
        // return unsubscribe;
    }, [stackList, feedPosition]);

    const extendFeed = async () => {
        if (isFixedStack) return;

        const page = nextPage.current;
        const fetchedStacks = await getMostRecentStacks(page);

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

    // const onFeedSwiped = async (e) => {
    //     const prevReelay = getReelayInFeed(feedPosition);
    //     const nextReelay = getReelayInFeed(e.nativeEvent.position);
    //     const swipeDirection = e.nativeEvent.position < feedPosition ? 'up' : 'down';

    //     if (feedPosition !== e.nativeEvent.position) {
    //         console.log('Setting new feed position: ', e.nativeEvent.position);
            // Amplitude.logEventWithPropertiesAsync('swipedFeed', {
            //     nextReelayID: nextReelay.id,
            //     nextReelayCreator: nextReelay.creator.username,
            //     nextReelayTitle: nextReelay.title.display,
            //     prevReelayID: prevReelay.id,
            //     prevReelayCreator: prevReelay.creator.username,
            //     prevReelayTitle: prevReelay.title.display,
            //     swipeDirection: swipeDirection,
            //     username: user.username,
            // });    
    //         setFeedPosition(e.nativeEvent.position);
    //     }

	// 	if (e.nativeEvent.position === stackList.length - 1) {
    //         console.log('fetching more reelays');
	// 		extendFeed();
	// 	}
	// };

    // const onStackSwiped = async (e) => {
    //     const prevReelay = getReelayInFeed(feedPosition);
    //     const nextReelay = stackList[feedPosition][e.nativeEvent.position];
    //     const swipeDirection = e.nativeEvent.position < feedPosition ? 'left' : 'right';

    //     const stackPosition = e.nativeEvent.position;
    //     const titleID = stackList[feedPosition][0].title.id;
    //     const prevStackPosition = stackPositions[titleID];

    //     if (prevStackPosition === stackPosition) return;

    //     console.log('Setting new stack position', e.nativeEvent.position);
    //     if (Math.abs(prevStackPosition - stackPosition) > 1) return;
        
    //     Amplitude.logEventWithPropertiesAsync('swipedFeed', {
    //         nextReelayID: nextReelay.id,
    //         nextReelayCreator: nextReelay.creator.username,
    //         nextReelayTitle: nextReelay.title.display,
    //         prevReelayID: prevReelay.id,
    //         prevReelayCreator: prevReelay.creator.username,
    //         prevReelayTitle: prevReelay.title.display,
    //         swipeDirection: swipeDirection,
    //         username: user.username,
    //     });

    //     stackPositions[titleID] = stackPosition;
    //     setStackCounter(stackCounter + 1);
    // };

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
        const fetchedStacks = await getMostRecentStacks();        
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
                isFixedStack={isFixedStack}
                isPaused={isPaused} setIsPaused={setIsPaused} 
                navigation={navigation}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        if (y % height === 0) {
            const feedPosition = y / height;
            console.log('feedPosition: ', feedPosition);
            setFeedPosition(feedPosition);
        }
    }
    const onFeedSwipedRef = useRef(onFeedSwiped);

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
                    onScroll={onFeedSwipedRef.current}
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
                <FeedOverlay navigation={navigation} setIsPaused={setIsPaused} onDeleteReelay={onDeleteReelay} />
            }
        </ReelayFeedContainer>
    );

}