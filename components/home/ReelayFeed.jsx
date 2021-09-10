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

    const authContext = useContext(AuthContext);
    const pager = useRef();
    const visibilityContext = useContext(VisibilityContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [nextPage, setNextPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [reelayList, setReelayList] = useState([]);
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);
    const [stackPositions, setStackPositions] = useState({});

    console.log('is paused: ', isPaused);

    useEffect(() => {
        if (!reelayList.length) {
            console.log('gotta load the feed');
            try {
                fetchFeed({ refresh: false });
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
            if (pager && pager.current) {
                if (feedPosition === 0) {
                    console.log('refreshing feed');
                    fetchFeed({ refresh: true }).then((filteredReelays) => {
                        console.log('refresh returns results');
                        console.log(filteredReelays);
                    });
                    showMessageToast('You\'re at the top');
                }
                if (stackPositions[0] !== 0) {
                    stackPositions[0] = 0;
                    setStackCounter(stackCounter + 1);
                }
                pager.current.setPage(0);
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
        filteredReelays = preparedReelays.filter(notDuplicateInFeed);
        
        console.log('prepared reelays');
        preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        console.log('filtered reelays');
        filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        return filteredReelays;
    }
    
    const fetchFeed = async ({ refresh, batchSize = 5 }) => {
        let page = refresh ? 0 : nextPage;
        let filteredReelays = [];

        if (refresh) {
            // exhaust the new reelays onto the feed
            // empties when we've caught up with the loaded feed
            while (filteredReelays.length) {
                filteredReelays = await fetchFeedNextPage(page, batchSize);
                page += batchSize; // starts at zero on refresh
            }
        } else {
            // keep querying until we can extend
            // can be empty if fetched reelays are for duplicate titles, so we keep going
            while (!filteredReelays.length) {
                filteredReelays = await fetchFeedNextPage(page, batchSize);
                page += batchSize;
            }
        }

        console.log(filteredReelays.length);
        console.log('filtered reelays that made it through');
        filteredReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        const newReelayList = refresh ? [...filteredReelays, ...reelayList] : [...reelayList, ...filteredReelays];

        if (refresh) newReelayList.sort((reelay1, reelay2) => {
            return (reelay1.postedDateTime < reelay2.postedDateTime) ? -1 : 1;
        });
        
        const fetchedStacks = await fetchStacks({ nextReelayList: filteredReelays });
        const newStackList = refresh ? [...fetchedStacks, ...stackList] : [...stackList, ...fetchedStacks];
        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);

        if (refresh) {
            // do nothing. page math is tricky, just let the feed extend as needed
        } else {
            setNextPage(page + batchSize);
        }

        // if (refresh) {
        //     setNextPage(batchSize);
        // } else {
        //     setNextPage(nextPage + batchSize);
        // }

        setReelayList(newReelayList);
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

    const fetchStacks = async ({ nextReelayList, batchSize = 10 }) => {
        const nextStacks = await Promise.all(nextReelayList.map(async (nextReelay) => {
            const filteredReelays = await fetchReelaysForStack({
                stack: [nextReelay], 
                page: 0, 
                batchSize: batchSize,
            });
            return [nextReelay, ...filteredReelays];
        }));
        return nextStacks;
    }

    const getReelayInFeed = (feedPosition) => {
        const currentStack = stackList[feedPosition];
        const currentStackPosition = stackPositions[currentStack[0].titleID];
        return currentStack[currentStackPosition];
    }

    const notDuplicateInFeed = (preparedReelay, index, array) => {
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
		if (e.nativeEvent.position === reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchFeed({ refresh: false });
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
			{ reelayList.length <1 && <ActivityIndicator /> }
			{ reelayList.length >= 1 && 
				<PagerViewContainer ref={pager} initialPage={0} orientation='vertical' onPageSelected={onFeedSwiped}>
					{ stackList.map((stack, feedIndex) => {
                        const stackPosition = stackPositions[stack[0].titleID];
                        return (
                            <ReelayFeedContainer key={stack[0].titleID}>
                                <PagerViewContainer initialPage={0} orientation='horizontal' onPageSelected={onStackSwiped}>
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