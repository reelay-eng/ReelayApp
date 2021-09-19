import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import { ActivityIndicator } from 'react-native-paper';

import { 
    deleteReelay, 
    fetchFeedNextPage, 
    fetchReelaysForStack,
} from '../../api/ReelayApi';

import FeedOverlay from '../overlay/FeedOverlay';
import Hero from './Hero';
import { showErrorToast, showMessageToast } from '../utils/toasts';

// Please move these into an environment variable (preferably injected via your build step)
const FEED_BATCH_SIZE = 5;
const PLAY_PAUSE_ICON_TIMEOUT = 800;

const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
`
const PagerViewContainer = styled(PagerView)`
    height: ${height}px;
    background-color: black;
`
const TopRightContainer = styled(View)`
    position: absolute;
    left: ${width - 130}px;
    top: 40px;
    zIndex: 3;
`

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    const ICON_SIZE = 96;
    const IconContainer = styled(Pressable)`
        position: absolute;
        left: ${(width - ICON_SIZE) / 2}px;
        opacity: 50;
        top: ${(height - ICON_SIZE) / 2}px;
        height: ${ICON_SIZE}px;
        width: ${ICON_SIZE}px;
        zIndex: 3;
    `
    return (
        <IconContainer onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
    );
}

const StackLocation = ({ position, length }) => {
    const StackLocationOval = styled(View)`
        align-items: flex-end;
        align-self: flex-end;
        background-color: white;
        border-radius: 12px;
        justify-content: center;
        height: 22px;
        width: 60px;
        zIndex: 3;
    `
    const StackLocationText = styled(Text)`
        align-self: center;
        color: black;
        font-size: 16px;
        font-family: System;
    `
    const text = String(position + 1) + ' / ' + String(length);
    return (
        <StackLocationOval>
            <StackLocationText>{ text }</StackLocationText>
        </StackLocationOval>
    );
}

export default ReelayFeed = ({ navigation, forceRefresh = false }) => {

    const feedPager = useRef();
    const nextPage = useRef(0);
    const stackPager = useRef();

    const { user } = useContext(AuthContext);
    const { overlayVisible } = useContext(VisibilityContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [iconVisible, setIconVisible] = useState('none');
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);
    const [stackPositions, setStackPositions] = useState({});

    console.log('FEED IS RENDERING');
    console.log('feed position: ', feedPosition);
    console.log('next page: ', nextPage.current);
    // console.log('isPaused', isPaused);
    // console.log('stackList length: ', stackList.length);
    // console.log('stackCounter: ', stackCounter);
    // console.log('stackPositions: ', stackPositions);
    // console.log('overlay visible: ', visibilityContext.overlayVisible);

    useEffect(() => {
        const stackEmpty = !stackList.length;
        if (stackEmpty || forceRefresh) {
            console.log('gotta load the feed');
            try {
                extendFeed();
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

    useEffect(() => {
        // this is DANGEROUS and should be in a try/catch
        console.log('ON TAB PRESS IS SET');
        const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', e => {
            e.preventDefault();
            onTabPress();
        });
        return unsubscribe;
    }, [stackList, feedPosition]);

    const extendFeed = async () => {
        let page = nextPage.current;
        let filteredReelays = [];

        // keep querying until we can extend
        // can be empty if fetched reelays are for duplicate titles, so we keep going
        while (!filteredReelays.length) {
            filteredReelays = await fetchFeedNextPage({ 
                batchSize: FEED_BATCH_SIZE, 
                page: page, 
                reelayList: stackList.map(stack => stack[0]),
                refresh: false,
            });
            page += FEED_BATCH_SIZE;
        }

        const fetchedStacks = await fetchStacks({ filteredReelays: filteredReelays });
        const newStackList = [...stackList, ...fetchedStacks];
        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);

        nextPage.current = page;
        setStackList(newStackList);

        return filteredReelays;
    }

    const fetchStacks = async ({ filteredReelays, batchSize = 10 }) => {
        const nextStacks = await Promise.all(filteredReelays.map(async (nextReelay) => {
            const filteredStackReelays = await fetchReelaysForStack({
                stack: [nextReelay], 
                page: 0, 
                batchSize: batchSize,
            });
            return [nextReelay, ...filteredStackReelays];
        }));
        return nextStacks;
    }

    const getReelayInFeed = (feedPosition) => {
        const currentStack = stackList[feedPosition];
        const currentStackPosition = stackPositions[currentStack[0].titleID];
        return currentStack[currentStackPosition];
    }

    const onDeleteReelay = async (reelay) => {
        // todo: this should probably be a try/catch
        const deleteSuccess = deleteReelay(reelay);
        if (!deleteSuccess) {
            showErrorToast('Could not find your Reelay in the database. Strange...');
            return;
        }

        const feedDeletePosition = stackList.findIndex(stack => stack[0].titleID === reelay.titleID);
        const stack = stackList[feedDeletePosition];

        if (stack.length === 1) {
            setStackList(stackList.filter(stack => stack[0].id !== reelay.id));
        } else {
            const nextStack = stack.filter(nextReelay => nextReelay.id !== reelay.id);
            stackList[feedDeletePosition] = nextStack;
            setStackCounter(stackCounter + 1);
        }
    };

    const onFeedSwiped = async (e) => {
        console.log('ON FEED SWIPED: ', e.nativeEvent.position);
        const prevReelay = getReelayInFeed(feedPosition);
        const nextReelay = getReelayInFeed(e.nativeEvent.position);
        const swipeDirection = e.nativeEvent.position < feedPosition ? 'up' : 'down';

		setFeedPosition(e.nativeEvent.position);
		if (e.nativeEvent.position === stackList.length - 1) {
            console.log('fetching more reelays');
			extendFeed();
		}

        Amplitude.logEventWithPropertiesAsync('swipedFeed', {
            nextReelayID: nextReelay.id,
            nextReelayCreator: nextReelay.creator.username,
            nextReelayTitle: nextReelay.title,
            prevReelayID: prevReelay.id,
            prevReelayCreator: prevReelay.creator.username,
            prevReelayTitle: prevReelay.title,
            swipeDirection: swipeDirection,
            username: user.username,
        })
	};

    const onStackSwiped = async (e) => {
        console.log('ON STACK SWIPED', e.nativeEvent.position);
        const prevReelay = getReelayInFeed(feedPosition);
        const nextReelay = stackList[feedPosition][e.nativeEvent.position];
        const swipeDirection = e.nativeEvent.position < feedPosition ? 'left' : 'right';

        const stackPosition = e.nativeEvent.position;
        const titleID = stackList[feedPosition][0].titleID;
        const prevStackPosition = stackPositions[titleID];

        if (prevStackPosition === stackPosition) return;
        if (Math.abs(prevStackPosition - stackPosition) > 1) return;
        stackPositions[titleID] = stackPosition;
        
        setStackCounter(stackCounter + 1);

        Amplitude.logEventWithPropertiesAsync('swipedFeed', {
            nextReelayID: nextReelay.id,
            nextReelayCreator: nextReelay.creator.username,
            nextReelayTitle: nextReelay.title,
            prevReelayID: prevReelay.id,
            prevReelayCreator: prevReelay.creator.username,
            prevReelayTitle: prevReelay.title,
            swipeDirection: swipeDirection,
            username: user.username,
        })
    };

    const onTabPress = async () => {
        if (!stackList.length) return;

        console.log('IN ON TAB PRESS');
        const titleID = stackList[0][0].titleID;
        if (feedPosition === 0) {
            if (stackPositions[titleID] === 0) {
                console.log('feed refreshing');
                refreshFeed();
            } else if (stackPager?.current) {
                console.log('feed NOT refreshing');
                stackPositions[titleID] = 0; 
                stackPager.current.setPage(0);    
                setStackCounter(stackCounter + 1);
            }
        } else {
            console.log('feed positioning to 0');
            feedPager.current.setPage(0);
            setFeedPosition(0);
        }
    };

    const playPause = () => {
        if (isPaused) {
            console.log('SET PLAYING STARTED');
            setIsPaused(false);
            setIconVisible('pause');
            setTimeout(() => {
                setIconVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    
            console.log('SET PLAYING FINISHED');
        } else {
            console.log('SET PAUSED STARTED');
            setIsPaused(true);
            setIconVisible('play');
            setTimeout(() => {
                if (iconVisible === 'play') {
                    setIconVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   
            console.log('SET PAUSED FINISHED'); 
        }
    }

    const refreshFeed = async () => {
        console.log('REFRESHING FEED');        
        const filteredReelays = await fetchFeedNextPage({ 
            batchSize: FEED_BATCH_SIZE, 
            page: 0, 
            reelayList: stackList.map(stack => stack[0]),
            refresh: true 
        });
        const fetchedStacks = await fetchStacks({ 
            filteredReelays: filteredReelays 
        });
          
        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);
        nextPage.current = FEED_BATCH_SIZE;
        setStackList(fetchedStacks);        
        // the user is at the top of the feed
        // but the message is at the bottom of the screen
        showMessageToast('You\'re at the top', { position: 'bottom' });
    }
    
	return (
		<ReelayFeedContainer>
			{ stackList.length <1 && <ActivityIndicator /> }
			{ stackList.length >= 1 && 
				<PagerViewContainer ref={feedPager} initialPage={0} orientation='vertical' onPageSelected={onFeedSwiped}>
					{ stackList.map((stack, feedIndex) => {
                        const stackPosition = stackPositions[stack[0].titleID];
                        const firstStackOnlyRef = feedIndex === 0 ? stackPager : null;
                        return (
                            <ReelayFeedContainer key={stack[0].titleID}>
                                <PagerViewContainer ref={firstStackOnlyRef} initialPage={0} orientation='horizontal' onPageSelected={onStackSwiped}>
                                    { stack.map((reelay, stackIndex) => {
                                        return <Hero stack={stack} key={reelay.id} 
                                                    isPaused={isPaused} setIsPaused={setIsPaused}
                                                    feedIndex={feedIndex} feedPosition={feedPosition}
                                                    stackIndex={stackIndex} stackPosition={stackPosition} 
                                                    playPause={playPause} />;
                                    })}
                                </PagerViewContainer>
                                <TopRightContainer>
                                    <Poster reelay={stack[stackPosition]} showTitle={false} />
                                    { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                                </TopRightContainer>
                                { iconVisible !== 'none' && <PlayPauseIcon onPress={playPause} type={iconVisible} /> }
                            </ReelayFeedContainer>
                        );
					})}
				</PagerViewContainer>
			}
            { overlayVisible && 
                <FeedOverlay navigation={navigation} setIsPaused={setIsPaused} onDeleteReelay={onDeleteReelay} />
            }
		</ReelayFeedContainer>
	);
}