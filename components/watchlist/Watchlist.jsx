import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, RefreshControl, TouchableOpacity, View } from 'react-native';

import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import WatchlistItem from './WatchlistItem';
import { AuthContext } from '../../context/AuthContext';
import { getWatchlistItems } from '../../api/WatchlistApi';
import WatchlistSwipeableRow from './WatchlistSwipeableRow';
import { useDispatch, useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import TitlePoster from '../global/TitlePoster';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClapperboard, faPlay, faPlayCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { getReelaysByTitleKey } from '../../api/ReelayDBApi';
import { animate } from '../../hooks/animations';
import VenueIcon, { streamingVenues } from '../utils/VenueIcon';
import SeenOn from '../titlePage/SeenOn';
import * as Linking from 'expo-linking';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { showErrorToast  } from '../utils/toasts';

const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;
const EXPAND_VIEW_OPPOSITE_OFFSET = -1 * (width / 2);
const WATCHLIST_CARD_WIDTH = (width / 2) - (CARD_SIDE_MARGIN * 2);

const ArtistBadgeView = styled(View)`
    align-items: center;
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 4px;
    display: flex;
    flex-direction: row;
`
const ArtistRow = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-top: 12px;
`
const ArtistText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const ExpandedView = styled(View)`
    background-color: #1c1c1c;
    border-radius: 12px;
    height: ${props => props.loading ? `${WATCHLIST_CARD_WIDTH * 1.5}px` : 'auto'};
    margin-left: ${props => props.onLeftSide ? 0 : EXPAND_VIEW_OPPOSITE_OFFSET}px;
    margin-top: 12px;
    margin-bottom: 12px;
    width: ${width - (2 * CARD_SIDE_MARGIN)}px;
    z-index: ${props => props.expanded ? 10 : 0};
`
const InfoView = styled(View)`
    justify-content: space-between;
    width: 100%;
    padding: 16px;
`
const OverviewText = styled(ReelayText.Body2)`
    color: white;
`
const RefreshView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    width: 100%;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    text-align: center;
`
const RuntimeView = styled(View)`
    background-color: rgba(10, 10, 10, 0.7);
    border-radius: 8px;
    padding: 4px 8px 4px 8px; 
    position: absolute;
    right: 2px;
    top: 10px;
`
const SeeReelaysPressable = styled(TouchableOpacity)`
    align-items: center;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    flex-direction: row;
    justify-content: center;
    margin-top: 12px;
    padding-left: 12px;
    padding-right: 12px;
`
const SeeReelaysText = styled(ReelayText.Overline)`
    color: white;
`
const WatchlistCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${CARD_SIDE_MARGIN}px;
    width: ${WATCHLIST_CARD_WIDTH}px;
    z-index: ${props => props.expanded ? 10 : 0};
`
const VenueBadgePressable = styled(TouchableOpacity)`
    padding-right: 12px;
`
const VenueView = styled(View)`
    height: 40px;
    flex-direction: row;
    margin-bottom: 12px;
    width: 100%;
`

const ActorLine = ({ actorName0, actorName1 }) => {
    if (!actorName0) return <View />;
    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faStar} color='white' size={18} />
            <ArtistBadgeView>
                <ArtistText>{actorName0}</ArtistText>
            </ArtistBadgeView>
            { actorName1 && (
                <Fragment>
                    <FontAwesomeIcon icon={faStar} color='white' size={18} />
                    <ArtistBadgeView>
                        <ArtistText>{actorName1}</ArtistText>
                    </ArtistBadgeView>
                </Fragment>
            )}
        </ArtistRow>
    );
}

const DirectorLine = ({ directorName }) => {
    if (!directorName) return <View />;
    return (
        <ArtistRow>
            <FontAwesomeIcon icon={faClapperboard} color='white' size={18} />
            <ArtistBadgeView>
                <ArtistText>{directorName}</ArtistText>
            </ArtistBadgeView>
        </ArtistRow>
    );
}    

const WatchlistCard = ({ item, index, navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchedReelays, setFetchedReelays] = useState([]);

    const titleObj = item.title;
    const titleType = titleObj?.isSeries ? 'tv' : 'film';
    const tmdbTitleID = titleObj?.id;
    const titleKey = `${titleType}-${tmdbTitleID}`;

    const getDisplayVenues = () => {
        const venues = fetchedReelays.map(reelay => reelay.content.venue);
        const removeDuplicates = (nextVenue, index) => {
            if (!nextVenue) return false;
            return venues.indexOf(nextVenue) === index;
        }
        return venues.filter(removeDuplicates);
    }

    const advanceToTitleScreen = () => navigation.push('TitleDetailScreen', { titleObj });
    const displayVenues = getDisplayVenues();
    const onPress = () => setExpanded(!expanded);
    const onLeftSide = (index % 2 === 0);

    const advanceToSeeReelays = async () => {
        if (fetchedReelays?.length > 0) {
            navigation.push("TitleFeedScreen", {
                initialStackPos: 0,
                fixedStackList: [fetchedReelays],
            });        
        }
    }

    const loadReelays = async () => {
        setLoading(true);
        const preparedReelays = await getReelaysByTitleKey({
            authSession,
            reqUserSub: reelayDBUser?.sub,
            titleKey,
        });
        setFetchedReelays(preparedReelays);
        setLoading(false);
    }

    useEffect(() => {
        if (expanded && fetchedReelays.length === 0) {
            loadReelays();
        }
    }, [expanded]);

    const ExpandedCard = () => {
        useEffect(() => {
            animate(300, 'keyboard', 'opacity');
            return () => animate(300, 'keyboard', 'opacity');
        }, [expanded]);

        const ReelaysLine = () => {
            return (
                <SeeReelaysPressable onPress={advanceToSeeReelays}>
                    <SeeReelaysText>{`See reelays (${fetchedReelays.length})`}</SeeReelaysText>
                </SeeReelaysPressable>
            );    
        }

        const TitleInfo = () => {
            return (
                <InfoView>
                    <VenueInfo />
                    <OverviewText>{titleObj.overview}</OverviewText>
                    <DirectorLine directorName={titleObj?.director?.name} />
                    <ActorLine actorName0={titleObj?.displayActors[0]?.name} actorName1={titleObj?.displayActors[1]?.name} />
                    <ReelaysLine />
                </InfoView>
            );
        }

        const VenueButton = ({ venue }) => {
            const source = streamingVenues.find((venueObj) => venueObj.venue === venue)?.source;
            const deeplinkURL = (venue === 'theaters')
                ? `https://google.com/search?q=${encodeURIComponent(titleObj.display + ' showtimes near me')}`
                : streamingVenues.find((venueObj) => venueObj.venue === venue)?.deeplink;

            const attemptOpenDeeplinkURL = async () => {
                if (deeplinkURL) {
                    try {
                        if (await Linking.canOpenURL(deeplinkURL)) {
                            logAmplitudeEventProd("seenOnStreamingAppOpened", {
                                titleType,
                                tmdbTitleID,
                                venue,
                                source,
                                deeplinkURL
                            });
                            await Linking.openURL(deeplinkURL);
                        }
                        else {
                            showErrorToast("You must first install that app.");
                            logAmplitudeEventProd("seenOnStreamingAppNotInstalled", {
                                titleType,
                                tmdbTitleID,
                                venue,
                                source,
                                deeplinkURL
                            });
                        }
                    }
                    catch(e) {
                        showErrorToast("Something went wrong.");
                        logAmplitudeEventProd("seenOnStreamingAppError", {
                            titleType,
                            tmdbTitleID,
                            venue,
                            source,
                            deeplinkURL
                        });
                        console.log(e);
                    }    
                }
            }

            return (
                <VenueBadgePressable onPress={() => console.log('what: ', venue)}>
                    <VenueIcon onPress={attemptOpenDeeplinkURL} venue={venue} size={40} />
                </VenueBadgePressable>
            )
        }

        const VenueInfo = () => {
            if (displayVenues?.length === 0) return <View />;
            return (
                <VenueView>
                    { displayVenues.map(venue => <VenueButton key={venue} venue={venue} /> )}
                </VenueView>
            )
        }

        return (
            <ExpandedView loading={loading} onLeftSide={onLeftSide}>
                { !loading && (
                    <TitleInfo />
                )}
                { loading && (
                    <RefreshView>
                        <ActivityIndicator />
                    </RefreshView>
                )}
            </ExpandedView>
        );
    }

    return (
        <WatchlistCardView expanded={expanded} onPress={onPress}>
            <TitlePoster title={item.title} width={WATCHLIST_CARD_WIDTH} />
            { expanded && <ExpandedCard /> }
        </WatchlistCardView>
    );
}

export default Watchlist = ({ navigation, refresh, watchlistItems }) => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);

    const onRefresh = async () => {
        setRefreshing(true);
        const nextWatchlistItems = await getWatchlistItems(reelayDBUser?.sub);
        dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems })
        setRefreshing(false);
    }

    useEffect(() => {
        if (refresh) onRefresh();
    }, []);

    const renderWatchlistItem = ({ item, index }) => {    
        return <WatchlistCard item={item} index={index} navigation={navigation} />;
    }

    return (
        <View style={{ height: '100%' }}>
            <FlatList
                data={watchlistItems}
                numColumns={2}
                estimatedItemSize={100}
                keyboardShouldPersistTaps={"handled"}
                keyExtractor={item => String(item.id)}
                renderItem={renderWatchlistItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}