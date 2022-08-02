import React, { Fragment, memo } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const ICON_PATH = '../../assets/icons/venues/';
const STREAMING_VENUES_EXPAND_CUTOFF = 12;

const iconAmazon = require(ICON_PATH + 'amazon.png');
const iconAppleTV = require(ICON_PATH + 'appletv.png');
const iconCrackle = require(ICON_PATH + 'crackle.png');;
const iconCriterion = require(ICON_PATH + 'criterion.png');
const iconCrunchyroll = require(ICON_PATH + 'crunchyroll.png');
const iconDiscovery = require(ICON_PATH + 'discovery.png');
const iconDisney = require(ICON_PATH + 'disney.png');
const iconFestivals = require(ICON_PATH + 'festivals.png');
const iconFreevee = require(ICON_PATH + 'freevee.png');
const iconFubo = require(ICON_PATH + 'fubo.png');;
const iconHomeVideo = require(ICON_PATH + "homevideo.png")
const iconHBO = require(ICON_PATH + 'hbomax.png');
const iconHulu = require(ICON_PATH + 'hulu.png');
const iconMubi = require(ICON_PATH + 'mubi.png');
const iconNetflix = require(ICON_PATH + 'netflix.png');
const iconOther = require(ICON_PATH + 'other.png');
const iconOldTheaters = require(ICON_PATH + "oldCinemas.png");
const iconOldHomeVideo = require(ICON_PATH + "oldHomeVideo.png");
const iconOldFestivals = require(ICON_PATH + "oldFestivals.png");
const iconOldOther = require(ICON_PATH + "oldOther.png");
const iconParamount = require(ICON_PATH + 'paramount.png');
const iconPeacock = require(ICON_PATH + 'peacock.png');
const iconPhilo = require(ICON_PATH + 'philo.png');;
const iconPlutoTV = require(ICON_PATH + 'plutotv.png');
const iconRoku = require(ICON_PATH + 'roku.png');;
const iconShowtime = require(ICON_PATH + 'showtime.png');;
const iconShudder = require(ICON_PATH + 'shudder.png');
const iconStarz = require(ICON_PATH + 'starz.png');;
const iconTheaters = require(ICON_PATH + 'cinemas.png');
const iconTubi = require(ICON_PATH + 'tubi.jpeg');
const iconVudu = require(ICON_PATH + 'vudu.png');;
const iconYouTube = require(ICON_PATH + 'youtube.png');

// const iconKanopy = require(ICON_PATH + 'kanopy.png');

const VenueImage = styled(Image)`
    border-radius: ${props => props.size}px;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
`
const IconPressable = styled(Pressable)`
    border-color: ${props => (props.venue === 'other') ? 'blue' : 'white'};
    border-radius: ${props => props.radius}px;
    border-width: ${props => props.border}px;
`

// When adding a new venue, be sure to add it in back end if it should be selectable as a preferred streaming service.
export const streamingVenues = [
    { source: iconNetflix, venue: 'netflix', deeplink: "nflx://", tmdbProviderID: 8 },
    { source: iconHBO, venue: 'hbomax', deeplink: "hbomax://", tmdbProviderID: 384 },
    { source: iconAppleTV, venue: 'appletv', deeplink: "https://tv.apple.com", tmdbProviderID: 2 },
    { source: iconDisney, venue: 'disney', deeplink: "disneyplus://", tmdbProviderID: 337 },

    { source: iconAmazon, venue: 'amazon', deeplink: "aiv://", tmdbProviderID: 119 },
    { source: iconHulu, venue: 'hulu', deeplink: "hulu://", tmdbProviderID: 15 },
    { source: iconCriterion, venue: 'criterion', deeplink: "vhxcriterionchannel://", tmdbProviderID: 258 },
    { source: iconMubi, venue: 'mubi', deeplink: "mubi://",tmdbProviderID: 11 },

    { source: iconPeacock, venue: 'peacock', deeplink: "peacock://", tmdbProviderID: 387 },
    { source: iconParamount, venue: 'paramount', deeplink: "com.cbsvideo.app://", tmdbProviderID: 531 },
    { source: iconCrackle, venue: 'crackle', deeplink: "", tmdbProviderID: 0 }, // TODO
    { source: iconYouTube, venue: 'youtube', deeplink: "youtube://", tmdbProviderID: 192 },
    
    { source: iconPlutoTV, venue: 'plutotv', deeplink: "plutotv://", tmdbProviderID: 0 },
    { source: iconTubi, venue: 'tubi', deeplink: "tubitv://", tmdbProviderID: 0 },
    { source: iconRoku, venue: 'roku', deeplink: "", tmdbProviderID: 0 },
    { source: iconStarz, venue: 'starz', deeplink: "", tmdbProviderID: 0},

    { source: iconFubo, venue: 'fubo', deeplink: "plutotv://", tmdbProviderID: 0 },
    { source: iconVudu, venue: 'vudu', deeplink: "tubitv://", tmdbProviderID: 0 },
    { source: iconDiscovery, venue: 'discovery', deeplink: "", tmdbProviderID: 0 },
    { source: iconShowtime, venue: 'showtime', deeplink: "", tmdbProviderID: 0},
    
    { source: iconCrunchyroll, venue: 'crunchyroll', deeplink: "crunchyroll://", tmdbProviderID: 0 },
    { source: iconShudder, venue: 'shudder', deeplink: "shudder://", tmdbProviderID: 0 },
    { source: iconPhilo, venue: 'philo', deeplink: "crunchyroll://", tmdbProviderID: 0 },
    { source: iconFreevee, venue: 'freevee', deeplink: "shudder://", tmdbProviderID: 0 },
    // { source: iconKanopy, venue: 'kanopy', deeplink: "fb1519029161670311://", tmdbProviderID: 0 },
];

export const otherVenues = [
	{
		source: iconFestivals,
		oldSource: iconOldFestivals,
		text: "At a film festival",
		venue: "festivals",
	},
    {
        source: iconTheaters,
        oldSource: iconOldTheaters,
        text: "In theaters",
        venue: "theaters"
    },
    {
        source: iconHomeVideo,
        oldSource: iconOldHomeVideo,
        text: 'Home video',
        venue: "homevideo"
    },
    {
        source: iconOther,
        oldSource: iconOldOther,
        text: "Other",
        venue: "other"
    },
];

export const getStreamingVenues = (expanded=false) => {
    if (expanded) return streamingVenues;
    return streamingVenues.slice(0, STREAMING_VENUES_EXPAND_CUTOFF);
}    

export const getOtherVenues = () => {
    return otherVenues;
}

const VenueIcon = ({ border = 0, onPress, size = 48, venue }) => {
    const searchItems = [...streamingVenues, ...otherVenues];
    const sourceVenueObject = venue?.length ? searchItems.find(vi => vi.venue === venue) : null;
    const isOther = venue?.length ? otherVenues.map(e => e.venue)?.includes(venue) : null;
    const source = isOther ? sourceVenueObject?.oldSource : sourceVenueObject?.source;
    const radius = (size / 2) + (border ? 4 : 0);
    
    return (
        <Fragment>
            { source && (
                <IconPressable border={border} onPress={onPress} radius={radius} venue={venue}>
                    <VenueImage size={size} source={source} />
                </IconPressable>
            )}
        </Fragment>
    );
}

const areEqual = (prevProps, nextProps) => {
    return prevProps.venue === nextProps.venue;
};

export default memo(VenueIcon, areEqual);
