import React, { useContext, useEffect, useState, useRef, memo } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import ReelayStack from './ReelayStack';

import { AuthContext } from '../../context/AuthContext';

import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native-paper';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import BackButton from '../utils/BackButton';
const { height, width } = Dimensions.get('window');

const BackButtonContainer = styled(View)`
    background-color: transparent;
    position: absolute;
    top: 150px;
    z-index: 4;
`
const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`

const FixedReelayFeed = ({ navigation, 
    initialFeedPos = 0,
    initialStackPos = 0,
    fixedStackList = [],
    forceRefresh = false, 
}) => {

    const feedPager = useRef();

    const { reelayDBUser } = useContext(AuthContext);
    const [feedPosition, setFeedPosition] = useState(0);
    const [stackList, setStackList] = useState([]);

    useEffect(() => {
        const stackEmpty = !stackList.length;
        if (!stackEmpty && !forceRefresh) {
            console.log('feed already loaded');
            return;
        }

        console.log('gotta load the feed');
        setStackList(fixedStackList);
    }, [navigation]);

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const renderStack = ({ item, index }) => {
        const stack = item;
        const stackViewable = (index === feedPosition);

        console.log(`Rendering stack for ${stack[0].title.display ?? 'none'}`);
        console.log(`index: ${index} feed position: ${feedPosition}, viewable? ${stackViewable}`);

        return (
            <React.Fragment>
                <ReelayStack 
                    stack={stack} 
                    stackViewable={stackViewable}
                    feedIndex={index}
                    initialStackPos={initialStackPos}
                    isFixedStack={true}
                    navigation={navigation}
                />
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
            </React.Fragment>
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
                username: reelayDBUser?.username,
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
                    initialNumToRender={1}
                    initialScrollIndex={initialFeedPos}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={stack => String(stack[0].title.id)}
                    maxToRenderPerBatch={1}
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
        </ReelayFeedContainer>
    );
}

export default memo(FixedReelayFeed, (prevProps, nextProps) => {
    console.log('Fixed feed memo called');
    return true;
});