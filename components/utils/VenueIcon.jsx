import React from 'react';
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
const iconHBO = require(ICON_PATH + 'hbomax.png');
const iconHulu = require(ICON_PATH + 'hulu.png');
const iconMubi = require(ICON_PATH + 'mubi.png');
const iconNetfix = require(ICON_PATH + 'netflix.png');
const iconOther = require(ICON_PATH + 'other.png');
const iconParamount = require(ICON_PATH + 'paramount.png');
const iconPeacock = require(ICON_PATH + 'peacock.png');
const iconTheaters = require(ICON_PATH + 'cinemas.png');
const iconYouTube = require(ICON_PATH + 'youtube.png');

const iconVenues = [
    { source: iconAmazon, venue: 'amazon', },
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

const otherVenues = [
    { source: iconFestivals, text: 'At a film festival', venue: 'festivals' },
    { source: iconTheaters, text: 'In theaters', venue: 'theaters' },
    { source: iconOther, text: 'Other', venue: 'other' },
]

export const getIconVenues = () => {
    return iconVenues.map(iconData => iconData.venue);
}    

export const getOtherVenues = () => {
    return otherVenues;
}

export const VenueIcon = ({ border, onPress, size = 48, venue }) => {

    const searchItems = [...iconVenues, ...otherVenues];
    const source = searchItems.find(vi => vi.venue === venue).source;
    
    const IconPressable = styled(Pressable)`
        border-radius: ${(size / 2) + (border ? 4 : 0)}px;
        border-width: ${border ? 4 : 0}px;
        border-color: ${venue === 'other' ? 'blue' : 'white'};
    `
    return (
        <IconPressable onPress={onPress}>
            <Image source={source} style={{ 
                height: size, width: size, borderRadius: size / 2
            }} />
        </IconPressable>
    );
}