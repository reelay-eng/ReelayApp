import React, { memo, useContext, useState, useRef, Fragment } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { getIconVenues } from '../utils/VenueIcon';
import { postStreamingSubscriptionToDB } from '../../api/ReelayDBApi';
import { BWButton } from '../global/Buttons';

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

export default StreamingSelector = () => {
    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>{'Where do you stream?'}</StreamingServicesHeader>
            <IconOptions />
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
const IconList = memo(({ onTapVenue }) => {
    const iconVenues = getIconVenues();
    return (
        <IconOptionsContainer>
            {iconVenues.map((venueObj) => {
                const venue = venueObj.venue;
                return (
                    <VenueBadge 
                        key={venue}
                        onTapVenue={onTapVenue}
                        searchVenues={iconVenues} 
                        venue={venue} 
                    />
                );
            })}
        </IconOptionsContainer>
    )
});

const IconOptions = () => {
    const { reelayDBUser, myStreamingSubscriptions, setMyStreamingSubscriptions } = useContext(AuthContext);
    const myStreamingPlatforms = myStreamingSubscriptions.map(({ platform }) => platform);
    const selectedVenues = useRef(myStreamingPlatforms);
    const [saveDisabled, setSaveDisabled] = useState(true);

    const onSave = () => {
        selectedVenues.current.forEach(venue => {
            postStreamingSubscriptionToDB(reelayDBUser?.sub, { platform: venue });
        });

    }
    const onTapVenue = (venue) => {
        if (selectedVenues.current.includes(venue)) {
            selectedVenues.current = selectedVenues.current.filter(v => v !== venue);
            if (selectedVenues.current.length === 0 && !saveDisabled) setSaveDisabled(true);  
        }
        else {
            selectedVenues.current = [...selectedVenues.current, venue];
            if (saveDisabled) setSaveDisabled(false);
        }
    }
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center'}}>
            <IconList onTapVenue={onTapVenue} />
            <VenueSaveButtonContainer>
                <BWButton 
                    disabled={saveDisabled} 
                    text="Save"
                    onPress={onSave}
                />
            </VenueSaveButtonContainer>
        </View>
    );
}

const VenueBadge = ({ venue, searchVenues, subtext="", onTapVenue }) => {
    const [isPressed, setIsPressed] = useState(false);
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
        onTapVenue(venue, !isPressed); 
        setIsPressed(!isPressed);
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
        <PressableVenue onPress={onPress}>
            { (!isPressed) && <VenueGradient /> }
            { subtext.length > 0 && (
                <React.Fragment>
                    <OtherVenueImage source={iconSource} />
                    <OtherVenueSubtext>{subtext}</OtherVenueSubtext>
                </React.Fragment>
            )}
            { !(subtext.length > 0) && <PrimaryVenueImage source={iconSource} /> }
        </PressableVenue>
    );
};