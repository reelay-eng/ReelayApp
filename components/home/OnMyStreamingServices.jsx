import React, { memo, useCallback, useContext, useEffect, useState, useRef } from 'react';
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
    color: white;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
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
            let nextStreamingStacks = await getFeed({ 
                reqUserSub: reelayDBUser?.sub, 
                feedSource: "streaming", page: 0 
            });
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
const IconOptionsContainer = styled.View`
    align-items: center;
    justify-content: center;
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
    const { reelayDBUser } = useContext(AuthContext);
    const selectedVenues = useRef([]);
    const [saveDisabled, setSaveDisabled] = useState(true);

    const onSave = () => {
        selectedVenues.current.forEach(venue => {
            postStreamingSubscriptionToDB(reelayDBUser?.sub, { platform: venue });
        })
        AsyncStorage.setItem('hasPickedStreamingServicesBefore', "1");
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
    const source = venue.length ? searchVenues.find((vi) => vi.venue === venue).source : null;
    const PressableVenue = styled(Pressable)`
        width: 80px;
        height: 93px;
        border-radius: 11px;
        justify-content: center;
        align-items: center;
        background-color: ${ReelayColors.reelayBlue};
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
        <View style={{ margin: 4 }}>
            {source && (
                <PressableVenue onPress={onPress}>
                    { (!isPressed) && <VenueGradient /> }
                    { subtext.length > 0 && (
                        <React.Fragment>
                            <OtherVenueImage source={source} />
                            <OtherVenueSubtext>{subtext}</OtherVenueSubtext>
                        </React.Fragment>
                    )}
                    { !(subtext.length > 0) && <PrimaryVenueImage source={source} /> }
                </PressableVenue>
            )}
        </View>
    );
};

const StreamingServiceSelector = () => {

    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>Where do you stream?</StreamingServicesHeader>
            <IconOptions />
        </StreamingServicesContainer>
    )
}

export default OnMyStreamingServices;