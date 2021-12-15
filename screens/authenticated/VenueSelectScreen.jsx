import React from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View, Linking, Image } from 'react-native';
import { Camera } from 'expo-camera';
import BackButton from '../../components/utils/BackButton';
import { getIconVenues, getOtherVenues, iconVenues, otherVenues } from '../../components/utils/VenueIcon';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { Header } from "../../components/global/HeaderWithBackButton";

export default VenueSelectScreen = ({ navigation, route }) => {

    const ICON_SIZE = 64;
    const BORDER_SIZE = 4;

    const { titleObj } = route.params;
    const iconVenues = getIconVenues();
    const otherVenues = getOtherVenues();
    const searchVenues = [...iconVenues, ...otherVenues];
    
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
    const advancetoCameraScreen = async (venue) => {
        const { status } = await Camera.requestPermissionsAsync();
        const hasPermission = (status === "granted");

        if (hasPermission) {
            navigation.push('ReelayCameraScreen', {
                titleObj: titleObj,
                venue: venue,
            });    
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
				{iconVenues.map((venueObj) => {
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
            "To make a reelay, please enable camera permissions in your phone settings",
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
			border-width: 3px;
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

    return (
		<ScreenOuterContainer>
			<ScreenInnerContainer>
				<ScrollView>
					<Header navigation={navigation} text={`Where did you see it?`} />
					<FlexContainer>
						<IconOptions />
						<SkipButton />
					</FlexContainer>
				</ScrollView>
			</ScreenInnerContainer>
		</ScreenOuterContainer>
	);
}