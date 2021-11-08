import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import { ActivityIndicator } from 'react-native-paper';

import { deleteReelay } from '../../api/ReelayApi';
import { getMostRecentStacks } from '../../api/ReelayDBApi';

import FeedOverlay from '../overlay/FeedOverlay';
import Hero from './Hero';
import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import { VenueIcon } from '../utils/VenueIcon';
import Poster from './Poster';

// const FEED_BATCH_SIZE = 5;
// const MAX_QUERIES_PER_FEED_EXTEND = 10;
const PLAY_PAUSE_ICON_TIMEOUT = 800;

const { height, width } = Dimensions.get('window');

const BackButtonContainer = styled(SafeAreaView)`
    align-self: flex-start;
    margin-left: 16px;
    position: absolute;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
`
const PagerViewContainer = styled(PagerView)`
    height: ${height}px;
    background-color: black;
`
const TopRightContainer = styled(View)`
    position: absolute;
    left: ${width - 110}px;
    top: 20px;
    zIndex: 3;
`
const UnderPosterContainer = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
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
        right: 10px;
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

export default ReelayFeed2 = ({ navigation, 
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
    const [iconVisible, setIconVisible] = useState('none');
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);
    const [stackPositions, setStackPositions] = useState({});

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
            fixedStackList.forEach(stack => {
                const titleID = stack[0].title.id;
                stackPositions[titleID] = 0;
            });            
            setStackList(fixedStackList);
        } else {
            extendFeed();
        }
    }, [navigation]);

    useEffect(() => {
        // this is DANGEROUS and should be in a try/catch
        const unsubscribe = navigation.dangerouslyGetParent()
            .addListener('tabPress', e => {
                e.preventDefault();
                onTabPress();
            });
        return unsubscribe;
    }, [stackList, feedPosition]);

    const extendFeed = async () => {
        if (isFixedStack) return;

        const page = nextPage.current;
        const fetchedStacks = await getMostRecentStacks(page);

        const newStackList = [...stackList, ...fetchedStacks];
        fetchedStacks.forEach(stack => {
            const stackTitleID = stack[0].title.id;
            stackPositions[stackTitleID] = 0
        });

        nextPage.current = page + 1;
        setStackList(newStackList);

        return fetchedStacks;
    }

    const getReelayInFeed = (feedPosition) => {
        const currentStack = stackList[feedPosition];
        const currentStackPosition = stackPositions[currentStack[0].title.id];
        return currentStack[currentStackPosition];
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

    const onFeedSwiped = async (e) => {
        const prevReelay = getReelayInFeed(feedPosition);
        const nextReelay = getReelayInFeed(e.nativeEvent.position);
        const swipeDirection = e.nativeEvent.position < feedPosition ? 'up' : 'down';

        if (feedPosition !== e.nativeEvent.position) {
            console.log('Setting new feed position: ', e.nativeEvent.position);
            Amplitude.logEventWithPropertiesAsync('swipedFeed', {
                nextReelayID: nextReelay.id,
                nextReelayCreator: nextReelay.creator.username,
                nextReelayTitle: nextReelay.title.display,
                prevReelayID: prevReelay.id,
                prevReelayCreator: prevReelay.creator.username,
                prevReelayTitle: prevReelay.title.display,
                swipeDirection: swipeDirection,
                username: user.username,
            });    
            setFeedPosition(e.nativeEvent.position);
        }

		if (e.nativeEvent.position === stackList.length - 1) {
            console.log('fetching more reelays');
			extendFeed();
		}
	};

    const onStackSwiped = async (e) => {
        const prevReelay = getReelayInFeed(feedPosition);
        const nextReelay = stackList[feedPosition][e.nativeEvent.position];
        const swipeDirection = e.nativeEvent.position < feedPosition ? 'left' : 'right';

        const stackPosition = e.nativeEvent.position;
        const titleID = stackList[feedPosition][0].title.id;
        const prevStackPosition = stackPositions[titleID];

        if (prevStackPosition === stackPosition) return;

        console.log('Setting new stack position', e.nativeEvent.position);
        if (Math.abs(prevStackPosition - stackPosition) > 1) return;
        
        Amplitude.logEventWithPropertiesAsync('swipedFeed', {
            nextReelayID: nextReelay.id,
            nextReelayCreator: nextReelay.creator.username,
            nextReelayTitle: nextReelay.title.display,
            prevReelayID: prevReelay.id,
            prevReelayCreator: prevReelay.creator.username,
            prevReelayTitle: prevReelay.title.display,
            swipeDirection: swipeDirection,
            username: user.username,
        });

        stackPositions[titleID] = stackPosition;
        setStackCounter(stackCounter + 1);
    };

    const onTabPress = async () => {
        if (!stackList.length) return;
        navigation.navigate('HomeFeedScreen');

        console.log('IN ON TAB PRESS');
        const titleID = stackList[0][0].title.id;
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
            setIsPaused(false);
            setIconVisible('pause');
            setTimeout(() => {
                setIconVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    
        } else {
            setIsPaused(true);
            setIconVisible('play');
            setTimeout(() => {
                if (iconVisible === 'play') {
                    setIconVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   
        }
    }

    const refreshFeed = async () => {
        if (isFixedStack) return;
        console.log('REFRESHING FEED');        
        const fetchedStacks = await getMostRecentStacks();        
        fetchedStacks.forEach(stack => {
            const stackTitleID = stack[0].title.id;
            stackPositions[stackTitleID] = 0
        });
        nextPage.current = 1;
        setStackList(fetchedStacks);        
        // the user is at the top of the feed
        // but the message is at the bottom of the screen
        showMessageToast('You\'re at the top', { position: 'bottom' });
    }
    
	return (
		<ReelayFeedContainer>
			{ stackList.length <1 && <ActivityIndicator /> }
			{ stackList.length >= 1 && 
				<PagerViewContainer ref={feedPager} initialPage={initialFeedPos} orientation='vertical' onPageSelected={onFeedSwiped}>
					{ stackList.map((stack, feedIndex) => {
                        const stackPosition = stackPositions[stack[0].title.id];
                        const firstStackOnlyRef = feedIndex === 0 ? stackPager : null;
                        const currentReelay = stack[stackPosition];

                        return (
                            <ReelayFeedContainer key={stack[0].title.id}>
                                <PagerViewContainer ref={firstStackOnlyRef} initialPage={0} orientation='horizontal' onPageSelected={onStackSwiped}>
                                    { stack.map((reelay, stackIndex) => {
                                        return <Hero stack={stack} key={reelay.id} 
                                                    isPaused={isPaused} setIsPaused={setIsPaused}
                                                    feedIndex={feedIndex} feedPosition={feedPosition}
                                                    navigation={navigation} 
                                                    stackIndex={stackIndex} stackPosition={stackPosition} 
                                                    playPause={playPause} />;
                                    })}
                                </PagerViewContainer>
                                { isFixedStack && 
                                    <BackButtonContainer>
                                        <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' 
                                            onPress={() => navigation.pop()} />
                                    </BackButtonContainer>
                                }
                                <LikesDrawer reelay={getReelayInFeed(feedPosition)} />
                                <CommentsDrawer reelay={getReelayInFeed(feedPosition)} />
                                <TopRightContainer>
                                    <Poster title={currentReelay.title} />
                                    <UnderPosterContainer>
                                        { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                                        { currentReelay?.content?.venue && <VenueIcon venue={currentReelay.content.venue} size={24} border={2} /> }
                                    </UnderPosterContainer>
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