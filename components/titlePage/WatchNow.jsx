import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, ScrollView, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { getVenuesWhereSeen } from '../../api/ReelayDBApi';

import { showErrorToast } from '../utils/toasts';
import styled from 'styled-components/native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import { getStreamingVenues } from '../utils/VenueIcon';
import { LinearGradient } from 'expo-linear-gradient';

import * as Linking from 'expo-linking';
import ReelayColors from '../../constants/ReelayColors';

const WatchNowContainer = styled(View)`
    width: 95%;
    left: 5%;
    margin-bottom: 32px;
`;
const WatchNowHeader = styled(ReelayText.H5Emphasized)`
    color: white;
    font-size: 24px;
    padding: 10px;
`;
const WatchNowHeaderContainer = styled(View)`
    flex-direction: row;
    align-items: center;
    height: 40px;
`
const VenuesScrollContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    padding-left: 5px;
`;

export default WatchNow = ({ titleType, tmdbTitleID}) => {
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
    const myStreamingSubscriptionsUnboxed = myStreamingSubscriptions.map(ss => ss.platform);
    const streamingVenues = getStreamingVenues();
    const streamingVenuesUnboxed = streamingVenues.map(vi => vi.venue);

    const [venuesWatchNowMyStreaming, setVenuesWatchNowMyStreaming] = useState([]);
    const [venuesSeenNotOnMyStreaming, setVenuesSeenNotOnMyStreaming] = useState([]);

    const totalVenuesLength = (venuesWatchNowMyStreaming.length + venuesSeenNotOnMyStreaming?.length) ?? 0;

    const loadVenuesWhereSeen = async () => {
        const venues = await getVenuesWhereSeen(titleType, tmdbTitleID);

        const byVenueInStreamingVenues = (venue) => streamingVenuesUnboxed.includes(venue);
        const streamingVenues = venues.filter(byVenueInStreamingVenues);

        const byVenueInMySubscriptions = (venue) => (myStreamingSubscriptionsUnboxed.includes(venue));
        const byVenueNotInMySubscriptions = (venue) => (!myStreamingSubscriptionsUnboxed.includes(venue));
        const venuesInMySubscriptions = streamingVenues.filter(byVenueInMySubscriptions);
        const venuesNotInMySubscriptions = streamingVenues.filter(byVenueNotInMySubscriptions);

        setVenuesWatchNowMyStreaming(venuesInMySubscriptions);
        setVenuesSeenNotOnMyStreaming(venuesNotInMySubscriptions);
    }

    useEffect(() => {
        loadVenuesWhereSeen();
    }, [])

    const VenueBadge = ({ venue, isOnMyStreaming = false }) => {
        const source = venue.length ? streamingVenues.find((venueObj) => venueObj.venue === venue)?.source : null;
        const deeplinkURL = venue.length ? streamingVenues.find((venueObj) => venueObj.venue === venue)?.deeplink : null;

        const GRADIENT_START_COLOR = "#272525"
        const GRADIENT_END_COLOR = "#19242E"

		const TouchableVenue = styled(TouchableOpacity)`
			width: 100px;
			height: 100px;
			border-radius: 11px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 3px;
		`;

		const PrimaryVenueImage = styled(Image)`
			height: 50%;
			width: 50%;
			border-radius: 200px;
			border-width: 2px;
            border-color: white;
		`;

        const attemptOpenDeeplinkURL = async () => {
            if (deeplinkURL) {
                try {
                    if (await Linking.canOpenURL(deeplinkURL)) {
                        logAmplitudeEventProd("watchNowStreamingAppOpened", {
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
                        logAmplitudeEventProd("watchNowStreamingAppNotInstalled", {
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
                    logAmplitudeEventProd("watchNowStreamingAppError", {
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

        const WatchNowButtonGradient = styled(LinearGradient)`
            flex: 1;
            opacity: 1;
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 11px;
        `

        const CheckmarkCircleContainer = styled(View)`
            position: absolute;
            top: 5px;
            right: 5px;
        `

        const CheckmarkCircle = () => {
            return (
                <CheckmarkCircleContainer>
                    <Icon type="ionicon" name="checkmark-circle" color={ReelayColors.reelayBlue} size={20} />
                </CheckmarkCircleContainer>
            )
        }

		return (
			<>
                {source && (
					<TouchableVenue onPress={attemptOpenDeeplinkURL} activeOpacity={0.6}>
                        <WatchNowButtonGradient colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]}/>
                        <PrimaryVenueImage source={source} />
                        { isOnMyStreaming && <CheckmarkCircle />}
					</TouchableVenue>
				)}
			</>
		);
    };

    return (
        <>
            { (totalVenuesLength > 0) && (
                <WatchNowContainer>
                    <WatchNowHeaderContainer>
                        <WatchNowHeader>{'Watch now'}</WatchNowHeader>
                    </WatchNowHeaderContainer>
                    <VenuesScrollContainer>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} scrollEnabled={totalVenuesLength > 3}>
                            {venuesWatchNowMyStreaming.map((venue, index) => <VenueBadge key={index} venue={venue} isOnMyStreaming />)}
                            {venuesSeenNotOnMyStreaming.map((venue, index) => <VenueBadge key={index} venue={venue} />)}
                        </ScrollView>
                    </VenuesScrollContainer>
                </WatchNowContainer>
            )}
        </>
    )
}

