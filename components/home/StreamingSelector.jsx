import React, { memo, useContext, useState, useRef, Fragment } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { getIconVenues } from '../utils/VenueIcon';
import { BWButton } from '../global/Buttons';

import { postStreamingSubscriptionToDB, removeStreamingSubscription } from '../../api/ReelayDBApi';
import { refreshMyStreamingSubscriptions } from '../../api/ReelayUserApi';

const StreamingServicesContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
`
const StreamingServicesHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
`
const VenueSaveButtonContainer = styled.View`
    margin-top: 10px;
    width: 88%;
    height: 40px;
`

export default StreamingSelector = ({ onRefresh, setEditDrawerVisible }) => {
    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>{'Where do you stream?'}</StreamingServicesHeader>
            <IconOptions onRefresh={onRefresh} />
        </StreamingServicesContainer>
    )
}

const IconOptionsContainer = styled.View`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
`
const IconList = memo(({ onTapVenue, initSelectedVenues }) => {
    const iconVenues = getIconVenues();
    return (
        <IconOptionsContainer>
            {iconVenues.map((venueObj) => {
                const venue = venueObj.venue;
                const matchVenue = (selectedVenue) => (venue === selectedVenue);
                const initSelected = !!initSelectedVenues.find(matchVenue);
                return (
                    <VenueBadge 
                        key={venue}
                        initSelected={initSelected}
                        onTapVenue={onTapVenue}
                        searchVenues={iconVenues} 
                        venue={venue} 
                    />
                );
            })}
        </IconOptionsContainer>
    )
});

const IconOptions = ({ onRefresh }) => {
    const IconOptionsContainer = styled(View)`
        align-items: center;
        justify-content: center;
    `
    const { reelayDBUser, myStreamingSubscriptions } = useContext(AuthContext);
    const { setJustShowMeSignupVisible } = useContext(FeedContext);

    const myStreamingPlatforms = myStreamingSubscriptions.map(({ platform }) => platform);
    const selectedVenues = useRef(myStreamingPlatforms);
    const [saveDisabled, setSaveDisabled] = useState(false);

    const addAndRemoveSubscriptionChanges = async () => {
        // compare to find new subscriptions to post
        const postIfNewSubscription = async (selectedVenue) => {
            const matchToSelectedVenue = (platform) => (platform === selectedVenue);
            if (!myStreamingPlatforms.find(matchToSelectedVenue)) {
                // adding a new subscription
                await postStreamingSubscriptionToDB(reelayDBUser?.sub, { platform: selectedVenue });
                return true;
            } else return false;
        }

        // compare to find old subscriptions to remove
        const removeIfOldSubscription = async (subscribedPlatform) => {
            const matchToSubscribedPlatform = (venue) => (venue === subscribedPlatform);
            if (!selectedVenues.current.find(matchToSubscribedPlatform)) {
                // remove unselected platform from subscriptions
                await removeStreamingSubscription(reelayDBUser?.sub, { platform: subscribedPlatform });
                return true;
            } else return false;
        }

        await Promise.all(selectedVenues.current.map(postIfNewSubscription));
        await Promise.all(myStreamingPlatforms.map(removeIfOldSubscription));
    }

    const onSave = async () => {
        if (reelayDBUser?.username === 'be_our_guest') {
            setJustShowMeSignupVisible(true);
            return;
        }
        await addAndRemoveSubscriptionChanges();
        const nextSubscriptions = await refreshMyStreamingSubscriptions(reelayDBUser?.sub);
        await onRefresh();
    }

    const onTapVenue = (venue) => {
        if (selectedVenues.current.includes(venue)) {
            // remove from list
            selectedVenues.current = selectedVenues.current.filter(v => v !== venue);
        } else {
            // add to list
            selectedVenues.current = [...selectedVenues.current, venue];
        }
    }

    return (
        <IconOptionsContainer>
            <IconList initSelectedVenues={myStreamingPlatforms} onTapVenue={onTapVenue} />
            <VenueSaveButtonContainer>
                <BWButton disabled={saveDisabled} text="Save" onPress={onSave} />
            </VenueSaveButtonContainer>
        </IconOptionsContainer>
    );
}

const VenueBadge = ({ venue, searchVenues, initSelected, onTapVenue }) => {
    const [selected, setSelected] = useState(initSelected);
    const iconSource = venue.length ? searchVenues.find((vi) => vi.venue === venue).source : null;
    if (!iconSource) return <Fragment />;

    const PressableVenue = styled(Pressable)`
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
        border-radius: 11px;
        height: 93px;
        justify-content: center;
        margin: 4px;
        width: 80px;
    `
    const PrimaryVenueImage = styled.Image`
        height: 42px;
        width: 42px;
        border-radius: 21px;
        border-width: 1px;
        border-color: white;
    `
    const OtherVenueImage = styled.Image`
        height: 42px;
        width: 42px;
        margin: 5px;
        resizeMode: contain;
    `
    const OtherVenueSubtext = styled(ReelayText.CaptionEmphasized)`
        color: white;
        padding: 5px;
        text-align: center;
    `

    const onPress = () => {
        onTapVenue(venue, !selected); 
        setSelected(!selected);
    };

    const VenueGradient = () => (
        <LinearGradient
            colors={["#272525", "#19242E"]}
            style={{
                flex: 1,
                opacity: 1,
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: `11px`,
            }}
        />
    );

    return (
        <PressableVenue onPress={onPress} selected={selected}>
            { (!selected) && <VenueGradient /> }
            <PrimaryVenueImage source={iconSource} />
        </PressableVenue>
    );
};