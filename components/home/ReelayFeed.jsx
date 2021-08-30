import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, TouchableOpacity, Text, SafeAreaView, View } from 'react-native';
import { VisibilityContext } from '../../context/VisibilityContext';
import Constants from 'expo-constants';
import Sentry from 'sentry-expo';

import { Ionicons } from '@expo/vector-icons'; 
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import { ActivityIndicator } from 'react-native-paper';

import { DataStore, SortDirection, Storage } from 'aws-amplify';

import SettingsButton from '../overlay/SettingsButton';
import ReelayOverlay from '../overlay/ReelayOverlay';
import Hero from './Hero';

import { Reelay } from '../../src/models';
import { fetchTitleWithCredits, getDirector, getDisplayActors } from '../../api/TMDbApi';

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
const RefreshContainer = styled(SafeAreaView)`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    position: absolute;
    z-index: 2;
    width: ${width}px;
`

export default ReelayFeed = ({ navigation }) => {

    const [reelayList, setReelayList] = useState([]);
    const [stackList, setStackList] = useState([]);
    const [nextPage, setNextPage] = useState(0);
    const [feedPosition, setFeedPosition] = useState(0);
    const [stackCounter, setStackCounter] = useState(0);
    const [stackPositions, setStackPositions] = useState({});
    const pager = useRef();

    const visibilityContext = useContext(VisibilityContext);

    useEffect(() => {
        if (reelayList.length == 0) {
            console.log('gotta load the feed');
            try {
                fetchFeed({ refresh: false });
            } catch (error) {
                Sentry.Native.captureException(error);
            }
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

	const onPageSelected = (async (e) => {
		setFeedPosition(e.nativeEvent.position);
		if (e.nativeEvent.position == reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchFeed({ refresh: false });
		}
	});

    const getVideoURI = async (fetchedReelay) => {
        const videoS3Key = (fetchedReelay.videoS3Key.endsWith('.mp4')) 
                ? fetchedReelay.videoS3Key : (fetchedReelay.videoS3Key + '.mp4');
        const signedVideoURI = await Storage.get(videoS3Key, {
            contentType: "video/mp4"
        });
        const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
        return { id: fetchedReelay.id, signedVideoURI };
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
    
    const fetchFeed = async ({ refresh, batchSize = 10 }) => {
        const nextPageToFetch = refresh ? 0 : nextPage;
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY);
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: nextPageToFetch / batchSize,
            limit: batchSize,
        });

        if (!fetchedReelays || fetchedReelays.length == 0) {
            console.log('No query response');
            return;
        }

        const preparedReelays = await loadReelays(fetchedReelays);
        const filteredReelays = preparedReelays.filter(notDuplicateInFeed);
        const newReelayList = refresh ? [...filteredReelays, ...reelayList] : [...reelayList, ...filteredReelays];

        const fetchedStacks = await fetchStacks({ nextReelayList: filteredReelays });
        const newStackList = refresh ? [...fetchedStacks, ...stackList] : [...stackList, ...fetchedStacks];

        filteredReelays.forEach(reelay => stackPositions[reelay.titleID] = 0);
        
        setReelayList(newReelayList);
        setStackList(newStackList);
        setNextPage(nextPage + batchSize);
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

    const fetchReelaysForStack = async ({ stack, page, batchSize }) => {
        const titleID = stack[0].titleID;
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).tmdbTitleID('eq', String(titleID));
    
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: page,
            limit: batchSize,
        });
    
        if (!fetchedReelays || fetchedReelays.length == 0) {
            console.log('No query response');
            return;
        }
    
        const preparedReelays = await loadReelays(fetchedReelays);
        const notDuplicate = (element) => stack.findIndex(el => el.id == element.id) == -1;
        const filteredReelays = preparedReelays.filter(notDuplicate);
        return filteredReelays;
    }

    const onLeftTap = async (reelay, position) => {
        const stack = stackList.find(listedStack => listedStack[0].titleID === reelay.titleID);
        const startOfStack = position === 0;
        const shouldLoop = stack.length === 1;
        const nextPosition = (shouldLoop) ? 0 : (startOfStack) ? stack.length - 1: position - 1; 
        stackPositions[stack[0].titleID] = nextPosition;
        setStackCounter(stackCounter + 1);
        return shouldLoop;
    }

    const onRightTap = async (reelay, position) => {
        const stack = stackList.find(listedStack => listedStack[0].titleID === reelay.titleID);
        const endOfStack = position === stack.length - 1;
        const shouldLoop = stack.length === 1;
        const nextPosition = (shouldLoop || endOfStack) ? 0 : position + 1; 
        stackPositions[stack[0].titleID] = nextPosition;
        setStackCounter(stackCounter + 1);
        return shouldLoop;
    }

    const onReelayFinish = async (reelay, position) => {
        await onRightTap(reelay, position);
    };

    const loadReelays = async (fetchedReelays) => {
        const titleObjectPromises = fetchedReelays.map(async reelay => {
            return await fetchTitleWithCredits(reelay.tmdbTitleID, reelay.isSeries);
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
            const uriObject = videoUris.find((obj) => {
                return obj.id === reelay.id;
            });
            const preparedReelay = prepareReelay(reelay, titleObject, uriObject.signedVideoURI);
            return preparedReelay;
        });
        return preparedReelays;
    }

    const prepareReelay =  (fetchedReelay, titleObject, videoURI) => {
        const director = getDirector(titleObject);
        const displayActors = getDisplayActors(titleObject);
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
                director: director,
                displayActors: displayActors,
                overview: titleObject.overview,
                tagline: titleObject.tagline,
                trailerURI: titleObject.trailerURI,
            },
            videoURI: videoURI,
            posterURI: titleObject ? titleObject.poster_path : null,
            postedDateTime: fetchedReelay.uploadedAt,
        };
    }
    
	return (
		<ReelayFeedContainer>
			{ reelayList.length <1 && <ActivityIndicator /> }
			{ reelayList.length >= 1 && 
				<PagerViewContainer ref={pager} initialPage={0} orientation='vertical' onPageSelected={onPageSelected}>
					{ stackList.map((stack, feedIndex) => {
                        const stackPosition = stackPositions[stack[0].titleID];
						return <Hero stack={stack} key={stack[0].titleID} 
                                    feedIndex={feedIndex} feedPosition={feedPosition}
                                    onLeftTap={onLeftTap} onRightTap={onRightTap}
                                    onReelayFinish={onReelayFinish}
                                    stackIndex={stackPosition} stackPosition={stackPosition} />;
					})}
				</PagerViewContainer>
			}
            <RefreshContainer>
                <SettingsButton navigation={navigation} />
                <TouchableOpacity
                    style={{ margin: 10 }}
                    onPress={() => {
                        console.log('fetching most recent');
                        fetchFeed({ refresh: true});
                        if (pager && pager.current) pager.current.setPage(0);
                    }}>
                    <Ionicons name="refresh-sharp" size={24} color="white" />
                </TouchableOpacity>
                {visibilityContext.overlayVisible && <ReelayOverlay navigation={navigation} />}
            </RefreshContainer>
		</ReelayFeedContainer>
	);
}