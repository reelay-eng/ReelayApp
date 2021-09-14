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

const venueIcons = [
    { source: iconAmazon, venue: 'amazon', },
    { source: iconAppleTV, venue: 'appletv' },
    { source: iconCrackle, venue: 'crackle' },
    { source: iconCriterion, venue: 'criterion' },
    { source: iconDisney, venue: 'disney' },
    { source: iconFestivals, venue: 'festivals' },
    { source: iconHBO, venue: 'hbomax' },
    { source: iconHulu, venue: 'hulu' },
    { source: iconMubi, venue: 'mubi' },
    { source: iconNetfix, venue: 'netflix' },
    { source: iconOther, venue: 'other' },
    { source: iconParamount, venue: 'paramount' },
    { source: iconPeacock, venue: 'peacock' },
    { source: iconTheaters, venue: 'theaters' },
    { source: iconYouTube, venue: 'youtube' },
];

export const getVenues = () => {
    return venueIcons.map(iconData => iconData.venue);
}    

export const VenueIcon = ({ border, onPress, size = 48, venue }) => {

    const IconPressable = styled(Pressable)`
        border-radius: ${(size / 2) + (border ? 4 : 0)}px;
        border-width: ${border ? 4 : 0}px;
        border-color: white;
    `
    const source = venueIcons.find(vi => vi.venue === venue).source;
    
    return (
        <IconPressable onPress={onPress}>
            <Image source={source} style={{ 
                height: size, width: size, borderRadius: size / 2
            }} />
        </IconPressable>
    );
}