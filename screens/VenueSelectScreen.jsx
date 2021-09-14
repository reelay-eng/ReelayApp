import React, { useCallback, useContext } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Image } from 'react-native-elements';
import { UploadContext } from '../context/UploadContext';

import BackButton from '../components/utils/BackButton';
import { getVenues, VenueIcon } from '../components/utils/VenueIcon';
import styled from 'styled-components/native';

export default VenueSelectScreen = ({ navigation, route }) => {

    const { title } = route.params;
    const uploadContext = useContext(UploadContext);
    const venues = getVenues();
    
    const ScreenOuterContainer = styled(View)`
        height: 100%;
        width: 100%;
        color: black;
    `
    const ScreenInnerContainer = styled(SafeAreaView)`
        height: 100%;
        width: 100%;
        color: black;
    `
    const Options = () => {
        const IconContainer = styled(View)`
            margin: 12px;
        `
        const OptionsContainer = styled(View)`
            align-items: center;
            justify-content: center;
            flex: 1;
            flex-direction: row;
            flex-wrap: wrap;
            width: 100%;
        `
        const OptionScroll = styled(ScrollView)`
            flex: 1;
            flex-wrap: wrap;
            width: 100%;
        `
        const Padding = styled(View)`
            height: 10%;
        `
        const onPress = (venue) => {
            // prepare venue data for upload
            // advance to camera screen
            uploadContext.setVenueSelected(venue);
            navigation.push('ReelayCameraScreen', {
                venue: venue,
            });
        };

        return (
            <OptionScroll>
                <Padding />
                <OptionsContainer>
                    { venues.map(venue => {
                        return (
                            <IconContainer key={venue}>
                                <VenueIcon border={true} onPress={() => onPress(venue)} size={84} venue={venue}  />
                            </IconContainer>
                        ); 
                    })}
                </OptionsContainer>
            </OptionScroll>
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
            font-size: 22px;
            font-family: System;
            color: white;
        `
        const TopContainer = styled(View)`
            flex-direction: row;
            height: 60px;
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
        const CloseButtonText = styled(Text)`
            font-size: 16px;
            font-family: System;
            color: white;
        `
        const SkipContainer = styled(View)`
            align-items: center;
            justify-content: center;
            height: 40px;
            width: 100%;
        `
        const onPress = () => {
            // prepare empty venue data for upload
            // advance to camera screen
            navigation.push('ReelayCameraScreen', { venue: '', });
        }
        return (
            <SkipContainer>
                <Pressable onPress={onPress}>
                    <CloseButtonText>{'Skip'}</CloseButtonText>
                </Pressable>
            </SkipContainer>
        );
    }

    return (
        <ScreenOuterContainer>
            <ScreenInnerContainer>
                <Prompt />
                <Options />
                <SkipButton />
            </ScreenInnerContainer>
        </ScreenOuterContainer>
    );
}