import React, { useContext, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { useDispatch } from "react-redux";
import ClubTitleStack from './ClubTitleStack';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { showMessageToast } from '../utils/toasts';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

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

    // todo: this duplicates code from the title card
    const clubTitlesWithReelays = club.titles.filter(clubTitle => clubTitle?.reelays?.length > 0);
    const clubStacks = clubTitlesWithReelays.map(clubTitle => clubTitle.reelays);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
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
        const stack = clubStacks[index];
        const stackViewable = (index === feedPosition);
        const initialStackPos = (index === initFeedIndex) ? initStackIndex : 0;
        return (
            <ClubTitleStack
                initialStackPos={initialStackPos}
                navigation={navigation}
                stackViewable={stackViewable}
                club={club}
                stack={stack}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = clubStacks[nextFeedPosition];
            const prevStack = clubStacks[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
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
            { clubStacks.length < 1 && <ActivityIndicator />}
            { clubStacks.length >= 1 && (
                <FlatList
                    data={clubStacks}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={1}
                    initialScrollIndex={feedPosition}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={(stack) => `${stack[0].title.id}-${stack[0].sub}`}
                    maxToRenderPerBatch={1}
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
        </ClubFeedContainer>
    );
}
