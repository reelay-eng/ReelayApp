import React, { useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Storage } from 'aws-amplify';
import { useDispatch, useSelector } from 'react-redux';
import { appendReelayList, resetFocus, setFeedPosition, setReelayList } from './ReelayFeedSlice';
import * as queries from '../../src/graphql/queries';

import Hero from './Hero';
import Header from './Header';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';
const CLOUDFRONT_BASE_URL = 'https://d1gc0amdqmb8na.cloudfront.net/';

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`
const RefreshContainer = styled(View)`
    margin-top: 28px;
    margin-left: 28px;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    position: absolute;
    z-index: 3;
`

const ReelayFeed = ({ navigation }) => {

    const REELAY_LOAD_BUFFER_SIZE = 3;
    const reelayList = useSelector((state) => state.reelayFeed.reelayList);
    const reelayListNextToken = useSelector((state) => state.reelayFeed.reelayListNextToken);
    const selectedFeedLoaded = useSelector((state) => state.reelayFeed.selectedFeedLoaded);
    const selectedFeedPosition = useSelector((state) => state.reelayFeed.selectedFeedPosition);

    const dispatch = useDispatch();

    useEffect(() => {
        if (reelayList.length == 0) {
            console.log('gotta load the feed');
            fetchReelays({ mostRecent: false });
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

	const onPageSelected = ((e) => {
		dispatch(setFeedPosition(e.nativeEvent.position));
		if (e.nativeEvent.position == reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchReelays({ mostRecent: false });
		}
	});

    const fetchReelays = async ({ mostRecent }) => {
        if (selectedFeedLoaded && !reelayListNextToken) {
            // reached end of feed
            console.log('reached end of feed');
            return;
        }

        // if we're calling the most recent reelays, get them from the top
        const queryResponse = (mostRecent) 
        ? await API.graphql({
            query: queries.reelaysByUploadDate,
            variables: {
                visibility: 'global',
                sortDirection: 'DESC',
                limit: REELAY_LOAD_BUFFER_SIZE,
            }
        }) : await API.graphql({
            query: queries.reelaysByUploadDate,
            variables: {
                visibility: 'global',
                sortDirection: 'DESC',
                limit: REELAY_LOAD_BUFFER_SIZE,
                nextToken: reelayListNextToken
            }
        });
    
        if (!queryResponse) {
            console.log('No query response');
            return;
        }
    
        // for each reelay fetched
        const fetchedReelays = await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {
    
            // get the video URL from S3
            // endsWith condition keeps us backwards compatible with first Reelays, whose keys
            // were not stored in Dynamo with the .mp4 extension. The keys in S3 have that extension though
            const videoS3Key = (reelayObject.videoS3Key.endsWith('.mp4')) 
                ? reelayObject.videoS3Key : (reelayObject.videoS3Key + '.mp4');
                
            const signedVideoURI = await Storage.get(videoS3Key, {
                contentType: "video/mp4"
            });

            const cloudfrontVideoURI = CLOUDFRONT_BASE_URL 
                + videoS3Key.slice(0, videoS3Key.length - ('.mp4'.length)) 
                + '_1500.mp4';
    
            if (reelayObject.tmdbTitleID && reelayObject.isMovie) {
                const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/movie\/${reelayObject.tmdbTitleID}\?api_key\=${TMDB_API_KEY}`;
                reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery)
                    .then((response) => response.json())
                    .then((tmdbTitleObject) => {        
                        return tmdbTitleObject;
                    });

            } else if (reelayObject.tmdbTitleID && reelayObject.isSeries) {
                const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/tv\/${reelayObject.tmdbTitleID}\?api_key\=${TMDB_API_KEY}`;
                reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery)
                    .then((response) => response.json())
                    .then((tmdbTitleObject) => {
                        // TMDb labels titles and release dates differently between movies and series
                        return {
                            ...tmdbTitleObject,
                            title: tmdbTitleObject.name,
                            release_date: tmdbTitleObject.first_air_date,
                        };
                    });
            }

            return {
                id: reelayObject.id,
                creator: {
                    username: String(reelayObject.owner),
                    avatar: '../../assets/images/icon.png'
                },
                movie: {
                    title: reelayObject.tmdbTitleObject 
                        ? reelayObject.tmdbTitleObject.title 
                        : String(reelayObject.movieID),
                    posterURI: reelayObject.tmdbTitleObject
                        ? reelayObject.tmdbTitleObject.poster_path
                        : null,
                },
                titleObject: reelayObject.tmdbTitleObject,
                videoURI: signedVideoURI,
                postedDateTime: Date(reelayObject.createdAt),
                stats: {
                    likes: 99,
                    comments: 66,
                    shares: 33
                }
            };
        });
    
        Promise.all(fetchedReelays).then((items) => {
            // not sure if we should always call nextToken
            const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;
            if (!selectedFeedLoaded) {
                dispatch(setReelayList({
                    initialReelays: items,
                    nextToken: nextToken,
                }));
            } else if (mostRecent) {
                // set the reelayList to be the merger of the old and new
                const mergedReelays = getMergedReelayList(items, reelayList);
                dispatch(setReelayList({
                    initialReelays: mergedReelays,
                    nextToken: nextToken,
                }));
            } else {
                dispatch(appendReelayList({
                    nextReelays: items,
                    nextToken: nextToken,
                }));
            }
        });
    }

    // this function should _only_ be called after calling fetchMostRecentReelays
    const getMergedReelayList = (fetchedReelays, prevFetchedReelays) => {
        console.log('merging lists');
        if (prevFetchedReelays.length == 0) return fetchedReelays;
        if (fetchedReelays.length == 0) return prevFetchedReelays;

        let fetchedReelaysCursor = 0;
        let prevFetchedReelaysCursor = 0;
        const mergedReelays = [];

        while (fetchedReelaysCursor < fetchedReelays.length 
                && prevFetchedReelaysCursor < prevFetchedReelays.length) {
            const fetchedReelay = fetchedReelays[fetchedReelaysCursor];
            const prevFetchedReelay = prevFetchedReelays[prevFetchedReelaysCursor];

            if (fetchedReelay.id == prevFetchedReelay.id) {
                // skip duplicate, push only one
                // todo: handle deleted posts
                mergedReelays.push(prevFetchedReelay);
                prevFetchedReelaysCursor += 1;
                fetchedReelaysCursor += 1;
            } else if (fetchedReelay.postedDateTime < prevFetchedReelay.postedDateTime) {
                // fetchedReelay is older, so push prevFetchedReelay first
                mergedReelays.push(prevFetchedReelay);
                prevFetchedReelaysCursor += 1;
            } else {
                mergedReelays.push(fetchedReelay);
                fetchedReelaysCursor += 1;
            }
        }
        while (prevFetchedReelaysCursor < prevFetchedReelays.length) {
            // push remaining prevFetchedReelays
            const prevFetchedReelay = prevFetchedReelays[prevFetchedReelaysCursor];
            mergedReelays.push(prevFetchedReelay);
            prevFetchedReelaysCursor += 1;
        }
        while (fetchedReelaysCursor < fetchedReelays.length) {
            // push remaining fetchedReelays
            const fetchedReelay = fetchedReelays[fetchedReelaysCursor];
            mergedReelays.push(fetchedReelay);
            fetchedReelaysCursor += 1;
        }
        console.log('merging: ');
        fetchedReelays.map((reelay, index) => {console.log('fetched: ', reelay.id)});
        prevFetchedReelays.map((reelay, index) => {console.log('prev fetched: ', reelay.id)});
        mergedReelays.map((reelay, index) => {console.log('merged: ', reelay.id)});
        return mergedReelays;
    }

	return (
		<View>
			{ reelayList.length <1 && <Text>Loading...</Text> }
			{ reelayList.length >= 1 && 
				<PagerViewContainer 
					initialPage={0}
					orientation='vertical'
					onPageSelected={onPageSelected}
				>
					{ reelayList.map((reelay, index) => {
						return <Hero 
							reelay={reelay} 
							key={index} 
							index={index}
							curPosition={selectedFeedPosition} 
						/>;
					})}
				</PagerViewContainer>
			}
            <Header />
            <RefreshContainer>
                <TouchableOpacity onPress={() => {
                    console.log('pressing');
                    fetchReelays({ mostRecent: true});

                }} style={{zIndex: 3}}>
                    <Ionicons name="refresh-sharp" size={24} color="white" />
                </TouchableOpacity>
            </RefreshContainer>
		</View>
	);
}  

export default ReelayFeed;