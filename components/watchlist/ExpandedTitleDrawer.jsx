import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, TouchableOpacity, View } from 'react-native';

import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import { AuthContext } from '../../context/AuthContext';
import { addToMyWatchlist, getWatchlistItems, removeFromMyWatchlist } from '../../api/WatchlistApi';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClapperboard, faStar } from '@fortawesome/free-solid-svg-icons';
import { getReelaysByTitleKey } from '../../api/ReelayDBApi';
import VenueIcon, { streamingVenues } from '../utils/VenueIcon';
import YoutubeVideoEmbed from '../utils/YouTubeVideoEmbed';

import * as Linking from 'expo-linking';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { showErrorToast, showMessageToast  } from '../utils/toasts';
import MarkSeenButton from './MarkSeenButton';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import { getRuntimeString } from '../utils/TitleRuntime';

const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;
const TRAILER_HEIGHT = width * 0.55;
const WATCHLIST_CARD_WIDTH = (width / 2) - (CARD_SIDE_MARGIN * 2);

const AddToWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
    padding-left: 12px;
    padding-right: 12px;
`
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
const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    height: ${props => props.loading ? '10%' : 'auto'};
    margin-top: auto;
    max-height: 80%;
    padding-bottom: 30px;
    width: 100%;
`
const InfoView = styled(View)`
    justify-content: space-between;
    width: 100%;
    padding: 16px;
`
const MarkSeenAndRuntimeView = styled(View)`
    align-items: flex-end;
    height: 72px;
    justify-content: space-between;
`
const MarkSeenOnPosterView = styled(View)`
    position: absolute;
    right: 6px;
    top: 6px;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const NoTrailerText = styled(ReelayText.H6Emphasized)`
    color: white;
    text-align: center;
    width: 80%;
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
const RemoveItemPressable = styled(TouchableOpacity)`
    padding: 6px;
`
const RemoveItemRow = styled(View)`
    align-items: center;
    justify-content: center;
    margin-top: 18px;
    width: 100%;
`
const RemoveItemText = styled(ReelayText.Body2)`
    color: ${ReelayColors.reelayBlue};
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    text-align: center;
`
const RuntimeView = styled(View)`
    background-color: rgba(10, 10, 10, 0.7);
    border-radius: 8px;
    margin-top: 6px;
    margin-bottom: 6px;
    padding: 4px 8px 4px 8px; 
    right: 2px;
`
const SeeReelaysPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.hasReelays 
        ? 'black' 
        : ReelayColors.reelayBlue
    };
    border-color: ${props => props.hasReelays 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-radius: 20px;
    border-width: 1px;
    height: 40px;
    flex-direction: row;
    justify-content: center;
    margin-top: 24px;
    padding-left: 12px;
    padding-right: 12px;
`
const SeeReelaysText = styled(ReelayText.Overline)`
    color: white;
`
const TrailerPlayerView = styled(View)`
    align-items: center;
    background-color: black;
    height: ${TRAILER_HEIGHT}px;
    justify-content: center;
    width: 100%;
`
const WatchlistCardView = styled(Pressable)`
    border-radius: 12px;
    margin: ${CARD_SIDE_MARGIN}px;
    width: ${WATCHLIST_CARD_WIDTH}px;
`
const WatchlistView = styled(View)`
    height: 100%;
`
const VenueBadgeGradient = styled(LinearGradient)`
    height: 60px;
    width: 60px;
    opacity: 1;
    padding: 11px;
    position: absolute;
    border-radius: 11px;
`
const VenueBadgePressable = styled(TouchableOpacity)`
    border-radius: 8px;
    margin-right: 6px;
    padding: 11px;
`
const UnderTrailerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 6px;
    padding-bottom: 6px;
    width: 100%;
`
const VenueView = styled(View)`
    flex-direction: row;
`

const GRADIENT_START_COLOR = "#272525"
const GRADIENT_END_COLOR = "#19242E"

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

const TrailerPlayer = ({ titleDisplay, trailerURI }) => {
    if (!trailerURI) {
        return (
            <TrailerPlayerView>
                <NoTrailerText>{`We don't have a trailer for ${titleDisplay} :(`}</NoTrailerText>
            </TrailerPlayerView>
        );
    }

    return (
        <Fragment>
            {/* <TrailerLoadingView>
                <ActivityIndicator />
            </TrailerLoadingView> */}
            <YoutubeVideoEmbed 
                borderRadius={12}
                height={TRAILER_HEIGHT} 
                youtubeVideoID={trailerURI} 
            />
        </Fragment>
    );
}

const VenueButton = ({ titleKey, titleDisplay, venue }) => {
    const venuesThatAdvanceToSearch = ['festivals', 'homevideo', 'other', 'theaters'];
    const source = streamingVenues.find((venueObj) => venueObj.venue === venue)?.source;
    const deeplinkURL = (venuesThatAdvanceToSearch.includes(venue))
        ? `https://google.com/search?q=${encodeURIComponent('where to watch ' + titleDisplay)}`
        : streamingVenues.find((venueObj) => venueObj.venue === venue)?.deeplink;

    const attemptOpenDeeplinkURL = async () => {
        if (deeplinkURL) {
            try {
                if (await Linking.canOpenURL(deeplinkURL)) {
                    logAmplitudeEventProd("seenOnStreamingAppOpened", {
                        titleKey,
                        venue,
                        source,
                        deeplinkURL
                    });
                    await Linking.openURL(deeplinkURL);
                }
                else {
                    showErrorToast("You must first install that app.");
                    logAmplitudeEventProd("seenOnStreamingAppNotInstalled", {
                        titleKey,
                        venue,
                        source,
                        deeplinkURL
                    });
                }
            } catch(error) {
                showErrorToast("Something went wrong.");
                logAmplitudeEventProd("seenOnStreamingAppError", {
                    titleKey,
                    venue,
                    source,
                    deeplinkURL
                });
                console.log(error);
            }    
        }
    }

    return (
        <VenueBadgePressable onPress={attemptOpenDeeplinkURL}>
            <VenueBadgeGradient colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]} />
            <VenueIcon onPress={attemptOpenDeeplinkURL} venue={venue} size={40} />
        </VenueBadgePressable>
    )
}

export default ExpandedTitleDrawer = ({ 
    navigation, 
    onRefresh, 
    expandedTitle, 
    setExpandedTitle,
    source = 'watchlist',
}) => {
    const authSession = useSelector(state => state.authSession);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const { reelayDBUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetchedReelays, setFetchedReelays] = useState([]);

    const titleObj = expandedTitle.title;
    const titleType = titleObj?.isSeries ? 'tv' : 'film';
    const tmdbTitleID = titleObj?.id;
    const titleKey = `${titleType}-${tmdbTitleID}`;

    const inWatchlist = myWatchlistItems.find((nextItem) => {
        return (tmdbTitleID === nextItem?.tmdbTitleID) 
            && (titleType === nextItem?.titleType)
            && (nextItem?.hasAcceptedRec === true);
    });

    const advanceToSeeReelays = async () => {
        setExpandedTitle(null);
        if (fetchedReelays?.length > 0) {
            navigation.push("TitleFeedScreen", {
                initialStackPos: 0,
                fixedStackList: [fetchedReelays],
            });        
        }
    }

    const advanceToCreateReelay = () => {
        setExpandedTitle(null);
        navigation.push('VenueSelectScreen', { 
            clubID: null,
            topicID: null,
            titleObj: titleObj, 
        });
    }

    const getDisplayVenues = () => {
        const venues = fetchedReelays.map(reelay => reelay.content.venue);
        const removeDuplicates = (nextVenue, index) => {
            if (!nextVenue) return false;
            return venues.indexOf(nextVenue) === index;
        }
        return venues.filter(removeDuplicates);
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
        if (fetchedReelays.length === 0) {
            loadReelays();
        }
    }, []);

    const AddToWatchlistLine = () => {
        const onPress = async () => {
            await addToMyWatchlist({ 
                creatorName: null,
                reelaySub: null,
                reqUserSub: reelayDBUser?.sub,
                tmdbTitleID: titleObj?.tmdbTitleID,
                titleType: expandedTitle?.titleType,
            });

            showMessageToast('Added to your watchlist');
            logAmplitudeEventProd('addToMyWatchlist', {
                title: titleObj.display,
                username: reelayDBUser?.username,
                source: source,
            });    
        }

        return (
            <AddToWatchlistPressable hasReelays={true} onPress={onPress}>
                <SeeReelaysText>{`Add to my watchlist`}</SeeReelaysText>
            </AddToWatchlistPressable>
        );
    }

    const MarkSeenAndRuntime = () => {
        const [markedSeen, setMarkedSeen] = useState(expandedTitle?.hasSeenTitle);
        const runtimeString = getRuntimeString(titleObj?.runtime);
        return (
            <MarkSeenAndRuntimeView>
                <MarkSeenButton 
                    markedSeen={markedSeen} 
                    setMarkedSeen={setMarkedSeen} 
                    showText={true}
                    titleObj={expandedTitle.title}
                />
                <RuntimeView>
                    <RuntimeText>{runtimeString}</RuntimeText>
                </RuntimeView>
            </MarkSeenAndRuntimeView>
        );
    }

    const ReelaysLine = () => {
        const hasReelays = (fetchedReelays.length > 0);

        if (!hasReelays) {
            return (
                <SeeReelaysPressable hasReelays={hasReelays} onPress={advanceToCreateReelay}>
                    <SeeReelaysText>{`Be the first to reelay`}</SeeReelaysText>
                </SeeReelaysPressable>
            )
        }

        return (
            <SeeReelaysPressable hasReelays={hasReelays} onPress={advanceToSeeReelays}>
                <SeeReelaysText>{`See reelays (${fetchedReelays.length})`}</SeeReelaysText>
            </SeeReelaysPressable>
        );    
    }

    const RemoveFromWatchlistLine = () => {
        const onPress = async () => {
            const removeResult = await removeFromMyWatchlist({ 
                reqUserSub: reelayDBUser?.sub,
                tmdbTitleID: titleObj?.id,
                titleType: titleObj?.titleType,
            });

            console.log('remove from watchlist result: ', removeResult);

            showMessageToast('Removed from your watchlist');
            logAmplitudeEventProd('removeItemFromWatchlist', {
                username: reelayDBUser?.username,
                title: titleObj.display,
                source: 'watchlist',
            });    
            setExpandedTitle(null);
            onRefresh();
        }

        return (
            <RemoveItemRow>
                <RemoveItemPressable onPress={onPress}>
                    <RemoveItemText>{`Remove from my watchlist`}</RemoveItemText>
                </RemoveItemPressable>
            </RemoveItemRow>
        );    
    }

    const TitleInfo = () => {
        return (
            <InfoView>
                <TrailerPlayer titleDisplay={titleObj?.display} trailerURI={titleObj?.trailerURI} />
                <UnderTrailerRow />
                <OverviewText numberOfLines={6}>{titleObj.overview}</OverviewText>
                <DirectorLine directorName={titleObj?.director?.name} />
                <ActorLine actorName0={titleObj?.displayActors[0]?.name} actorName1={titleObj?.displayActors[1]?.name} />
                { source === 'watchlist' && <ReelaysLine /> }
                { !inWatchlist && <AddToWatchlistLine /> }
                { inWatchlist && <RemoveFromWatchlistLine /> }
            </InfoView>
        );
    }

    const UnderTrailerRow = () => {
        return (
            <UnderTrailerRowView>
                <VenueInfo />
                <MarkSeenAndRuntime />
            </UnderTrailerRowView>
        );
    }

    const VenueInfo = () => {
        const displayVenues = getDisplayVenues();
        if (displayVenues?.length === 0) return <View />;

        return (
            <VenueView>
                { displayVenues.map(venue => {
                    return (
                        <VenueButton key={venue} 
                            titleDisplay={titleObj?.display} 
                            titleKey={titleKey} 
                            venue={venue} 
                        />
                    ); 
                })}
            </VenueView>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={true}>
                <Backdrop onPress={() => setExpandedTitle(null)} />
                <DrawerContainer loading={loading}>
                    { !loading && <TitleInfo /> }
                    { loading && (
                        <RefreshView>
                            <ActivityIndicator />
                        </RefreshView>
                    )}
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}
