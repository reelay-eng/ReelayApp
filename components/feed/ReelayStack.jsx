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

import * as ReelayText from '../global/Text';

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
const StackLengthText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    font-size: 12px;
`
const TitleContainer = styled(View)`
    width: 210px;
`
const TitleDetailContainer = styled(View)`
    align-self: center;
    background: rgba(0, 0, 0, 0.36);
    border-radius: 8px;
    height: 100px;
    width: ${width - 20}px;
    justify-content: space-between;
    position: absolute;
    top: 47px;
    zIndex: 3;
`
const TitleInfo = styled(View)`
    flex-direction: column;
    justify-content: center;
    padding: 5px;
    font-size: 18px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-bottom: 4px;
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
    const { reelayDBUser } = useContext(AuthContext);
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
                username: reelayDBUser?.username,
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
                username: reelayDBUser?.username,
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
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setStackPosition(nextStackPosition);
        }
    }

    // For some reason, useSafeAreaInsets works, but SafeAreaView doesn't
    // https://docs.expo.dev/versions/latest/sdk/safe-area-context/ 
    const insets = useSafeAreaInsets();

    const openTitleDetail = async () => {
        if (!viewableReelay?.title?.display) {
            return;
        }
        navigation.push('TitleDetailScreen', {
            titleObj: viewableReelay.title,
        });
        logAmplitudeEventProd('openTitleScreen', {
            reelayID: viewableReelay.id,
            reelayTitle: viewableReelay.title.display,
            username: reelayDBUser?.username,
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
                keyboardShouldPersistTaps={"handled"}
                maxToRenderPerBatch={2}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            <TitleDetailContainer style={{ top: insets.top }}>
                <Pressable onPress={openTitleDetail} style={{
                    flexDirection: "row",
                    justifyContent: 'space-between',
                }}>
                    <Poster title={viewableReelay.title} />
                    <TitleInfo>
                        <TitleContainer>
                            <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                                {displayTitle}
                            </TitleText>
                        </TitleContainer>
                        <View style={{ flexDirection: "column", marginTop: 5 }}>
                            { year.length > 0 && <YearText>{year}</YearText> }
                            <StackLengthText>
                                {(stack.length > 1) 
                                    ? `${stack.length} Reelays  << swipe >>` 
                                    : `${stack.length} Reelay`
                                }
                            </StackLengthText>
                        </View>
                    </TitleInfo>
                    <AddToWatchlistButton titleObj={viewableReelay.title} reelay={viewableReelay}/> 
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