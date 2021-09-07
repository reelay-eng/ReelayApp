import React, { useContext } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Image } from 'react-native-elements';
import { UploadContext } from '../context/UploadContext';

import BackButton from '../components/utils/BackButton';
import styled from 'styled-components/native';

export default VenueSelectScreen = ({ navigation, route }) => {

    const ICON_PATH = '../assets/icons/venues/';
    const uploadContext = useContext(UploadContext);
    const { title } = route.params;
    
    const iconAmazon = require(ICON_PATH + 'amazon.png');
    const iconAppleTV = require(ICON_PATH + 'appletv.png');
    const iconCrackle = require(ICON_PATH + 'crackle.png');
    const iconCriterion = require(ICON_PATH + 'criterion.png');
    const iconDisney = require(ICON_PATH + 'disney.png');
    const iconFestivals = require(ICON_PATH + 'festivals.png');
    const iconHBO = require(ICON_PATH + 'hbomax.png');
    const iconHulu = require(ICON_PATH + 'hulu.png');
    const iconMubi = require(ICON_PATH + 'mubi.png');
    const iconNetfix = require(ICON_PATH + 'netflix.png');
    const iconOther = require(ICON_PATH + 'other.png');
    const iconParamount = require(ICON_PATH + 'paramount.png');
    const iconPeacock = require(ICON_PATH + 'peacock.png');
    const iconTheaters = require(ICON_PATH + 'cinemas.png');
    const iconYouTube = require(ICON_PATH + 'youtube.png');

    const icons = [
        { icon: iconAmazon, venue: 'amazon' },
        { icon: iconAppleTV, venue: 'appletv' },
        { icon: iconCrackle, venue: 'crackle' },
        { icon: iconCriterion, venue: 'criterion' },
        { icon: iconDisney, venue: 'disney' },
        { icon: iconFestivals, venue: 'festivals' },
        { icon: iconHBO, venue: 'hbomax' },
        { icon: iconHulu, venue: 'hulu' },
        { icon: iconMubi, venue: 'mubi' },
        { icon: iconNetfix, venue: 'netflix' },
        { icon: iconOther, venue: 'other' },
        { icon: iconParamount, venue: 'paramount' },
        { icon: iconPeacock, venue: 'peacock' },
        { icon: iconTheaters, venue: 'theaters' },
        { icon: iconYouTube, venue: 'youtube' },
    ];
    
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
        return (
                <OptionScroll>
                    <Padding />
                    <OptionsContainer>
                        { icons.map(({ icon, venue }) => {
                            return <VenueSelector key={venue} venue={venue} source={icon} />;
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
            navigation.push('ReelayCameraScreen');
        }
        return (
            <SkipContainer>
                <Pressable onPress={onPress}>
                    <CloseButtonText>{'Skip'}</CloseButtonText>
                </Pressable>
            </SkipContainer>
        );
    }

    const VenueSelector = ({ venue, source }) => {
        const IconPressable = styled(Pressable)`
            padding: 10px;
        `
        const onPress = () => {
            // prepare venue data for upload
            // advance to camera screen
            uploadContext.setVenueSelected(venue);
            navigation.push('ReelayCameraScreen');
        };

        return (
            <IconPressable onPress={onPress}>
                <Image source={source} 
                    style={{ height: 84, width: 84, borderRadius: 4 }} />
            </IconPressable>
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