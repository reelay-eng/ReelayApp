import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, View, Linking, Image, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { getStreamingVenues, getOtherVenues } from '../../components/utils/VenueIcon';

import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { HeaderWithBackButton } from "../../components/global/Headers";

import { AuthContext } from '../../context/AuthContext';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { animate } from '../../hooks/animations';
import { useFocusEffect } from '@react-navigation/native';

const FlexContainer = styled(View)`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`
const IconContainer = styled(View)`
    margin: 4px;
`
const IconGradient = styled(LinearGradient)`
    borderRadius: 11px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const IconOptionsContainer = styled(View)`
    align-items: center;
    justify-content: center;
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 16px;
    margin-bottom: 16px;
    width: 100%;
`
const OtherVenueImageContainer = styled(View)`
    height: 30px;
    width: 30px;
    margin: 5px;
`
const OtherVenueImage = styled(Image)`
    height: 100%;
    width: 100%;
    resizeMode: contain;
`
const DisplayText = styled(ReelayText.Body2Emphasized)`
    color: white;
    font-size: 13px;
    margin-top: 6px;
    text-align: center;
`
const PressableVenue = styled(TouchableOpacity)`
    width: 80px;
    height: 93px;
    border-radius: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
`
const PrimaryVenueImage = styled(Image)`
    height: 42px;
    width: 42px;
    border-radius: 21px;
    border-width: 1px;
    border-color: white;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SeeMorePressable = styled(TouchableOpacity)`
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
    width: 100%;
`
const SeeMoreText = styled(ReelayText.Body2)`
    color: white;
    padding-bottom: 6px;
`
const SkipContainer = styled(View)`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 100%;
`
const SkipButtonContainer = styled(View)`
    margin-top: 16px;
    height: 40px;
    width: 90%;
`
const Spacer = styled(View)`
    height: 12px;
`

export default VenueSelectScreen = ({ navigation, route }) => {
    const titleObj = route.params?.titleObj;
    const topicID = route.params?.topicID ?? null;
    const clubID = route.params?.clubID ?? null;

    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    const [expanded, setExpanded] = useState(false);
    const streamingVenues = getStreamingVenues(expanded);
    const otherVenues = getOtherVenues();
    const searchVenues = [...streamingVenues, ...otherVenues];
    
    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} showBackButton={true} />
    }
    

    const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return (status === "granted");
    }

    const getMicPermissions = async () => {
        const { status } = await Camera.requestMicrophonePermissionsAsync();
        return (status === "granted");
    }

    const advancetoCameraScreen = async (venue) => {
        const hasCameraPermissions = await getCameraPermissions();
        const hasMicPermissions = await getMicPermissions();

        if (hasCameraPermissions && hasMicPermissions) {
            navigation.push('ReelayCameraScreen', { titleObj, venue, topicID, clubID });    
            logAmplitudeEventProd('selectVenue', { venue });
        } else {
            alertCameraAccess();
        }
    }


    const IconOptions = () => {

        const OtherVenues = () => {
            return (
                <>
                    { otherVenues.map((venueObj) => {
                        const { venue, text } = venueObj;
                        return (
                            <IconContainer key={venue}>
                                <VenueBadgeMemo venue={venue} isStreamingVenue={false} display={text} />
                            </IconContainer>
                        );
                    })}
                </>
            )
        }

        const StreamingVenues = () => {
            return (
                <>
                    { streamingVenues.map((venueObj) => {
                        const { display, venue } = venueObj;
                        return (
                            <IconContainer key={venue}>
                                <VenueBadgeMemo venue={venue} isStreamingVenue={true} display={display} />
                            </IconContainer>
                        );
                    })}
                </>
            )
        }
        return (
			<IconOptionsContainer>
                <OtherVenues />
                <StreamingVenues />
			</IconOptionsContainer>
		);
    }

    const SkipButton = () => {
        return (
			<SkipContainer>
				<SkipButtonContainer>
					<BWButton onPress={() => advancetoCameraScreen("")} text="Skip" />
				</SkipButtonContainer>
			</SkipContainer>
		);
    }

    const SeeMore = () => {
        return (
            <SeeMorePressable onPress={() => {
                animate(200, "linear", "opacity");
                setExpanded(true)
            }}>
                <SeeMoreText>{'see more'}</SeeMoreText>
                <FontAwesomeIcon icon={faChevronDown} color='white' size={24} />
            </SeeMorePressable>
        )
    }

    const alertCameraAccess = async () => {
        Alert.alert(
            "Please allow camera access",
            "To make a reelay, please enable camera and microphone permissions in your phone settings",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              { text: "Update camera settings", onPress: () => Linking.openSettings() }
            ]
        );        
    }

    const VenueBadge = ({ venue, display, isStreamingVenue = true }) => {
        const matchVenue = (vi) => vi.venue === venue;
        const source = venue.length ? searchVenues.find(matchVenue)?.source : null;

        if (!source) return <View />;

        if (isStreamingVenue) {
            return (
                <PressableVenue onPress={() => advancetoCameraScreen(venue)}>
                    <IconGradient colors={["#272525", "#19242E"]} />
                    <PrimaryVenueImage source={source} />
                    <DisplayText>{display}</DisplayText>
                </PressableVenue>
            );
        } else {
            return (
                <PressableVenue onPress={() => advancetoCameraScreen(venue)}>
                    <IconGradient colors={["#272525", "#19242E"]} />
                    <OtherVenueImageContainer>
                        <OtherVenueImage source={source} />
                    </OtherVenueImageContainer>
                    <DisplayText>{display}</DisplayText>
                </PressableVenue>
            );
        }
    };

    const VenueBadgeMemo = React.memo(VenueBadge, (prevProps, nextProps) => {
        return prevProps.venue === nextProps.venue && prevProps.display === nextProps.display;
    });
    
    useEffect(() => {
        dispatch({ type: 'setUploadStage', payload: 'none' });
        dispatch({ type: 'setUploadRequest', payload: null });
        dispatch({ type: 'setUploadProgress', payload: 0.0 });
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    })

    return (
		<ScreenContainer>
            <Spacer />
            <HeaderWithBackButton navigation={navigation} text={`where did you see it?`} />
            <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                <FlexContainer>
                    <IconOptions />
                    { !expanded && <SeeMore /> }
                    <SkipButton />
                </FlexContainer>
            </ScrollView>
		</ScreenContainer>
	);
}