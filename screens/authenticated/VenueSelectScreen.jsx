import React, { useContext } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View, Linking } from 'react-native';
import { UploadContext } from '../../context/UploadContext';
import { Camera } from 'expo-camera';
import { Button, Icon } from 'react-native-elements';
import BackButton from '../../components/utils/BackButton';
import { getIconVenues, getOtherVenues, VenueIcon } from '../../components/utils/VenueIcon';
import styled from 'styled-components/native';

export default VenueSelectScreen = ({ navigation, route }) => {

    const ICON_SIZE = 64;
    const BORDER_SIZE = 4;

    const { title } = route.params;
    const {setVenueSelected} = useContext(UploadContext);
    const iconVenues = getIconVenues();
    const otherVenues = getOtherVenues();
    
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
            setVenueSelected(venue);
            navigation.push('ReelayCameraScreen');    
        } else {
            alertCameraAccess();
        }
    }

    const IconOptions = () => {
        const IconContainer = styled(View)`
            margin: 12px;
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
                    { iconVenues.map(venue => {
                        return (
                            <IconContainer key={venue}>
                                <VenueIcon border={BORDER_SIZE} size={ICON_SIZE} venue={venue}
                                    onPress={() => advancetoCameraScreen(venue)}  />
                            </IconContainer>
                        ); 
                    })}
                </IconOptionsContainer>
        );
    }

    const OtherOptions = () => {
        const IconContainer = styled(View)`
        `
        const OtherOptionsContainer = styled(View)`
            align-items: flex-start;
            margin-top: 10px;
            width: 100%;
        `
        const OtherOptionsLine = styled(Pressable)`
            align-self: center;
            align-items: center;
            border-radius: ${ICON_SIZE * .75}px;
            background-color: #f0f1f2;
            flex-direction: row;
            height: ${ICON_SIZE * 0.75}px;
            margin: 25px;
            width: 70%;
        `
        const OtherOptionText = styled(Text)`
            align-self: center;
            font-family: System;
            font-size: 20px;
            font-weight: 400;
            left: 10px;
            color: black;
        `
        const OtherOptionsTextButton = styled(Pressable)`
            align-items: center;
        `
        const onPress = (venue) => {
            advancetoCameraScreen(venue)
        };

        return (
            <OtherOptionsContainer>
                { otherVenues.map(venueObj=> {
                    const venue = venueObj.venue;
                    return (
                        <OtherOptionsLine key={venue} onPress={() => advancetoCameraScreen(venue)}>
                            <IconContainer>
                                <VenueIcon border={BORDER_SIZE} size={ICON_SIZE} venue={venue} 
                                    onPress={() => advancetoCameraScreen(venue)}/>
                            </IconContainer>
                            <OtherOptionsTextButton onPress={() => onPress(venue)}>
                                <OtherOptionText>{venueObj.text}</OtherOptionText>
                            </OtherOptionsTextButton>
                        </OtherOptionsLine>
                    ); 
                })}
            </OtherOptionsContainer>
        );
    }

    const Prompt = () => {
        const PromptContainer = styled(View)`
            align-self: flex-start;
            align-items: center;
            top: 10px;
            width: 80%;
        `
        const PromptText = styled(Text)`
            text-align: center;
            font-size: 22px;
            font-family: System;
            color: white;
        `
        const TopContainer = styled(View)`
            flex-direction: row;
            height: 80px;
            width: 100%;
        `
        const promptA = 'Where did you see ';
        const promptB = title + '?';

        return (
            <TopContainer>
                <BackButton navigation={navigation} />
                <PromptContainer>
                    <PromptText>{promptA}</PromptText>
                    <PromptText>{promptB}</PromptText>
                </PromptContainer>
            </TopContainer>
        );
    }

    const SkipButton = () => {
        const SkipContainer = styled(View)`
            align-items: center;
            justify-content: center;
            height: 40px;
            margin-bottom: 80px;
            top: 20px;
            width: 100%;
        `
        const SkipText = styled(Text)`
            font-size: 22px;
            font-family: System;
            color: white;
        `
        return (
            <SkipContainer>
                <Pressable onPress={() => advancetoCameraScreen('')}>
                    <SkipText>{'Skip'}</SkipText>
                </Pressable>
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

    return (
        <ScreenOuterContainer>
            <ScreenInnerContainer>
                <ScrollView>
                    <Prompt />
                    <IconOptions />
                    <OtherOptions />
                    <SkipButton />
                </ScrollView>
            </ScreenInnerContainer>
        </ScreenOuterContainer>
    );
}