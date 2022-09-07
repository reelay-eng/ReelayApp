import React, { useContext, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import { useDispatch } from "react-redux";
import ClubTitleOrTopicStack from './ClubTitleOrTopicStack';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import moment from 'moment';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import ReelayFeedHeader from '../feed/ReelayFeedHeader';
import EmptyTopic from '../feed/EmptyTopic';

const { height, width } = Dimensions.get('window');

const ClubFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`
export default ClubFeed = ({ 
    club,
    initFeedIndex, 
    initStackIndex,
    navigation, 
}) => {
    const { reelayDBUser } = useContext(AuthContext);
	const dispatch = useDispatch();
    const feedPager = useRef();
    const [feedPosition, setFeedPosition] = useState(initFeedIndex);
    const [refreshing, setRefreshing] = useState(false);
    
    const removeEmptyTitles = (titleOrTopic) => {
        return (titleOrTopic.activityType === 'topic' || titleOrTopic?.reelays?.length > 0);
    }

    const sortClubTitlesAndTopics = (titleOrTopic0, titleOrTopic1) => {
        const lastActivity0 = moment(titleOrTopic0?.lastUpdatedAt);
        const lastActivity1 = moment(titleOrTopic1?.lastUpdatedAt);
        return lastActivity0.diff(lastActivity1, 'seconds') < 0;
    }

    const tagEmptyTopics = (titleOrTopic) => {
        if (titleOrTopic.activityType === 'topic' && titleOrTopic?.reelays?.length === 0) {
            titleOrTopic.isEmptyTopic = true;
            titleOrTopic.creator = {
                sub: titleOrTopic.creatorSub,
                username: titleOrTopic.creatorName,
            }    
        } else {
            titleOrTopic.isEmptyTopic = false;
        }
        return titleOrTopic;
    }

    const feedTitlesAndTopics = [...club.titles, ...club.topics]
        .sort(sortClubTitlesAndTopics)
        .filter(removeEmptyTitles)
        .map(tagEmptyTopics);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const extendFeed = () => {
        // todo
    }

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const refreshFeed = () => {
        // todo
    }

    const renderStack = ({ item, index }) => {
        const clubTitleOrTopic = item;
        const stackViewable = (index === feedPosition);
        const initialStackPos = (index === initFeedIndex) ? initStackIndex : 0;

        if (clubTitleOrTopic.isEmptyTopic) {
            return <EmptyTopic navigation={navigation} topic={clubTitleOrTopic} />;
        }

        return <ClubTitleOrTopicStack 
            key={clubTitleOrTopic.id}
            club={club}
            clubTitleOrTopic={clubTitleOrTopic}
            initialStackPos={initialStackPos}
            navigation={navigation}
            stackViewable={stackViewable}
        />
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextTitleOrTopic = feedTitlesAndTopics[nextFeedPosition];
            const prevTitleOrTopic = feedTitlesAndTopics[feedPosition];

            const logProperties = {
                nextReelayTitle: nextTitleOrTopic?.reelays?.[0]?.title?.display,
                prevReelayTitle: prevTitleOrTopic?.reelays?.[0]?.title?.display,
                source: 'clubs',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setFeedPosition(nextFeedPosition);
        }
    }

    return (
        <ClubFeedContainer>
            { feedTitlesAndTopics.length < 1 && <ActivityIndicator />}
            { feedTitlesAndTopics.length >= 1 && (
                <FlatList
                    data={feedTitlesAndTopics}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={2}
                    initialScrollIndex={initFeedIndex}
                    keyboardShouldPersistTaps={"handled"}
                    maxToRenderPerBatch={2}
                    onEndReached={extendFeed}
                    onRefresh={refreshFeed}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    refreshing={refreshing}
                    ref={feedPager}
                    renderItem={renderStack}
                    showsVerticalScrollIndicator={false}
                    style={{
                        backgroundColor: "transparent",
                        height: height,
                        width: width,
                    }}
                    windowSize={3}
                />
            )}
            <ReelayFeedHeader
                displayText={club.name}
                feedSource='club'
                navigation={navigation}
            />
        </ClubFeedContainer>
    );
}
