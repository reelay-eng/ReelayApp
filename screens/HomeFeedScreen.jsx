import React, { useState, useRef, useEffect } from 'react'
import { StatusBar } from 'react-native'
import styled from 'styled-components/native'

import { Storage, Auth, API, DataStore, graphqlOperation } from 'aws-amplify';
import * as queries from '../src/graphql/queries';

import Header from '../components/home/Header'
import Hero from '../components/home/Hero'
import { SafeAreaView } from 'react-native-safe-area-context';

const Container = styled.View`
	flex: 1;
	background: transparent;
`

export default function HomeFeedScreen({ navigation }) {
	const [reelayList, setReelayList] = useState([]);

	useEffect(() => {
		const navUnsubscribe = navigation.addListener('focus', () => {
			console.log("on home screen");
			console.log("Reelay list: ");
			console.log(reelayList)
			if (reelayList.length == 0) {
				fetchReelays();
			}
		});
		// return the cleanup function
		return navUnsubscribe;
		// subscribe to navigation:
		// fetch reelays every time the user navigates back to this tab
	}, [navigation]);

	const compareReelayPostedDate = (reelayA, reelayB) => {
		if (reelayA.postedDateTime < reelayB.postedDateTime) {
			return -1;
		} else {
			return 1;
		}
	}

	const fetchReelays = async () => {

		// get a list of reelays from the datastore
		const queryResponse = await API.graphql({
			query: queries.reelaysByUploadDate,
			variables: {
				visibility: 'global',
				sortDirection: 'DESC',
				limit: 3
			}
		});
		if (!queryResponse) {
			return;
		}
		console.log(queryResponse);

		// for each reelay fetched
		await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {
	
			// get the video URL from S3
			const signedVideoURI = await Storage.get(reelayObject.videoS3Key, {
				contentType: "video/mp4"
			});
	
		  	// create the reelay object
			setReelayList([]);
			reelayList.push({
				id: reelayObject.id,
				creator: {
					username: String(reelayObject.owner),
					avatar: '../../assets/images/icon.png'
				},
				movie: {
					title: String(reelayObject.movieID),
					poster: require('../assets/images/splash.png')
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
		reelayList.sort(compareReelayPostedDate);
	}	
	

	return (
		<SafeAreaView>
			<StatusBar
				translucent
				backgroundColor='transparent'
				barStyle='light-content'
			/>
			<Container>
				<Header />
				<Hero reelays={reelayList} />
			</Container>
		</SafeAreaView>
	)
};