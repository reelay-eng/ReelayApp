import React, { useContext, useState } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import Hero from './Hero';
import Poster from './Poster';

import LikesDrawer from './LikesDrawer';
import CommentsDrawer from './CommentsDrawer';

import styled from 'styled-components/native';
import { VenueIcon } from '../utils/VenueIcon';
import { ScrollView } from 'react-native-gesture-handler';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

const { height, width } = Dimensions.get('window');
const ICON_SIZE = 96;
const PLAY_PAUSE_ICON_TIMEOUT = 800;

const BackButtonContainer = styled(SafeAreaView)`
    align-self: flex-start;
    margin-left: 16px;
    position: absolute;
    top: 40px;
`
const IconContainer = styled(Pressable)`
    position: absolute;
    left: ${(width - ICON_SIZE) / 2}px;
    opacity: 50;
    top: ${(height - ICON_SIZE) / 2}px;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
    zIndex: 3;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const TopRightContainer = styled(View)`
    position: absolute;
    left: ${width - 110}px;
    zIndex: 3;
`
const UnderPosterContainer = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
`
const StackLocationOval = styled(View)`
    align-items: flex-end;
    align-self: flex-end;
    background-color: white;
    border-radius: 12px;
    justify-content: center;
    right: 10px;
    height: 22px;
    width: 60px;
    zIndex: 3;
`
const StackLocationText = styled(Text)`
    align-self: center;
    color: black;
    font-size: 16px;
    font-family: System;
`

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    const ICON_SIZE = 96;
    return (
        <IconContainer onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
    );
}

const StackLocation = ({ position, length }) => {
    const text = String(position + 1) + ' / ' + String(length);
    return (
        <StackLocationOval>
            <StackLocationText>{ text }</StackLocationText>
        </StackLocationOval>
    );
}

export default ReelayStack = ({ 
    stack,  
    stackViewable,
    isFixedStack,
    navigation,
}) => {
    const [stackPosition, setStackPosition] = useState(0);
    const { cognitoUser } = useContext(AuthContext);
    const { 
        overlayVisible, setOverlayVisible,
        paused, setPaused,
        playPauseVisible, setPlayPauseVisible,
        setOverlayData,  
    } = useContext(FeedContext);
    const viewableReelay = stack[stackPosition];

    const playPause = () => {
        if (paused) {
            setPaused(false);
            setPlayPauseVisible('pause');
            setTimeout(() => {
                setPlayPauseVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    
        } else {
            setPaused(true);
            setPlayPauseVisible('play');
            setTimeout(() => {
                if (playPauseVisible === 'play') {
                    setPlayPauseVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   
        }
    }

    const setReelayOverlay = (e) => {
        if (!overlayVisible) {
            setOverlayData({
                type: 'REELAY',
                reelay: viewableReelay,
            });
            setOverlayVisible(true);
            setPaused(true);
        }
    }

    const renderBackButton = () => {
        return (
            <BackButtonContainer>
            <Icon type='ionicon' size={30} color={'white'} name='chevron-back-outline' 
                onPress={() => navigation.pop()} />
            </BackButtonContainer>
        );
    }

    const renderReelay = ({ item, index }) => {
        const reelay = item;
        const reelayViewable = (index === stackPosition);        
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={stackViewable && reelayViewable}
                    index={index} 
                    playPause={playPause} 
                    setReelayOverlay={setReelayOverlay}
                    stackIndex={index} 
                    stackPosition={stackPosition}
                />
                { isFixedStack && renderBackButton() }
                { playPauseVisible !== 'none' && <PlayPauseIcon onPress={playPause} type={playPauseVisible} /> }
            </ReelayFeedContainer>
        );
    }

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (x % width === 0) {
            const nextStackPosition = x / width;
            const swipeDirection = nextStackPosition < stackPosition ? 'up' : 'down';
            const nextReelay = stack[nextStackPosition];
            const prevReelay = stack[stackPosition];
            const logProperties = {
                nextReelayID: nextReelay.id,
                nextReelayCreator: nextReelay.creator.username,
                nextReelayTitle: nextReelay.title.display,
                prevReelayID: prevReelay.id,
                prevReelayCreator: prevReelay.creator.username,
                prevReelayTitle: prevReelay.title.display,
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            Amplitude.logEventWithPropertiesAsync('swipedFeed', logProperties);
            setStackPosition(nextStackPosition);
        }
    }

    // For some reason, useSafeAreaInsets works, but SafeAreaView doesn't
    // https://docs.expo.dev/versions/latest/sdk/safe-area-context/ 
    const insets = useSafeAreaInsets();

    return (
        <ReelayFeedContainer>
            <FlatList data={stack} renderItem={renderReelay} onScroll={onStackSwiped} horizontal={true} pagingEnabled={true} />
            <TopRightContainer style={{ top: insets.top }}>
                <Poster title={viewableReelay.title} />
                <UnderPosterContainer>
                    { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                    { viewableReelay?.content?.venue && <VenueIcon venue={viewableReelay.content.venue} size={24} border={2} /> }
                </UnderPosterContainer>
            </TopRightContainer>
        </ReelayFeedContainer>
    );
}
