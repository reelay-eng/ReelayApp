import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { VisibilityContext } from '../../context/VisibilityContext';
import Constants from 'expo-constants';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import { ActivityIndicator } from 'react-native-paper';

import { DataStore, SortDirection, Storage } from 'aws-amplify';
import { Reelay } from '../../src/models';
import { fetchAnnotatedTitle } from '../../api/TMDbApi';

import FeedOverlay from '../overlay/FeedOverlay';
import Hero from './Hero';
// import VenueIcon from '../utils/VenueIcon';
import { showMessageToast } from '../utils/toasts';

// Please move these into an environment variable (preferably injected via your build step)
const CLOUDFRONT_BASE_URL = 'https://di92fpd9s7eko.cloudfront.net';
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

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

export default ReelayFeed = ({ navigation, refreshIndex }) => {

    const feedPager = useRef();
    const stackPager = useRef();
    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [nextPage, setNextPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    // const [reelayList, setReelayList] = useState([]);
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);
    const [stackPositions, setStackPositions] = useState({});

    console.log('FEED IS RENDERING');
    console.log('feed position: ', feedPosition);
    console.log('next page: ', nextPage);
    console.log('isPaused', isPaused);
    // console.log('reelayList length: ', reelayList.length);
    console.log('stackList length: ', stackList.length);
    console.log('stackCounter: ', stackCounter);
    console.log('stackPositions: ', stackPositions);
    console.log('overlay visible: ', visibilityContext.overlayVisible);

    useEffect(() => {
        if (!stackList.length) {
            console.log('gotta load the feed');
            try {
                refreshFeed();
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

    useEffect(() => {
        // this is DANGEROUS and should be in a try/catch
        const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', e => {
			e.preventDefault();
            if (feedPager && feedPager.current) {
                if (feedPosition === 0) {
                    console.log('refreshing feed');
                    refreshFeed();
                    showMessageToast('You\'re at the top');
                }
                if (stackPositions[0] !== 0) {
                    stackPositions[0] = 0;
                    setStackCounter(stackCounter + 1);
                }
                feedPager.current.setPage(0);
                stackPager.current.setPage(0);
            }
        });
        return unsubscribe;
    }, [navigation, feedPosition]);

    const getVideoURI = async (fetchedReelay) => {
        const videoS3Key = (fetchedReelay.videoS3Key.endsWith('.mp4')) 
                ? fetchedReelay.videoS3Key : (fetchedReelay.videoS3Key + '.mp4');
        const s3VideoURI = await Storage.get(videoS3Key, {
            contentType: "video/mp4"
        });
        const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
        return { id: fetchedReelay.id, videoURI: cloudfrontVideoURI };
    }    

    const fetchFeedNextPage = async (page, batchSize) => {
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY);
        console.log('query initiated, page: ', page / batchSize, ', limit: ', batchSize);
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: page / batchSize,
            limit: batchSize,
        });
        console.log('query finished');

        if (!fetchedReelays || !fetchedReelays.length) {
            console.log('No query response');
            return [];
        }

        const preparedReelays = await prepareReelayBatch(fetchedReelays);
        const filteredReelays = preparedReelays.filter(notDuplicateInFeed);
        
        console.log('prepared reelays');
        preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        console.log('filtered reelays');
        filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        return filteredReelays;
    }

    const refreshFeed = async (batchSize = 5) => {
        const filteredReelays = await fetchFeedNextPage(0, batchSize);
        console.log('IN REFRESH FEED, filtered reelay length: ', filteredReelays.length);
        const fetchedStacks = await fetchStacks({ filteredReelays: filteredReelays });
        console.log('fetched stacks length: ', fetchedStacks.length);
        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);

        setNextPage(batchSize);
        // setReelayList(filteredReelays);
        setStackList(fetchedStacks);

        return filteredReelays;
    }
    
    const extendFeed = async (batchSize = 5) => {
        let page = nextPage;
        let filteredReelays = [];

        // keep querying until we can extend
        // can be empty if fetched reelays are for duplicate titles, so we keep going
        while (!filteredReelays.length) {
            filteredReelays = await fetchFeedNextPage(page, batchSize);
            page += batchSize;
        }

        console.log(filteredReelays.length);
        console.log('filtered reelays that made it through');
        filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        // const newReelayList = [...reelayList, ...filteredReelays];
        
        const fetchedStacks = await fetchStacks({ filteredReelays: filteredReelays });
        const newStackList = [...stackList, ...fetchedStacks];
        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);

        setNextPage(page);
        // setReelayList(newReelayList);
        setStackList(newStackList);

        return filteredReelays;
    }

    const fetchReelaysForStack = async ({ stack, page, batchSize }) => {
        const titleID = stack[0].titleID;
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).tmdbTitleID('eq', String(titleID));
    
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: page,
            limit: batchSize,
        });
    
        if (!fetchedReelays || !fetchedReelays.length) {
            console.log('No query response');
            return;
        }
    
        const preparedReelays = await prepareReelayBatch(fetchedReelays);
        const notDuplicate = (element) => stack.findIndex(el => el.id == element.id) == -1;
        const filteredReelays = preparedReelays.filter(notDuplicate);
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

    const notDuplicateInFeed = (preparedReelay, index, array) => {
        const reelayList = stackList.map(stack => stack[0]);
        const alreadyInFeed = (reelayList.findIndex(listReelay => {
            return listReelay.titleID === preparedReelay.titleID;
        }) >= 0);
        const alreadyInBatch = (array.findIndex((batchEl, ii) => {
            return (batchEl.titleID === preparedReelay.titleID) && (ii < index);
        }) >= 0);
        return !alreadyInFeed && !alreadyInBatch;
    }

    const onDeleteReelay = async (reelay) => {
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).id('eq', String(reelay.id));
        const queryResponse = await DataStore.query(Reelay, queryConstraints);

        if (!queryResponse || !queryResponse.length) {
            console.log('No query response');
            showErrorToast('Could not find your Reelay in the database. Strange...');
            return;
        }

        const fetchedReelay = queryResponse[0];
        await DataStore.save(Reelay.copyOf(fetchedReelay, updated => {
            updated.visibility = 'hidden';
        }));

        const feedDeletePosition = stackList.findIndex(stack => stack[0].titleID === reelay.titleID);
        const stack = stackList[feedDeletePosition];

        if (stack.length === 1) {
            setStackList(stackList.filter(stack => stack[0].id !== reelay.id));
            // setReelayList(reelayList.filter(nextReelay => nextReelay.id !== reelay.id));
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
            username: authContext.user.username,
        })
	};

    const onStackSwiped = async (e) => {
        const prevReelay = getReelayInFeed(feedPosition);
        const nextReelay = stackList[feedPosition][e.nativeEvent.position];
        const swipeDirection = e.nativeEvent.position < feedPosition ? 'left' : 'right';

        const stackPosition = e.nativeEvent.position;
        const titleID = stackList[feedPosition][0].titleID;
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
            username: authContext.user.username,
        })
    };

    const prepareReelayBatch = async (fetchedReelays) => {
        const titleObjectPromises = fetchedReelays.map(async reelay => {
            return await fetchAnnotatedTitle(reelay.tmdbTitleID, reelay.isSeries);
        });
        const videoURIPromises = fetchedReelays.map(async reelay => {
            return await getVideoURI(reelay);
        });
    
        const titles = await Promise.all(titleObjectPromises);
        const videoUris = await Promise.all(videoURIPromises);
    
        const preparedReelays = fetchedReelays.map(reelay => {
            const titleIndex = titles.findIndex(title => {
                return Number(title.id) === Number(reelay.tmdbTitleID);
            });
            const titleObject = titles[titleIndex];
            if (!titleObject) {
                console.log('IN PREPARE REELAY, TITLE OBJECT IS NULL');
                console.log('reelay: ', reelay);
                console.log('titleIndex: ', titleIndex);
                console.log('titles: ', titles);
            }
            const uriObject = videoUris.find((obj) => {
                return obj.id === reelay.id;
            });
            const preparedReelay = prepareReelay(reelay, titleObject, uriObject.videoURI);
            return preparedReelay;
        });
        return preparedReelays;
    }

    const prepareReelay =  (fetchedReelay, titleObject, videoURI) => {
        const releaseYear = (titleObject && titleObject.release_date && titleObject.release_date.length >= 4)
            ? (titleObject.release_date.slice(0,4)) : '';	
    
        return {
            id: fetchedReelay.id,
            titleID: titleObject.id,
            title: titleObject.title,
            releaseDate: titleObject.release_date,
            releaseYear: releaseYear,
            creator: {
                username: String(fetchedReelay.owner),
                avatar: '../../assets/images/icon.png'
            },
            overlayInfo: {
                director: titleObject.director,
                displayActors: titleObject.displayActors,
                overview: titleObject.overview,
                tagline: titleObject.tagline,
                trailerURI: titleObject.trailerURI,
            },
            venue: fetchedReelay.venue ? fetchedReelay.venue : null,
            videoURI: videoURI,
            posterURI: titleObject ? titleObject.poster_path : null,
            postedDateTime: fetchedReelay.uploadedAt,
        };
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
                                        return <Hero stack={stack} key={reelay.id} isPaused={isPaused} setIsPaused={setIsPaused}
                                                    feedIndex={feedIndex} feedPosition={feedPosition}
                                                    stackIndex={stackIndex} stackPosition={stackPosition} />;
                                    })}
                                </PagerViewContainer>
                                <TopRightContainer>
                                    <Poster reelay={stack[stackPosition]} showTitle={false} />
                                    { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                                </TopRightContainer>
                            </ReelayFeedContainer>
                        );
					})}
				</PagerViewContainer>
			}
            {visibilityContext.overlayVisible && <FeedOverlay navigation={navigation} onDeleteReelay={onDeleteReelay} />}
		</ReelayFeedContainer>
	);
}