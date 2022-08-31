import React, { useContext, useState, useRef } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import TitleBanner from '../feed/TitleBanner';
import Hero from '../feed/Hero';

import { useSelector } from 'react-redux';
import TopicBanner from '../topics/TopicBanner';

const { height, width } = Dimensions.get('window');
const TITLE_BANNER_TOP_OFFSET = 68;

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

    const renderTitleBanner = (reelay) => {
        return (
            <TitleBannerContainer offset={TITLE_BANNER_TOP_OFFSET}>
                <TitleBanner 
                    club={club}
                    donateObj={donateObj}
                    navigation={navigation}
                    reelay={reelay}
                    titleObj={reelay?.title}
                    topic={null}
                />
            </TitleBannerContainer>
        );
    }

    const renderTopicBanner = (reelay) => {
        return (
            <TitleBannerContainer offset={TITLE_BANNER_TOP_OFFSET}>
                <TopicBanner
                    club={club}
                    navigation={navigation}
                    reelay={reelay}
                    titleObj={reelay?.title}
                    topic={clubTitleOrTopic}
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
            nextReelayCreator: nextReelay.creator.username,
            nextReelayTitle: nextReelay.title.display,
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
                initialNumToRender={2}
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
            { activityType === 'title' && renderTitleBanner(viewableReelay) }
            { activityType === 'topic' && renderTopicBanner(viewableReelay) }
        </ReelayFeedContainer>
    );
}
