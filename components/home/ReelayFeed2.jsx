import React, { useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import styled from 'styled-components/native';
import PagerView from 'react-native-pager-view';

import { API, Auth, Storage } from 'aws-amplify';
import * as queries from '../../src/graphql/queries';

import ProfileButton from '../profile/ProfileButton';
import Hero from './Hero';
import Header from './Header';
import ProfileOverlay from '../profile/ProfileOverlay';
import { ActivityIndicator } from 'react-native-paper';

// Please move these into an environment variable (preferably injected via your build step)
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
const TMDB_API_KEY = '033f105cd28f507f3dc6ae794d5e44f5';
const CLOUDFRONT_BASE_URL = 'https://di92fpd9s7eko.cloudfront.net';

const { height, width } = Dimensions.get('window');

const PagerViewContainer = styled(PagerView)`
	height: ${height}px;
`
const RefreshContainer = styled(View)`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    position: absolute;
    z-index: 2;
    width: ${width}px;
`

export default ReelayFeed2 = ({ navigation }) => {

    const [reelayList, setReelayList] = useState([]);
    const [reelayListNextToken, setReelayListNextToken] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [feedPosition, setFeedPosition] = useState(0);

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
        // const signedVideoURI = await Storage.get(videoS3Key, {
        //     contentType: "video/mp4"
        // });
        const cloudfrontVideoURI = `${CLOUDFRONT_BASE_URL}/public/${videoS3Key}`;
        return cloudfrontVideoURI;
    }

    const getTitleObject = async (reelayObject) => {
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
        const queryResponse = await API.graphql({
            query: queries.reelaysByUploadDate,
            variables: {
                visibility: 'global',
                sortDirection: 'DESC',
                limit: 1,
                nextToken: (mostRecent) ? null : reelayListNextToken,
            }
        });

        if (!queryResponse) {
            console.log('No query response');
            return;
        }

        const reelayObject = queryResponse.data.reelaysByUploadDate.items[0];
        const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;

        const videoURIPromise = getVideoURI(reelayObject);
        const titleObjectPromise = getTitleObject(reelayObject);

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
        setReelayListNextToken(nextToken);
    }


	return (
		<View>
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
            <Header />
            <RefreshContainer>
                <TouchableOpacity
                    style={{ margin: 10 }}
                    onPress={() => {
                        console.log('pressing');
                        fetchNextReelay({ mostRecent: true});

                    }}>
                    <Ionicons name="refresh-sharp" size={24} color="white" />
                </TouchableOpacity>
                <ProfileButton 
                    navigation={navigation} 
                    onPress={() => {
                        setOverlayVisible(true);
                        console.log('overlay visible');
                    }}/>
                {overlayVisible && <ProfileOverlay onClose={() => {
                        setOverlayVisible(false);
                    }}/>
                }
            </RefreshContainer>
		</View>
	);
} 