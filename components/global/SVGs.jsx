import * as React from 'react';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';

export const AddToClubsIconSVG = ({ size = 24 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M20 7.5H4C2.89543 7.5 2 8.39543 2 9.5V20.5C2 21.6046 2.89543 22.5 4 22.5H20C21.1046 22.5 22 21.6046 22 20.5V9.5C22 8.39543 21.1046 7.5 20 7.5Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <Path d="M17 1.5L12 6.5L7 1.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <Line x1="12" y1="18.5" x2="12" y2="11.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <Line x1="8.5" y1="15" x2="15.5" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </Svg>
    );
}

export const AddedToClubsIconSVG = ({ size = 24 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M20 7.5H4C2.89543 7.5 2 8.39543 2 9.5V20.5C2 21.6046 2.89543 22.5 4 22.5H20C21.1046 22.5 22 21.6046 22 20.5V9.5C22 8.39543 21.1046 7.5 20 7.5Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <Path d="M17 1.5L12 6.5L7 1.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <Line x1="17.071" y1="12.4142" x2="11.4142" y2="18.0711" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <Line x1="11.3358" y1="18" x2="8.75" y2="15.4142" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </Svg>
    );
}

export const ClubsIconSVG = ({ size = 24 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M20 7.5H4C2.89543 7.5 2 8.39543 2 9.5V20.5C2 21.6046 2.89543 22.5 4 22.5H20C21.1046 22.5 22 21.6046 22 20.5V9.5C22 8.39543 21.1046 7.5 20 7.5Z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <Path d="M17 1.5L12 6.5L7 1.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </Svg>
    );
}

export const AddToWatchlistIconSVG = ({ size=24 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M14 11C14 10.4477 13.5523 10 13 10H3C2.44772 10 2 10.4477 2 11V11C2 11.5523 2.44772 12 3 12H13C13.5523 12 14 11.5523 14 11V11ZM14 7C14 6.44772 13.5523 6 13 6H3C2.44772 6 2 6.44772 2 7V7C2 7.55228 2.44772 8 3 8H13C13.5523 8 14 7.55228 14 7V7ZM18 14V11C18 10.4477 17.5523 10 17 10V10C16.4477 10 16 10.4477 16 11V14H13C12.4477 14 12 14.4477 12 15V15C12 15.5523 12.4477 16 13 16H16V19C16 19.5523 16.4477 20 17 20V20C17.5523 20 18 19.5523 18 19V16H21C21.5523 16 22 15.5523 22 15V15C22 14.4477 21.5523 14 21 14H18ZM2 15C2 15.5523 2.44772 16 3 16H9C9.55228 16 10 15.5523 10 15V15C10 14.4477 9.55228 14 9 14H3C2.44772 14 2 14.4477 2 15V15Z" fill="white"/>
        </Svg>
    );
}

export const WatchlistAddedIconSVG = ({ size=24 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M14 11C14 10.4477 13.5523 10 13 10H3C2.44772 10 2 10.4477 2 11V11C2 11.5523 2.44772 12 3 12H13C13.5523 12 14 11.5523 14 11V11ZM14 7C14 6.44772 13.5523 6 13 6H3C2.44772 6 2 6.44772 2 7V7C2 7.55228 2.44772 8 3 8H13C13.5523 8 14 7.55228 14 7V7ZM2 15C2 15.5523 2.44772 16 3 16H9C9.55228 16 10 15.5523 10 15V15C10 14.4477 9.55228 14 9 14H3C2.44772 14 2 14.4477 2 15V15ZM19.8473 12.2617C20.2413 11.8473 20.9019 11.847 21.2962 12.261L21.3437 12.3108C21.7113 12.6968 21.7115 13.3034 21.3441 13.6896L16.0662 19.2394C15.6725 19.6534 15.0126 19.654 14.6182 19.2408L11.7059 16.1897C11.3374 15.8036 11.3371 15.1961 11.7052 14.8096L11.7533 14.7591C12.1469 14.3458 12.8061 14.3452 13.2004 14.7579L15.3429 17L19.8473 12.2617Z" fill="white"/>
        </Svg>
    );
}

export const HelpingHandsSVG = ({ size=24 }) => {
    return (
        <Svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <Path d="M328.7 52.28L431.7 119.8C449.5 132.9 453.3 157.9 440.2 175.7C427.1 193.5 402.1 197.3 384.3 184.2L296.6 127.1H191.1C183.2 127.1 175.1 135.2 175.1 143.1C175.1 152.7 183.2 159.1 191.1 159.1H254.2C270.2 159.1 284.1 170.9 287.6 186.6C290.8 206.6 275.5 223.1 255.1 223.1H143.1C116.1 223.1 90.87 214.7 69.87 197.7L23.37 159.1L15.1 160C7.25 160 0 152.7 0 143.1V47.99C0 39.25 7.25 32 15.1 32H266.1C289 32 310.9 39.19 328.7 52.28L328.7 52.28zM151.3 459.7L16.27 360.2C-1.509 347.1-5.305 322.1 7.803 304.3C20.93 286.5 45.94 282.7 63.74 295.8L183.4 384H304C312.8 384 320 376.8 320 368C320 359.3 312.8 352 304 352H225.8C209.8 352 195 341.1 192.4 325.4C189.2 305.4 204.5 288 224 288H352C379 288 405.1 297.3 426.1 314.3L472.6 352L496 352C504.7 352 512 359.3 512 368V464C512 472.8 504.7 480 496 480H213C190.1 480 169.1 472.8 151.3 459.7V459.7z"/>
        </Svg>
    );
}