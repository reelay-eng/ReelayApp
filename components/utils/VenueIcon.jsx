import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const ICON_PATH = '../../assets/icons/venues/';

const iconAmazon = require(ICON_PATH + 'amazon.png');
const iconAppleTV = require(ICON_PATH + 'appletv.png');
const iconCrackle = require(ICON_PATH + 'crackle.png');
const iconCriterion = require(ICON_PATH + 'criterion.png');
const iconCrunchyroll = require(ICON_PATH + 'crunchyroll.png');
const iconDisney = require(ICON_PATH + 'disney.png');
const iconFestivals = require(ICON_PATH + 'festivals.png');
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
const iconPlutoTV = require(ICON_PATH + 'plutotv.png');
const iconShudder = require(ICON_PATH + 'shudder.png');
const iconTheaters = require(ICON_PATH + 'cinemas.png');
const iconTubi = require(ICON_PATH + 'tubi.jpeg');
const iconYouTube = require(ICON_PATH + 'youtube.png');



// When adding a new venue, be sure to add it in back end if it should be selectable as a preferred streaming service.
export const streamingVenues = [
    { source: iconAppleTV, venue: 'appletv', tmdbProviderID: 2 },
    { source: iconDisney, venue: 'disney', tmdbProviderID: 337 },
    { source: iconHBO, venue: 'hbomax', tmdbProviderID: 384 },
    { source: iconNetflix, venue: 'netflix', tmdbProviderID: 8 },

    { source: iconAmazon, venue: 'amazon', tmdbProviderID: 119 },
    { source: iconHulu, venue: 'hulu', tmdbProviderID: 15 },
    { source: iconCriterion, venue: 'criterion', tmdbProviderID: 258 },
    { source: iconParamount, venue: 'paramount', tmdbProviderID: 531 },

    { source: iconMubi, venue: 'mubi', tmdbProviderID: 11 },
    { source: iconPeacock, venue: 'peacock', tmdbProviderID: 387 },
    { source: iconPlutoTV, venue: 'plutotv', tmdbProviderID: 0 },
    { source: iconTubi, venue: 'tubi', tmdbProviderID: 0 },
    
    { source: iconYouTube, venue: 'youtube', tmdbProviderID: 192 },
    { source: iconShudder, venue: 'shudder', tmdbProviderID: 0 },
    { source: iconCrunchyroll, venue: 'crunchyroll', tmdbProviderID: 0 },
    { source: iconCrackle, venue: 'crackle', tmdbProviderID: 12 },
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

export const getStreamingVenues = () => {
    return streamingVenues;
}    

export const getOtherVenues = () => {
    return otherVenues;
}

export const VenueIcon = memo(({ border = 0, onPress, size = 48, venue }) => {

    const searchItems = [...streamingVenues, ...otherVenues];
    const sourceVenueObject = venue?.length ? searchItems.find(vi => vi.venue === venue) : null;
    const isOther = venue?.length ? otherVenues.map(e => e.venue)?.includes(venue) : null;
    const source = isOther ? sourceVenueObject?.oldSource : sourceVenueObject?.source;
    const radius = (size / 2) + (border ? 4 : 0);
    
    const IconPressable = styled(Pressable)`
        border-radius: ${radius}px;
        border-width: ${border}px;
        border-color: ${venue === 'other' ? 'blue' : 'white'};
    `
    return (
        <>
        {
            source && 
            (
                <IconPressable onPress={onPress}>
                <Image source={source} style={{ 
                    height: size, width: size, borderRadius: size / 2
                }} />
                </IconPressable>
            )
        }
        </>
    );
});