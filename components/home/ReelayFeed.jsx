import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, Text, SafeAreaView, View } from 'react-native';
import { VisibilityContext } from '../../context/VisibilityContext';

import { find } from 'lodash';

import { Ionicons } from '@expo/vector-icons'; 
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import { ActivityIndicator } from 'react-native-paper';

import { Auth, DataStore, Predicates, SortDirection, Storage } from 'aws-amplify';

import SettingsButton from '../overlay/SettingsButton';
import ReelayOverlay from '../overlay/ReelayOverlay';
import Hero from './Hero';
import Header from './Header';

import { Reelay } from '../../src/models';

// Please move these into an environment variable (preferably injected via your build step)
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';
const CLOUDFRONT_BASE_URL = 'https://di92fpd9s7eko.cloudfront.net';

const { height, width } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
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
    // const [reelayListNextToken, setReelayListNextToken] = useState(null);
    const [nextPage, setNextPage] = useState(0);
    const [feedPosition, setFeedPosition] = useState(0);

    const visibilityContext = useContext(VisibilityContext);

    useEffect(() => {
        if (reelayList.length == 0) {
            console.log('gotta load the feed');
            fetchNextReelay({ mostRecent: false });
        } else {
            console.log('feed already loaded');
        }
    }, [navigation]);

	const onPageSelected = ((e) => {
		setFeedPosition(e.nativeEvent.position);
		if (e.nativeEvent.position == reelayList.length - 1) {
            console.log('fetching more reelays');
			fetchNextReelay({ mostRecent: false });
		}
	});

    const getVideoURI = async (reelayObject) => {
        const videoS3Key = (reelayObject.videoS3Key.endsWith('.mp4')) 
                ? reelayObject.videoS3Key : (reelayObject.videoS3Key + '.mp4');
        const signedVideoURI = await Storage.get(videoS3Key, {
            contentType: "video/mp4"
        });
        const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
        return cloudfrontVideoURI;
    }

    const getTitleObject = async (reelayObject) => {
        console.log(reelayObject);
        if (!reelayObject.tmdbTitleID) return null;

        const tmdbTitleQuery = (reelayObject.isSeries)
            ? `${TMDB_API_BASE_URL}\/tv\/${reelayObject.tmdbTitleID}\?api_key\=${TMDB_API_KEY}`
            : `${TMDB_API_BASE_URL}\/movie\/${reelayObject.tmdbTitleID}\?api_key\=${TMDB_API_KEY}`;

        const titleObjectResponse = await fetch(tmdbTitleQuery);
        const titleObject = await titleObjectResponse.json();

        if (reelayObject.isSeries) {
            return {
                ...titleObject,
                title: titleObject.name,
                release_date: titleObject.first_air_date
            }
        } else {
            return titleObject;
        }
    }

    const compareReelaysByPostedDate = (reelay1, reelay2) => {
        return (reelay1.postedDateTime < reelay2.postedDateTime) ? -1 : 1;
    }

    const fetchNextReelay = async ({ mostRecent }) => {

        const queryResponse = await DataStore.query(Reelay, r => r.visibility('eq', 'global'), {
            sort: r => r.uploadedAt(SortDirection.DESCENDING),
            page: nextPage,
            limit: 1,
        });

        console.log(queryResponse);

        if (!queryResponse) {
            console.log('No query response');
            return;
        }

        const reelayObject = queryResponse[0];

        const videoURIPromise = getVideoURI(reelayObject);
        const titleObjectPromise = getTitleObject(reelayObject);


        if (mostRecent && find(reelayList, (nextReelay) => { return nextReelay.id == reelayObject.id})) {
            // most recent object already in list
            return;
        } 

        const preparedReelay = {
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
            titleObject: await titleObjectPromise,
            videoURI: await videoURIPromise,
            postedDateTime: Date(reelayObject.createdAt),
            stats: {
                likes: 99,
                comments: 66,
                shares: 33
            }
        };
        
        const newReelayList = [...reelayList, preparedReelay];
        setReelayList(newReelayList.sort(compareReelaysByPostedDate));
        setNextPage(nextPage + 1);
    }

	return (
        // todo: make a background image of REELAY that appears behind the feed when videos are loading
		<View style={{ backgroundColor: 'black'}}>
			{ reelayList.length <1 && <ActivityIndicator /> }
			{ reelayList.length >= 1 && 
				<PagerViewContainer 
					initialPage={0}
					orientation='vertical'
					onPageSelected={onPageSelected}
				>
                    {/* You probably want to have another component here - <ReelayFeedComponent /> */}
                    {/*  In fact, I would just have the entire render step take place in another function and have this component be responsible for the loading state and the data fetching */}

                    {/* <ReelayFeed data={reelayList}/> */}
					{ reelayList.map((reelay, index) => {
						return <Hero 
							reelay={reelay} 
							key={index} 
							index={index}
							curPosition={feedPosition}
						/>;
					})}
				</PagerViewContainer>
			}
            <RefreshContainer>
                <SettingsButton navigation={navigation} />
                <TouchableOpacity
                    style={{ margin: 10 }}
                    onPress={() => {
                        fetchNextReelay({ mostRecent: true});
                    }}>
                    <Ionicons name="refresh-sharp" size={24} color="white" />
                </TouchableOpacity>
                {visibilityContext.overlayVisible && <ReelayOverlay navigation={navigation} />}
            </RefreshContainer>
		</View>
	);
}