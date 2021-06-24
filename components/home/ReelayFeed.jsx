import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native'
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Storage } from 'aws-amplify';
import { useDispatch, useSelector } from 'react-redux';
import { appendReelayList, resetFocus, setFeedPosition, setReelayList } from './ReelayFeedSlice';
import * as queries from '../../src/graphql/queries';

import Hero from './Hero';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
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
            fetchReelays();
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

	const onPageSelected = ((e) => {
		dispatch(setFeedPosition(e.nativeEvent.position));
		if (e.nativeEvent.position == reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchReelays();
		}
	});

    const fetchReelays = async () => {
        if (selectedFeedLoaded && !reelayListNextToken) {
            // reached end of feed
            console.log('reached end of feed');
            return;
        }

        const queryResponse = // (selectedFeedLoaded) ? 
        await API.graphql({
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
            const signedVideoURI = await Storage.get(reelayObject.videoS3Key, {
                contentType: "video/mp4"
            });
    
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
                        return tmdbTitleObject;
                    });
            }

            console.log(reelayObject.tmdbTitleObject);

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
            const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;
            if (!selectedFeedLoaded) {
                dispatch(setReelayList({
                    initialReelays: items,
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
		</View>
	);
}  

export default ReelayFeed;