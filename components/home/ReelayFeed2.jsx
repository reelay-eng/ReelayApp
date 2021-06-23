import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native'
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Storage } from 'aws-amplify';
import { useDispatch, useSelector } from 'react-redux';
import { appendReelayList, resetFocus, setReelayList } from './ReelayFeedSlice';
import * as queries from '../../src/graphql/queries';

import Hero from './Hero';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`

const ReelayFeed2 = ({ navigation }) => {

    const REELAY_LOAD_BUFFER_SIZE = 3;
    const reelayListNextToken = useSelector((state) => state.reelayFeed.reelayListNextToken);
    const selectedFeedLoaded = useSelector((state) => state.reelayFeed.selectedFeedLoaded);

	const [curPosition, setCurPosition] = useState(0);
	const reelayList = useSelector((state) => state.reelayFeed.reelayList);

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
		setCurPosition(e.nativeEvent.position);
        console.log('cur position: ', e.nativeEvent.position);
        console.log('reelay list length', reelayList.length);
		if (e.nativeEvent.position == reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchReelays();
		}
	});

    const fetchReelays = async () => {
        console.log('next token on load', reelayListNextToken);
        console.log('feed loaded', selectedFeedLoaded);

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
    
        // should exist (or be set to null) whether the feed is loaded or not
        // setReelayListNextToken(nextToken);
    
        console.log(queryResponse.data.reelaysByUploadDate.items);

        // for each reelay fetched
        const fetchedReelays = await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {
    
            // get the video URL from S3
            const signedVideoURI = await Storage.get(reelayObject.videoS3Key, {
                contentType: "video/mp4"
            });
    
            if (reelayObject.tmdbTitleID && reelayObject.isMovie) {
                const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/movie/${reelayObject.tmdbTitleID}`;
                reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery);
            } else if (reelayObject.tmdbTitleID && reelayObject.isSeries) {
                const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/tv/${reelayObject.tmdbTitleID}`;
                reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery);
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
                },
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
            console.log('next token: ', nextToken);
            if (selectedFeedLoaded) {
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
							curPosition={curPosition} 
						/>;
					})}
				</PagerViewContainer>
			}
		</View>
	);
}  

export default ReelayFeed2;