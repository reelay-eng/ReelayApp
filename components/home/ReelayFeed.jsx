import React, { useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Storage } from 'aws-amplify';
import * as queries from '../../src/graphql/queries';

import { 
	useMovieFetchQuery, 
	useSeriesFetchQuery,
	useSeasonFetchQuery,
	useEpisodeFetchQuery,
} from '../../redux/services/TMDbApi';

import Hero from './Hero';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`

const ReelayFeed = () => {
	const REELAY_LOAD_BUFFER_SIZE = 3;
	const [initialFeedLoaded, setInitialFeedLoaded] = useState(false);
	const [curPosition, setCurPosition] = useState(0);

	const [reelayList, setReelayList] = useState([]);
	const [reelayListNextToken, setReelayListNextToken] = useState(null);

	useEffect(() => {
		fetchReelays();
		setInitialFeedLoaded(true);
	});

	const onPageSelected = ((e) => {
		setCurPosition(e.nativeEvent.position);
		if (curPosition == reelayList.length - 1) {
			fetchReelays();
		}
	});

	const fetchReelays = async () => {
		if (initialFeedLoaded && !reelayListNextToken) {
			// we've reached the end of the feed 
			return;
		}

		// get a list of reelays from the datastore
		const queryResponse = (initialFeedLoaded) ? 
		await API.graphql({
			query: queries.reelaysByUploadDate,
			variables: {
				visibility: 'global',
				sortDirection: 'DESC',
				limit: REELAY_LOAD_BUFFER_SIZE,
				nextToken: reelayListNextToken
			}
		}) :
		await API.graphql({
			query: queries.reelaysByUploadDate,
			variables: {
				visibility: 'global',
				sortDirection: 'DESC',
				limit: REELAY_LOAD_BUFFER_SIZE
			}
		});

		if (!queryResponse) {
			console.log('No query response');
			return;
		}

		// should exist (or be set to null) whether the feed is loaded or not
		const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;
		setReelayListNextToken(nextToken);

		// for each reelay fetched
		await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {
	
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

			setReelayList([]);
			reelayList.push({
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
			});
			setReelayList(reelayList);
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

export default ReelayFeed;