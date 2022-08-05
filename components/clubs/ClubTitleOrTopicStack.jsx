import React, { useContext, useState, useRef } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import TitleBanner from '../feed/TitleBanner';
import Hero from '../feed/Hero';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import ReelayFeedHeader from '../feed/ReelayFeedHeader';

const { height, width } = Dimensions.get('window');
const TITLE_BANNER_TOP_OFFSET = 56;

const AddReelayButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddReelayButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.offset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddReelayButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const TitleBannerContainer = styled(View)`
    top: ${(props) => props.offset}px;
    align-items: center;
    margin-top: 10px;
    position: absolute;
    width: 100%;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    height: ${height}px;
    width: ${width}px;
`
const AddReelayButton = ({ 
    activityType,
    clubID, 
    navigation, 
    offset, 
    titleObj, 
    topicObj,
}) => {
    const advanceToTitleSelect = () => navigation.push('SelectTitleScreen', {
        clubID,
        topic: topicObj,
    });
    const advanceToVenueSelect = () => navigation.push('VenueSelectScreen', { 
        clubID, 
        titleObj,
    });
    const advanceToCreateReelay = (activityType === 'topic') 
        ? advanceToTitleSelect 
        : advanceToVenueSelect;

    return (
        <AddReelayButtonOuterContainer offset={offset}>
        <AddReelayButtonContainer onPress={advanceToCreateReelay}>
            <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
            <AddReelayButtonText>{'Add a reelay'}</AddReelayButtonText>
        </AddReelayButtonContainer>
        </AddReelayButtonOuterContainer>
    );
}

export default ClubTitleOrTopicStack = ({ 
    club, 
    clubTitleOrTopic,
    initialStackPos = 0,
    navigation,
    stackViewable,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { activityType, reelays } = clubTitleOrTopic;
    const stack = reelays;
    const [stackPosition, setStackPosition] = useState(initialStackPos);
    const stackRef = useRef(null);
    const viewableReelay = stack[stackPosition];

    const donateLinks = useSelector(state => state.donateLinks);
    const donateObj = donateLinks?.find((donateLinkObj) => {
        const { tmdbTitleID, titleType } = donateLinkObj;
        const viewableTitleID = stack[0].title.id;
        const viewableTitleType = (stack[0].title.isSeries) ? 'tv' : 'film';
        return ((tmdbTitleID === viewableTitleID) && titleType === viewableTitleType);
    });

    const getItemLayout = (data, index) => ({
        length: width, 
        offset: width * index, index,
        index: index,
    });

    const onTappedOldest = () => {
        setStackPosition(0);
        stackRef?.current?.scrollToIndex({ animated: false, index: 0 });
    }

    const onTappedNewest = () => {
        const nextPosition = reelays?.length - 1;
        setStackPosition(nextPosition);
        stackRef?.current?.scrollToIndex({ animated: false, index: nextPosition });
    }

    const renderTitleBanner = (reelay, activityType) => {
        const posterWidth = (activityType === 'title') ? 60 : 48;
        return (
            <TitleBannerContainer offset={TITLE_BANNER_TOP_OFFSET}>
                <TitleBanner 
                    donateObj={donateObj}
                    navigation={navigation}
                    onTappedNewest={onTappedNewest}
                    onTappedOldest={onTappedOldest}    
                    posterWidth={posterWidth}
                    stack={stack}
                    titleObj={reelay?.title}
                    reelay={reelay}
                    club={club}
                    topic={(activityType === 'topic') ? clubTitleOrTopic : null}
                />
            </TitleBannerContainer>
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
                { activityType === 'topic' && renderTitleBanner(reelay, activityType) }
            </ReelayFeedContainer>
        );
    };

    const onStackSwiped = (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextStackPosition = Math.round(x / width);
        if (stackPosition === nextStackPosition) return;

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
            source: 'clubs',
            swipeDirection: swipeDirection,
            username: reelayDBUser?.username,
        }
        logAmplitudeEventProd('swipedFeed', logProperties);
        setStackPosition(nextStackPosition);
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
                ref={stackRef}
                renderItem={renderReelay} 
                onScroll={onStackSwiped} 
                pagingEnabled={true} 
                windowSize={3}
            />
            <ReelayFeedHeader 
                club={club} 
                feedSource='club'
                navigation={navigation} 
                onTappedOldest={onTappedOldest}
                onTappedNewest={onTappedNewest}
                position={stackPosition}
                stackLength={reelays?.length}
                topic={(activityType === 'topic') ? clubTitleOrTopic : null}
            />
            { activityType === 'title' && renderTitleBanner(viewableReelay, activityType) }
        </ReelayFeedContainer>
    );
}
