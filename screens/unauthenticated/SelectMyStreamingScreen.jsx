import React, { memo, Fragment, useRef, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from '../../components/global/Headers';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStreamingVenues } from '../../components/utils/VenueIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 100px;
    width: 100%;
`
const ContinuePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 24px;
    height: 48px;
    justify-content: center;
    width: ${width - 16}px;
`
const ContinueText = styled(ReelayText.Overline)`
    color: black;
    font-size: 12px;
`
const ContinueWrapper = styled(View)`
    align-items: center;
    background-color: black;
    bottom: 0px;
    padding-top: 12px;
    padding-bottom: ${props => props.bottomOffset + 12}px;
    position: absolute;
    width: 100%;
`
const HeaderText = styled(ReelayText.H4Bold)`
    color: white;
    font-size: 28px;
    line-height: 40px;
    margin-bottom: 20px;
    padding-left: 20px;
    padding-right: 20px;
`
const IconOptionsGridContainer = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
`
const InstructionText = styled(ReelayText.Body2)`
    color: white;
    font-size: 16px;
    line-height: 26px;
    margin-bottom: 20px;
    padding-left: 20px;
    padding-right: 20px;
`
const PrimaryVenueImage = styled(Image)`
    height: 42px;
    width: 42px;
    border-radius: 21px;
    border-width: 1px;
    border-color: white;
`
const ProgressDot = styled(View)`
    background-color: ${props => props.completed ? ReelayColors.reelayBlue : 'gray'};
    border-radius: 4px;
    height: 8px;
    margin: 4px;
    width: 8px;
`
const ProgressDotsView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const ScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const Spacer = styled(View)`
    height: ${props => props.topOffset}px;
`
const TouchableVenue = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.selected ? ReelayColors.reelayBlue : "transparent"};
    border-radius: 11px;
    height: 93px;
    justify-content: center;
    margin: 4px;
    width: 80px;
`
const VenueGradient = styled(LinearGradient)`
    border-radius: 11px;
    flex: 1;
    height: 100%;
    opacity: 1;
    position: absolute;
    width: 100%;
`
const VenueText = styled(ReelayText.Body2)`
    color: white;
    font-size: 13px;
    line-height: 15px;
    padding-top: 6px;
`

const ProgressDots = () => {
    return (
        <ProgressDotsView>
            <ProgressDot completed={true} />
            <ProgressDot completed={true} />
            <ProgressDot completed={false} />
        </ProgressDotsView>
    );
}

export default SelectMyStreamingScreen = ({ navigation, route }) => {
    const { 
        appleUserID, 
        authSession, 
        email, 
        fullName, 
        googleUserID, 
        method, 
        password, 
        username,
    } = route?.params;

    const bottomOffset = useSafeAreaInsets().bottom;
    const topOffset = useSafeAreaInsets().top + 16;

    const expanded = true;
    const streamingVenues = getStreamingVenues(expanded);
    const selectedVenues = useRef([]);

    const continueSignUp = async () => {
        navigation.push('OnboardHouseRulesScreen', {
            appleUserID,
            authSession,
            email,
            fullName,
            googleUserID,
            method,
            password,
            selectedVenues: selectedVenues.current,
            username,
        });
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

    const VenueBadge = ({ displayName, venue }) => {
        const [selected, setSelected] = useState(false);
        const iconSource = venue.length ? streamingVenues.find((vi) => vi.venue === venue).source : null;
        if (!iconSource) return <Fragment />;
            
        const onPress = () => {
            onTapVenue(venue); 
            setSelected(!selected);
        };
    
        const GRADIENT_START_COLOR = "#272525"
        const GRADIENT_END_COLOR = "#19242E"
    
        return (
            <TouchableVenue onPress={onPress} selected={selected} activeOpacity={0.6}>
                { !selected && <VenueGradient colors={[GRADIENT_START_COLOR, GRADIENT_END_COLOR]} /> }
                <PrimaryVenueImage source={iconSource} />
                <VenueText numberOfLines={2}>{displayName}</VenueText>
            </TouchableVenue>
        );
    };
    

    const StreamingSelector = () => {
        const renderStreamingVenue = (venueObj) => {
            const { venue, display } = venueObj;
            return (
                <VenueBadge 
                    key={venue}
                    displayName={display}
                    onTapVenue={onTapVenue}
                    searchVenues={streamingVenues} 
                    venue={venue} 
                />
            );
        }

        return (
            <ScrollView contentContainerStyle={{ height: 840 }}>
                <HeaderText>{'Select the streaming services you use'}</HeaderText>
                <InstructionText>{'You can always change this later in settings'}</InstructionText>
                <IconOptionsGridContainer>
                    { streamingVenues.map(renderStreamingVenue) }
                </IconOptionsGridContainer>
                <Spacer topOffset={48} />
            </ScrollView>
        );
    };

    return (
        <ScreenView>
            <Spacer topOffset={topOffset} />
            <HeaderWithBackButton navigation={navigation} text={username} />
            <ProgressDots />
            <Spacer topOffset={20} />
            <StreamingSelector />
            
            <BottomGradient colors={["transparent", "#0d0d0d"]} start={{ x: 0, y: 0}} end={{ x: 0, y: 1 }} />
            <ContinueWrapper bottomOffset={bottomOffset}>
                <ContinuePressable onPress={continueSignUp}>
                    <ContinueText>{'Continue'}</ContinueText>
                </ContinuePressable>
            </ContinueWrapper>
            <View style={{ height: 24 }} />
        </ScreenView>
    );
}