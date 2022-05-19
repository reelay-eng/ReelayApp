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

const SeenOnContainer = styled(View)`
    width: 95%;
    left: 5%;
    margin-bottom: 32px;
`;
const SeenOnHeader = styled(ReelayText.H5Emphasized)`
    padding: 10px;
    color: white;
    margin-top: 2px;
`;
const SeenOnHeaderContainer = styled(View)`
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

export default SeenOn = ({ titleType, tmdbTitleID}) => {
    const myStreamingSubscriptions = useSelector(state => state.myStreamingSubscriptions);
    const myStreamingSubscriptionsUnboxed = myStreamingSubscriptions.map(ss => ss.platform);
    const streamingVenues = getStreamingVenues();
    const streamingVenuesUnboxed = streamingVenues.map(vi => vi.venue);

    const [venuesSeenOnMyStreaming, setVenuesSeenOnMyStreaming] = useState([]);
    const [venuesSeenNotOnMyStreaming, setVenuesSeenNotOnMyStreaming] = useState([]);

    const totalVenuesLength = (venuesSeenOnMyStreaming.length + venuesSeenNotOnMyStreaming?.length) ?? 0;

    const loadVenuesWhereSeen = async () => {
        const venues = await getVenuesWhereSeen(titleType, tmdbTitleID);

        const byVenueInStreamingVenues = (venue) => streamingVenuesUnboxed.includes(venue);
        const streamingVenues = venues.filter(byVenueInStreamingVenues);

        const byVenueInMySubscriptions = (venue) => (myStreamingSubscriptionsUnboxed.includes(venue));
        const byVenueNotInMySubscriptions = (venue) => (!myStreamingSubscriptionsUnboxed.includes(venue));
        const venuesInMySubscriptions = streamingVenues.filter(byVenueInMySubscriptions);
        const venuesNotInMySubscriptions = streamingVenues.filter(byVenueNotInMySubscriptions);

        setVenuesSeenOnMyStreaming(venuesInMySubscriptions);
        setVenuesSeenNotOnMyStreaming(venuesNotInMySubscriptions);
    }

    useEffect(() => {
        loadVenuesWhereSeen();
    }, [])

    const VenueBadge = ({ venue, isOnMyStreaming = false }) => {
        const source = venue.length ? streamingVenues.find((vi) => vi.venue === venue)?.source : null;
        const deeplinkURL = venue.length ? streamingVenues.find((vi) => vi.venue === venue)?.deeplink : null;

        const GRADIENT_START_COLOR = isOnMyStreaming ? "#2977EF": "#272525"
        const GRADIENT_END_COLOR = isOnMyStreaming ? "#FF4848" : "#19242E"

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
                logAmplitudeEventProd("SeenOn_Deeplink_Attempt", {
                    titleType,
                    tmdbTitleID,
                    venue,
                    source,
                });
                try {
                    if (await Linking.canOpenURL(deeplinkURL)) await Linking.openURL(deeplinkURL);
                    else {
                        showErrorToast("You must first install that app.");
                        logAmplitudeEventProd("SeenOn_Deeplink_Open_Failed", {
                            titleType,
                            tmdbTitleID,
                            venue,
                            source,
                            deeplinkURL,
                            message: "app not installed"
                        });
                    }
                }
                catch(e) {
                    showErrorToast("Something went wrong.");
                    logAmplitudeEventProd("SeenOn_Deeplink_Open_Errored", {
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
			<>
                {source && (
					<TouchableVenue onPress={attemptOpenDeeplinkURL} activeOpacity={0.6}>
						<>
                            <LinearGradient
                                colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]}
                                style={{
                                    flex: 1,
                                    opacity: 1,
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: `11px`,
                                }}
                            />
                            <PrimaryVenueImage source={source} />
                        </>
					</TouchableVenue>
				)}
			</>
		);
    };

    return (
        <>
            { (totalVenuesLength > 0) && (
                <SeenOnContainer>
                    <SeenOnHeaderContainer>
                        <SeenOnHeader>Seen On </SeenOnHeader>
                        <Icon type='ionicon' name='exit-outline' size={24} color='white' />
                    </SeenOnHeaderContainer>
                    <VenuesScrollContainer>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} scrollEnabled={totalVenuesLength > 3}>
                            {venuesSeenOnMyStreaming.map((venue, index) => <VenueBadge key={index} venue={venue} isOnMyStreaming />)}
                            {venuesSeenNotOnMyStreaming.map((venue, index) => <VenueBadge key={index} venue={venue} />)}
                        </ScrollView>
                    </VenuesScrollContainer>
                </SeenOnContainer>
            )}
        </>
    )
}

