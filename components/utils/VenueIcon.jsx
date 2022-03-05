import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const ICON_PATH = '../../assets/icons/venues/';

const iconAmazon = require(ICON_PATH + 'amazon.png');
const iconAppleTV = require(ICON_PATH + 'appletv.png');
const iconCrackle = require(ICON_PATH + 'crackle.png');
const iconCriterion = require(ICON_PATH + 'criterion.png');
const iconDisney = require(ICON_PATH + 'disney.png');
const iconFestivals = require(ICON_PATH + 'festivals.png');
const iconHomeVideo = require(ICON_PATH + "homevideo.png")
const iconHBO = require(ICON_PATH + 'hbomax.png');
const iconHulu = require(ICON_PATH + 'hulu.png');
const iconMubi = require(ICON_PATH + 'mubi.png');
const iconNetfix = require(ICON_PATH + 'netflix.png');
const iconOther = require(ICON_PATH + 'other.png');
const iconOldTheaters = require(ICON_PATH + "oldCinemas.png");
const iconOldHomeVideo = require(ICON_PATH + "oldHomeVideo.png");
const iconOldFestivals = require(ICON_PATH + "oldFestivals.png");
const iconOldOther = require(ICON_PATH + "oldOther.png");
const iconParamount = require(ICON_PATH + 'paramount.png');
const iconPeacock = require(ICON_PATH + 'peacock.png');
const iconTheaters = require(ICON_PATH + 'cinemas.png');
const iconYouTube = require(ICON_PATH + 'youtube.png');

// When adding a new venue, be sure to add it in back end if it should be selectable as a preferred streaming service.
export const iconVenues = [
    { source: iconAmazon, venue: 'amazon' },
    { source: iconAppleTV, venue: 'appletv' },
    { source: iconCrackle, venue: 'crackle' },
    { source: iconCriterion, venue: 'criterion' },
    { source: iconDisney, venue: 'disney' },
    { source: iconHBO, venue: 'hbomax' },
    { source: iconHulu, venue: 'hulu' },
    { source: iconMubi, venue: 'mubi' },
    { source: iconNetfix, venue: 'netflix' },
    { source: iconParamount, venue: 'paramount' },
    { source: iconPeacock, venue: 'peacock' },
    { source: iconYouTube, venue: 'youtube' },
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

export const getIconVenues = () => {
    return iconVenues;
}    

export const getOtherVenues = () => {
    return otherVenues;
}

export const VenueIcon = memo(({ border = 0, onPress, size = 48, venue }) => {

    const searchItems = [...iconVenues, ...otherVenues];
    const sourceVenueObject = venue.length ? searchItems.find(vi => vi.venue === venue) : null;
    const isOther = venue.length ? otherVenues.map(e => e.venue)?.includes(venue) : null;
    const source = isOther ? sourceVenueObject?.oldSource : sourceVenueObject?.source;
    const radius = (size / 2) + (border ? 4 : 0);
    
    const IconPressable = styled(Pressable)`
        border-radius: ${radius}px;
        border-width: 0px;
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