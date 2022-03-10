import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { getFeed } from '../../api/ReelayDBApi';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native-paper';
import { getIconVenues } from '../../components/utils/VenueIcon';
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
    padding-left: 15px;
    padding-top: 15px;
    color: white;
`
const StreamingServicesElementRowContainer = styled.ScrollView`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 10px;
`

const OnMyStreamingServices = memo(({ navigation }) => {

    const { reelayDBUser } = useContext(AuthContext);
    const [streamingStacks, setStreamingStacks] = useState([]);
    const [hasPickedStreamingServicesBefore, setHasPickedStreamingServicesBefore] = useState("loading");

    useEffect(() => {
        (async () => {
            let nextStreamingStacks = await getFeed({ reqUserSub: reelayDBUser?.sub, feedSource: "streaming", page: 0 });
            setStreamingStacks(nextStreamingStacks);
        })();
    }, [])

    useEffect(() => {
        (async () => {
            const value = await AsyncStorage.getItem("hasPickedStreamingServicesBefore");
            if (value !== null) {
                setHasPickedStreamingServicesBefore(true);
            }
            else setHasPickedStreamingServicesBefore(false);
        })()
    }, [])

    console.log(hasPickedStreamingServicesBefore);

    const goToReelay = (index, titleObj) => {
		if (streamingStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'streaming',
            isOnFeedTab: false
		});

		logAmplitudeEventProd('openStreamingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    if (hasPickedStreamingServicesBefore === "loading") return <ActivityIndicator />
    if (!hasPickedStreamingServicesBefore) return (
        <StreamingServiceSelector />
    )
    
    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>My Streaming Services</StreamingServicesHeader>
            
                { streamingStacks.length > 0 && (
                    <StreamingServicesElementRowContainer horizontal>
                        { streamingStacks.map((stack, index) => {
                            return (
                                <StreamingServicesElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                            )
                        })}
                    </StreamingServicesElementRowContainer>
                )}
        </StreamingServicesContainer>
    )
});

const StreamingServicesElementContainer = styled.Pressable`
    margin-right: 16px;
    display: flex;
    width: 133px;
`

const StreamingServicesPoster = styled.Image`
    width: 133px;
    height: 200px;
    border-radius: 8px;
`

const StreamingServicesReleaseYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`

const StreamingServicesTitle = styled(ReelayText.H6)`
    margin-top: 10px;
    color: white;
    opacity: 1;
`

const StreamingServicesElement = ({ onPress, stack }) => {
    return (
        <StreamingServicesElementContainer onPress={onPress}>
            <StreamingServicesPoster source={ stack[0].title.posterSource } />
            <StreamingServicesReleaseYear>{stack[0].title.releaseYear}</StreamingServicesReleaseYear>
            <StreamingServicesTitle>{stack[0].title.display}</StreamingServicesTitle>
        </StreamingServicesElementContainer>
    )
}

const StreamingServiceSelectorDescription = styled(ReelayText.Body2)`
    color: white;
    width: 80%;
    margin-left: 15px;
    margin-top: 5px;
`

const IconContainer = styled.View`
        margin: 4px;
    `
const IconOptionsContainer = styled.View`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
`

const VenueSaveButtonContainer = styled.View`
    margin-top: 10px;
    width: 88%;
    height: 40px;
`


const IconOptions = () => {
    const iconVenues = getIconVenues();
    const { reelayDBUser } = useContext(AuthContext);
    const [hasSelectedVenues, setHasSelectedVenues] = useState(false);

    var selectedVenues = [];

    const onSave = () => {
        selectedVenues.forEach(venue => {
            postStreamingSubscriptionToDB(reelayDBUser?.id, { platform: venue });
        })
        AsyncStorage.setItem('hasPickedStreamingServicesBefore', 1);
    }
    const onTapVenue = (venue) => {
        if (selectedVenues.includes(venue)) {
            console.log("before tap!", selectedVenues)
            selectedVenues = selectedVenues.filter(v => v !== venue);
            if (selectedVenues.length === 0) setHasSelectedVenues(false);
            console.log("after tap!", selectedVenues)
        }
        else {
            console.log("before tap2!", selectedVenues)
            selectedVenues.push(venue);
            if (selectedVenues.length !== 0 && !hasSelectedVenues) setHasSelectedVenues(true);
            console.log("after tap2!", selectedVenues)
        }
    }
    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <IconOptionsContainer>
                {iconVenues.map((venueObj) => {
                    const venue = venueObj.venue;
                    return (
                        <IconContainer key={venue}>
                            <VenueBadge venue={venue} searchVenues={iconVenues} onTapVenue={onTapVenue}/>
                        </IconContainer>
                    );
                })}
            </IconOptionsContainer>
            <VenueSaveButtonContainer>
                <BWButton 
                    disabled={!hasSelectedVenues} 
                    text="Save"
                    onPress={onSave}

                />
            </VenueSaveButtonContainer>
        </View>
    );
}

const VenueBadge = ({ venue, searchVenues, subtext="", onTapVenue }) => {
    const [isPressed, setIsPressed] = useState(false);
    const source = venue.length ? searchVenues.find((vi) => vi.venue === venue).source : null;
    const PressableVenue = styled(Pressable)`
        width: 80px;
        height: 93px;
        border-radius: 11px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
    `;

    const PrimaryVenueImage = styled.Image`
        height: 42px;
        width: 42px;
        border-radius: 21px;
        border-width: 1px;
        border-color: white;
    `;
    const OtherVenueImageContainer = styled.View`
        height: 30px;
        width: 30px;
        margin: 5px;
    `
    const OtherVenueImage = styled.Image`
        height: 100%;
        width: 100%;
        resizeMode: contain;
    `
    const OtherVenueSubtext = styled(ReelayText.CaptionEmphasized)`
        color: white;
        padding: 5px;
        text-align: center;
    `
    return (
        <>
            {source && (
                <PressableVenue onPress={() => {onTapVenue(venue, !isPressed); setIsPressed(!isPressed)}}>
                    {({ pressed }) => (
                        <>
                            {(!pressed && !isPressed) && (
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
                            )}
                            {subtext.length > 0 && (
                                <>
                                    <OtherVenueImageContainer>
                                        <OtherVenueImage source={source} />
                                    </OtherVenueImageContainer>
                                    <OtherVenueSubtext>{subtext}</OtherVenueSubtext>
                                </>
                            )}
                            {!(subtext.length > 0) && <PrimaryVenueImage source={source} />}
                        </>
                    )}
                </PressableVenue>
            )}
        </>
    );
};

const StreamingServiceSelector = () => {

    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>Where do you stream?</StreamingServicesHeader>
            <StreamingServiceSelectorDescription>Select everywhere you stream for a more personalized experience.</StreamingServiceSelectorDescription>
            <IconOptions />
        </StreamingServicesContainer>
    )
}

export default OnMyStreamingServices;