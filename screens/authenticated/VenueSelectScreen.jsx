import React, { useContext, useEffect } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, View, Linking, Image } from 'react-native';
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

import { useDispatch } from 'react-redux';

export default VenueSelectScreen = ({ navigation, route }) => {
    const titleObj = route.params?.titleObj;
    const topicID = route.params?.topicID;

    const streamingVenues = getStreamingVenues();
    const otherVenues = getOtherVenues();
    const searchVenues = [...streamingVenues, ...otherVenues];

    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} showBackButton={true} />
    }
    
    const ScreenOuterContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    const ScreenInnerContainer = styled(SafeAreaView)`
        height: 100%;
        width: 100%;
        background-color: black;
    `

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
            navigation.push('ReelayCameraScreen', { titleObj, topicID, venue });    
            logAmplitudeEventProd('selectVenue', { venue });
        } else {
            alertCameraAccess();
        }
    }

    const IconOptions = () => {
        const IconContainer = styled(View)`
            margin: 4px;
        `
        const IconOptionsContainer = styled(View)`
            align-items: center;
            justify-content: center;
            flex: 1;
            flex-direction: row;
            flex-wrap: wrap;
            margin-top: 20px;
            width: 100%;
        `
        return (
			<IconOptionsContainer>
				{streamingVenues.map((venueObj) => {
					const venue = venueObj.venue;
					return (
						<IconContainer key={venue}>
							<VenueBadge venue={venue} />
						</IconContainer>
					);
				})}
				{otherVenues.map((venueObj) => {
					const venue = venueObj.venue;
					return (
                        <IconContainer key={venue}>
                            <VenueBadge venue={venue} subtext={venueObj.text} />
						</IconContainer>
					);
				})}
			</IconOptionsContainer>
		);
    }

    const SkipButton = () => {
        const SkipContainer = styled(View)`
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            width: 100%;
        `
        const SkipButtonContainer = styled(View)`
            width: 90%;
        `
        return (
			<SkipContainer>
				<SkipButtonContainer>
					<BWButton onPress={() => advancetoCameraScreen("")} text="Skip" />
				</SkipButtonContainer>
			</SkipContainer>
		);
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

    const VenueBadge = ({venue, subtext=""}) => {
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

		const PrimaryVenueImage = styled(Image)`
			height: 42px;
			width: 42px;
			border-radius: 21px;
			border-width: 1px;
            border-color: white;
		`;
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
        const OtherVenueSubtext = styled(ReelayText.CaptionEmphasized)`
            color: white;
            padding: 5px;
            text-align: center;
        `
		return (
			<>
                {source && (
					<PressableVenue onPress={() => advancetoCameraScreen(venue)}>
						{({ pressed }) => (
							<>
								{!pressed && (
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
    
    const FlexContainer = styled(View)`
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        justify-content: space-between;
        align-items: center;
    `

    useEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    }, []);

    return (
		<ScreenOuterContainer>
			<ScreenInnerContainer>
				<ScrollView>
					<HeaderWithBackButton navigation={navigation} text={`Where did you see it?`} />
					<FlexContainer>
						<IconOptions />
						<SkipButton />
					</FlexContainer>
				</ScrollView>
			</ScreenInnerContainer>
		</ScreenOuterContainer>
	);
}