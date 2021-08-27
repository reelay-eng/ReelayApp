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
    const [nextPage, setNextPage] = useState(0);
    const [feedPosition, setFeedPosition] = useState(0);
    const pager = useRef();

    const visibilityContext = useContext(VisibilityContext);

    useEffect(() => {
        if (reelayList.length == 0) {
            console.log('gotta load the feed');
            try {
                fetchNextReelay({ refresh: false });
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
			fetchNextReelay({ refresh: false });
		}
	});

    const getVideoURI = async (fetchedReelay) => {
        const videoS3Key = (fetchedReelay.videoS3Key.endsWith('.mp4')) 
                ? fetchedReelay.videoS3Key : (fetchedReelay.videoS3Key + '.mp4');
        const signedVideoURI = await Storage.get(videoS3Key, {
            contentType: "video/mp4"
        });
        const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
        return { id: fetchedReelay.tmdbTitleID, signedVideoURI };
    }    
    
    const fetchNextReelay = async ({ refresh, batchSize = 10 }) => {
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
        // console.log('PREPARED REELAYS');
        // preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        // console.log('END PREPARED REELAYS');
        const notDuplicate = (element, index, array) => {
            const alreadyInFeed = reelayList.findIndex(reelay => reelay.titleID === element.titleID) >= 0;
            const alreadyInBatch = array.findIndex((batchEl, ii) => (batchEl.titleID === element.titleID && ii < index)) >= 0;
            return !alreadyInFeed && !alreadyInBatch;
        }
        const filteredReelays = preparedReelays.filter(notDuplicate);
        console.log('FILTERED REELAYS');
        preparedReelays.forEach(reelay => console.log(reelay.title, reelay.creator.username));
        console.log('END FILTERED REELAYS');
        
        const newReelayList = refresh ? [...filteredReelays, ...reelayList]: [...reelayList, ...filteredReelays];

        setReelayList(newReelayList);
        setNextPage(nextPage + batchSize);
        return filteredReelays;
    }

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
                return obj.id === reelay.tmdbTitleID;
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

    const fetchReelaysForFeed = async ({ prevFetchedTitles, page, batchSize }) => {
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY);    
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: page,
            limit: batchSize,
        });
    
        if (fetchFailed(fetchedReelays)) {
            return [];
        }
    
        const preparedReelays = await loadReelays(fetchedReelays);
        const notDuplicate = (element, index, array) => {
            const alreadyInFeed = prevFetchedTitles.findIndex(titleID => titleID === element.titleID) >= 0;
            const alreadyInBatch = array.findIndex((el, ii) => (el.titleID === element.titleID && ii < index)) >= 0;
            return !alreadyInFeed && !alreadyInBatch;
        }
        const filteredReelays = preparedReelays.filter(notDuplicate);
        return filteredReelays;
    }

    const fetchReelaysForStack = async ({ stack, page, batchSize }) => {
        const titleID = stack[0].titleID;
        console.log('AT FETCH REELAYS FOR STACK ', titleID);
        const queryConstraints = r => r.visibility('eq', FEED_VISIBILITY).tmdbTitleID('eq', String(titleID));
    
        const fetchedReelays = await DataStore.query(Reelay, queryConstraints, {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: page,
            limit: batchSize,
        });
    
        if (fetchFailed(fetchedReelays)) {
            return [];
        }
    
        const preparedReelays = await loadReelays(fetchedReelays);
        const notDuplicate = (element) => stack.findIndex(el => el.id == element.id) == -1;
        const filteredReelays = preparedReelays.filter(notDuplicate);
        return filteredReelays;
    }
    
	return (
		<ReelayFeedContainer>
			{ reelayList.length <1 && <ActivityIndicator /> }
			{ reelayList.length >= 1 && 
				<PagerViewContainer ref={pager} initialPage={0} orientation='vertical' onPageSelected={onPageSelected}>
					{ reelayList.map((reelay, index) => {
						return <Hero reelay={reelay} key={index} index={index} curPosition={feedPosition} />;
					})}
				</PagerViewContainer>
			}
            <RefreshContainer>
                <SettingsButton navigation={navigation} />
                <TouchableOpacity
                    style={{ margin: 10 }}
                    onPress={() => {
                        console.log('fetching most recent');
                        fetchNextReelay({ refresh: true});
                    }}>
                    <Ionicons name="refresh-sharp" size={24} color="white" />
                </TouchableOpacity>
                {visibilityContext.overlayVisible && <ReelayOverlay navigation={navigation} />}
            </RefreshContainer>
		</ReelayFeedContainer>
	);
}