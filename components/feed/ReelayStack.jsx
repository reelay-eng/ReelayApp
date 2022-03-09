import React, { useContext, useState, memo } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import Hero from './Hero';
import Poster from './Poster';
import AddToWatchlistButton from '../titlePage/AddToWatchlistButton';

import styled from 'styled-components/native';

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
const StackLengthText = styled(Text)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 12px;
    height: 16px;
    line-height: 16px;
    letter-spacing: 0.25px;
    position: absolute;
    right: 20px;
`
const TitleContainer = styled(View)`
    width: 210px;
`
const TitleDetailContainer = styled(View)`
    align-self: center;
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    display: flex;
    height: 100px;
    width: 345px;
    justify-content: center;
    position: absolute;
    top: 47px;
    zIndex: 3;
`
const TitleInfo = styled(View)`
    flex-direction: column;
    justify-content: center;
    padding-left: 3px;
`
const Title = styled(Text)`
    color: white;
    font-family: Outfit-Medium;
    font-size: 18px;
    line-height: 20px;
    letter-spacing: 0.18px;
`
const WatchListButton = styled(Pressable)`
    align-items: center;
    align-self: center;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 50px;
    height: 45px;
    justify-content: center;
    width: 45px;
`
const Year = styled(Text)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 12px;
    height: 16px;
    width: 35px;
    line-height: 16px;
    letter-spacing: 0.4px;
`

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    const ICON_SIZE = 48;
    return (
        <IconContainer onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={ICON_SIZE} />
        </IconContainer>
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
    
    // figure out how to do ellipses for displayTitle
    const displayTitle = (viewableReelay.title.display) ? viewableReelay.title.display : 'Title not found\ '; 
	const year = (viewableReelay.title.releaseYear) ? viewableReelay.title.releaseYear : '';

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const playPause = () => {
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
            const nextStackPosition = x / width;
            if (stackPosition === nextStackPosition) {
                return;
            }

            console.log('continued swipe!');
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
                windowSize={3}
            />
            <TitleDetailContainer style={{ top: insets.top }}>
                <Pressable onPress={openTitleDetail} style={{flexDirection: "row"}}>
                    <Poster title={viewableReelay.title} />
                    <TitleInfo>
                        <TitleContainer>
                            <Title>
                                {displayTitle}
                            </Title>
                        </TitleContainer>
                        <View style={{flexDirection: "row", marginTop: 5}}>
                            <Year>{year}</Year>
                            <StackLengthText>{(stack.length>1) ? `${stack.length} Reelays` : `${stack.length} Reelay`}</StackLengthText>
                        </View>
                    </TitleInfo>
                    <WatchListButton>
                        <AddToWatchlistButton titleObj={viewableReelay.title} reelay={viewableReelay}/>
                    </WatchListButton>
                </Pressable>
            </TitleDetailContainer>
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    // console.log('are stacks equal? ', prevProps.stack[0].title.display, prevProps.stackViewable, nextProps.stackViewable);
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);