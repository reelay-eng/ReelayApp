import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { FeedContext } from '../../context/FeedContext';
import ReelayStack from './ReelayStack';
import FeedOverlay from '../overlay/FeedOverlay';

import * as Amplitude from 'expo-analytics-amplitude';
import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';

import { deleteReelay } from '../../api/ReelayApi';

import { showErrorToast, showMessageToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';
const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`

export default UserReelayFeed = ({ navigation, 
    initialFeedPos = 0,
    initialStackPos = 0,
    fixedStackList = [],
    forceRefresh = false, 
}) => {

    const feedPager = useRef();

    const { cognitoUser } = useContext(AuthContext);
    const { overlayVisible } = useContext(FeedContext);

    const [feedPosition, setFeedPosition] = useState(0);
    const [stackList, setStackList] = useState([]);
    const [stackCounter, setStackCounter] = useState(0);


    const isFixedStack = fixedStackList.length != 0;

    useEffect(() => {
        const stackEmpty = !stackList.length;
        if (!stackEmpty && !forceRefresh) {
            console.log('feed already loaded');
            return;
        }

        console.log('gotta load the feed');
        if (isFixedStack) {
            setStackList(fixedStackList);
        } else {
            extendFeed();
        }
    }, [navigation]);

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const onDeleteReelay = async (reelay) => {
        // todo: this should probably be a try/catch
        const deleteSuccess = deleteReelay(reelay);
        if (!deleteSuccess) {
            showErrorToast('Could not find your Reelay in the database. Strange...');
            return;
        }

        const feedDeletePosition = stackList.findIndex(stack => stack[0].title.id === reelay.title.id);
        const stack = stackList[feedDeletePosition];

        if (stack.length === 1) {
            setStackList(stackList.filter(stack => stack[0].id !== reelay.id));
        } else {
            const nextStack = stack.filter(nextReelay => nextReelay.id !== reelay.id);
            stackList[feedDeletePosition] = nextStack;
            setStackCounter(stackCounter + 1);
        }
    };

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        console.log(`Rendering stack for ${stack[0].title.display}`);
        console.log(`index: ${index} feed position: ${feedPosition}, viewable? ${stackViewable}`);

        return (
            <ReelayStack 
                stack={stack} stackViewable={stackViewable}
                feedIndex={index}
                initialStackPos={initialStackPos}
                isFixedStack={isFixedStack}
                navigation={navigation}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;

        if (y % height === 0) {
            const nextFeedPosition = y / height;
            const swipeDirection = nextFeedPosition < feedPosition ? 'up' : 'down';
            
            const nextStack = stackList[nextFeedPosition];
            const prevStack = stackList[feedPosition];

            const logProperties = {
                nextReelayTitle: nextStack[0].title.display,
                prevReelayTitle: prevStack[0].title.display,
                source: 'fixedStack',
                swipeDirection: swipeDirection,
                username: cognitoUser.username,
            }
            logAmplitudeEventProd('swipedFeed', logProperties);
            setFeedPosition(nextFeedPosition);
        }
    }

    return (
        <ReelayFeedContainer>
            { stackList.length < 1 && <ActivityIndicator /> }
            { stackList.length >= 1 && 
                <FlatList
                    data={stackList}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={3}
                    initialScrollIndex={initialFeedPos}
                    keyExtractor={stack => String(stack[0].title.id)}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    ref={feedPager}
                    renderItem={renderStack}
                    showsVerticalScrollIndicator={false}
                    style = {{
                        backgroundColor: 'transparent',
                        height: height,
                        width: width,
                    }}
                    windowSize={3}
                />        
            }
            { overlayVisible && 
                <FeedOverlay navigation={navigation} onDeleteReelay={onDeleteReelay} />
            }
        </ReelayFeedContainer>
    );
}