import React, { useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Storage } from 'aws-amplify';
import * as queries from '../../src/graphql/queries';

import VideoPlayer from './VideoPlayer'
import Info from './Info'
import Sidebar from './Sidebar'

const { height } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`
const Gradient = styled(LinearGradient)`
	height: 100%;
	justify-content: space-between;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1;
`
const Overlay = styled.View`
	flex: 1;
	flex-direction: row;
`

const ReelayFeed = () => {
	const REELAY_LOAD_BUFFER_SIZE = 3;
	const [initialFeedLoaded, setInitialFeedLoaded] = useState(false);
	const [curPosition, setCurPosition] = useState(0);

	const [reelayList, setReelayList] = useState([]);
	const [reelayListNextToken, setReelayListNextToken] = useState(null);

	useEffect(() => {
		console.log("Using hero effect");
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
			console.log('Reached end of feed');
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
		console.log(queryResponse);

		// should exist (or be set to null) whether the feed is loaded or not
		const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;
		setReelayListNextToken(nextToken);

		// for each reelay fetched
		await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {
	
			// get the video URL from S3
			const signedVideoURI = await Storage.get(reelayObject.videoS3Key, {
				contentType: "video/mp4"
			});

			setReelayList([]);
			reelayList.push({
				id: reelayObject.id,
				creator: {
					username: String(reelayObject.owner),
					avatar: '../../assets/images/icon.png'
				},
				movie: {
					title: String(reelayObject.movieID),
					poster: require('../../assets/images/splash.png')
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
		console.log(reelayList);
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
						return (
							<View key={index}>
								<VideoPlayer
									videoURI={reelay.videoURI}
									poster={require('../../assets/images/splash.png')}
									isPlay={curPosition === index}
								/>
								<Gradient
									locations={[0, 0.26, 0.6, 1]}
									colors={[
										'rgba(26,26,26,0.6)',
										'rgba(26,26,26,0)',
										'rgba(26,26,26,0)',
										'rgba(26,26,26,0.6)'
									]}>
									<Overlay>
										<Info user={reelay.creator} movie={reelay.movie} />
										<Sidebar avatar={reelay.creator.avatar} stats={reelay.stats} />
									</Overlay>
								</Gradient>
							</View>
						);
					})}
				</PagerViewContainer>
			}
		</View>
	);
}  

export default ReelayFeed;