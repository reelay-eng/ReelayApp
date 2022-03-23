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
import DonateButton from '../global/DonateButton';

const { height, width } = Dimensions.get('window');

const BackButtonContainer = styled(SafeAreaView)`
    align-self: flex-start;
    margin-left: 16px;
    position: absolute;
    top: 40px;
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

const ReelayStack = ({ 
    stack,  
    stackViewable,
    initialStackPos = 0,
    isFixedStack,
    navigation,
}) => {
    const [stackPosition, setStackPosition] = useState(0);
    const { reelayDBUser } = useContext(AuthContext);
    const { donateLinks } = useContext(FeedContext);

    const viewableReelay = stack[stackPosition];
    const donateObj = donateLinks.find((donateLinkObj) => {
        const { tmdbTitleID, titleType } = donateLinkObj;
        const viewableTitleID = stack[0].title.id;
        const viewableTitleType = (stack[0].title.isSeries) ? 'tv' : 'film';
        return ((tmdbTitleID === viewableTitleID) && titleType === viewableTitleType);
    });
    
    // figure out how to do ellipses for displayTitle
    const displayTitle = (viewableReelay.title.display) ? viewableReelay.title.display : 'Title not found\ '; 
	const year = (viewableReelay.title.releaseYear) ? viewableReelay.title.releaseYear : '';

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

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
        return (
            <ReelayFeedContainer key={reelay.id}>
                <Hero 
                    index={index} 
                    navigation={navigation} 
                    reelay={reelay} 
                    viewable={reelayViewable}
                />
                { isFixedStack && renderBackButton() }
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
                    { !donateObj && <AddToWatchlistButton titleObj={viewableReelay.title} reelay={viewableReelay}/> }
                    { donateObj && <DonateButton donateObj={donateObj} reelay={viewableReelay} /> }
                </Pressable>
            </TitleDetailContainer>
        </ReelayFeedContainer>
    );
}

const areEqual = (prevProps, nextProps) => {
    return prevProps.stackViewable === nextProps.stackViewable;
}

export default memo(ReelayStack, areEqual);