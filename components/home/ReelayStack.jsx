import React, { useContext, useState, memo } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import Hero from './Hero';
import Poster from './Poster';

import styled from 'styled-components/native';
import { VenueIcon } from '../utils/VenueIcon';
import * as ReelayText from '../../components/global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger';
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
    left: ${width - 90}px;
    zIndex: 3;
`
const UnderPosterContainer = styled(View)`
    flex-direction: row;
    justify-content: flex-end;
`
const StackLocationOval = styled(View)`
    align-items: flex-end;
    align-self: center;
    background-color: white;
    border-radius: 12px;
    justify-content: center;
    right: 6px;
    height: 22px;
    width: 50px;
    zIndex: 3;
`
const StackLocationText = styled(ReelayText.Body2)`
    align-self: center;
    color: black;
`

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    const ICON_SIZE = 48;
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

const ReelayStack = ({ 
    stack,  
    stackViewable,
    initialStackPos = 0,
    isFixedStack,
    navigation,
}) => {
    const [stackPosition, setStackPosition] = useState(0);
    const { cognitoUser } = useContext(AuthContext);
    const { 
        paused, setPaused,
        playPauseVisible, setPlayPauseVisible,
    } = useContext(FeedContext);
    const viewableReelay = stack[stackPosition];

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const playPause = () => {
        console.log("pause?")
        if (paused) {
            setPaused(false);
            setPlayPauseVisible('pause');
            setTimeout(() => {
                setPlayPauseVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT);    

            logAmplitudeEventProd('playVideo', {
                creatorName: viewableReelay.creator.username,
                reelayID: viewableReelay.id,
                reelayTitle: viewableReelay.title.display,
                username: cognitoUser.username,
            });
        } else {
            setPaused(true);
            setPlayPauseVisible('play');
            setTimeout(() => {
                if (playPauseVisible === 'play') {
                    setPlayPauseVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT);   

            logAmplitudeEventProd('pauseVideo', {
                creatorName: viewableReelay.creator.username,
                reelayID: viewableReelay.id,
                reelayTitle: viewableReelay.title.display,
                username: cognitoUser.username,
            });
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
        console.log('calling render reelay, index: ', index);
        // console.log('reelay: ', item);
        const reelay = item;
        const reelayViewable = stackViewable && (index === stackPosition);   
        if (reelayViewable) console.log('Reelay is viewable: ', index);
        
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayViewable}
                    index={index} 
                    isPaused={paused}
                    playPause={playPause} 
                    stackIndex={index} 
                    stackPosition={stackPosition}
                />
                { isFixedStack && renderBackButton() }
                { playPauseVisible !== 'none' && <PlayPauseIcon onPress={playPause} type={playPauseVisible} /> }
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (x % width === 0) {
            console.log('SWIPED FEED position: ', x / width);
            const nextStackPosition = x / width;
            const swipeDirection = nextStackPosition < stackPosition ? 'left' : 'right';
            const nextReelay = stack[nextStackPosition];
            const prevReelay = stack[stackPosition];
            const logProperties = {
                nextReelayID: nextReelay.id,
                nextReelayCreator: nextReelay.creator.username,
                nextReelayTitle: nextReelay.title.display,
                prevReelayID: prevReelay.id,
                prevReelayCreator: prevReelay.creator.username,
                prevReelayTitle: prevReelay.title.display,
                source: 'stack',
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setStackPosition(nextStackPosition);
        }
    }

    // For some reason, useSafeAreaInsets works, but SafeAreaView doesn't
    // https://docs.expo.dev/versions/latest/sdk/safe-area-context/ 
    const insets = useSafeAreaInsets();

    const openTitleDetail = async () => {
        console.log('VIEWABLE REELAY: ', viewableReelay.title);
        navigation.push('TitleDetailScreen', {
            titleObj: viewableReelay.title,
        });
        logAmplitudeEventProd('openTitleScreen', {
            reelayID: viewableReelay.id,
            reelayTitle: viewableReelay.title.display,
            username: cognitoUser.username,
            source: 'poster',
        });
    }

    return (
        <ReelayFeedContainer>
            <FlatList 
                data={stack} 
                horizontal={true} 
                initialNumToRender={1}
                initialScrollIndex={initialStackPos}
                getItemLayout={getItemLayout}
                maxToRenderPerBatch={2}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={2}
            />
            <TopRightContainer style={{ top: insets.top }}>
                <Pressable onPress={openTitleDetail}>
                    <Poster title={viewableReelay.title} />
                </Pressable>
                <UnderPosterContainer>
                    { stack.length > 1 && <StackLocation position={stackPosition} length={stack.length} /> }
                    { viewableReelay?.content?.venue && <VenueIcon venue={viewableReelay.content.venue} size={25} border={2} /> }
                </UnderPosterContainer>
            </TopRightContainer>
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    // console.log('are stacks equal? ', prevProps.stack[0].title.display, prevProps.stackViewable, nextProps.stackViewable);
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);