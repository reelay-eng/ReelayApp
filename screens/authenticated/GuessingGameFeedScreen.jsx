import React, { useState, useRef, useContext } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components/native';
import GuessingGameStack from '../../components/feed/GuessingGameStack';
import ReelayFeedHeader from '../../components/feed/ReelayFeedHeader';
import { useFocusEffect } from '@react-navigation/native';
import { getGuessingGamesPublished } from '../../api/GuessingGameApi';
import { AuthContext } from '../../context/AuthContext';
const { height, width } = Dimensions.get('window');

const ReelayFeedContainer = styled(View)`
    background-color: black;
    justify-content: flex-start;
    height: ${height}px;
    width: ${width}px;
`

export default GuessingGameFeedScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const initialFeedPos = route?.params?.feedPosition ?? 0;
    const initialStackPos = route?.params?.initialStackPos ?? 0;

    const isPreview = route?.params?.isPreview ?? false;
    const guessingGamesObj = useSelector(state => state.homeGuessingGames ?? []);
    const displayGames = guessingGamesObj?.content ?? [];
    const nextPage = guessingGamesObj?.nextPage ?? 1;

    const feedPager = useRef();
    const [endReached, setEndReached] = useState(false);
    const [feedPosition, setFeedPosition] = useState(initialFeedPos);

    const dispatch = useDispatch();
    
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const extendGuessingGames = async () => {
        if (endReached) return;
        console.log('extending: ');
        const nextGuessingGames = await getGuessingGamesPublished({
            authSession,
            reqUserSub: reelayDBUser?.sub,
            page: nextPage,
        });

        console.log('fetched additional games: ', nextGuessingGames?.length);

        if (!nextGuessingGames || nextGuessingGames?.length === 0) {
            setEndReached(true);
            return;
        }

        const allGuessingGames = [...displayGames, ...nextGuessingGames];
        dispatch({ type: 'setHomeGuessingGames', payload: {
            content: allGuessingGames,
            nextPage: nextPage + 1,
        }});
    }

    const getItemLayout = (stack, index) => {
        return {
            length: height,
            offset: index * height,
            index: index, 
        }
    }

    const renderGuessingGame = ({ item, index }) => {
        return (
            <GuessingGameStack
                feedPosition={index}
                initialStackPos={initialStackPos}
                isPreview={isPreview}
                navigation={navigation}
                stackViewable={index === feedPosition}
            />
        );
    }

    const onFeedSwiped = async (e) => {
        const { x, y } = e.nativeEvent.contentOffset;
        const nextFeedPosition = Math.round(y / height);
        if (nextFeedPosition === feedPosition) return;
        setFeedPosition(nextFeedPosition);
    }

    return (
        <ReelayFeedContainer>
            { displayGames.length < 1 && <ActivityIndicator /> }
            { displayGames.length >= 1 && 
                <FlatList
                    data={displayGames}
                    getItemLayout={getItemLayout}
                    horizontal={false}
                    initialNumToRender={2}
                    initialScrollIndex={initialFeedPos}
                    keyboardShouldPersistTaps={"handled"}
                    keyExtractor={game => String(game.id)}
                    maxToRenderPerBatch={2}
                    onEndReached={extendGuessingGames}
                    onEndReachedThreshold={0.9}
                    onScroll={onFeedSwiped}
                    pagingEnabled={true}
                    ref={feedPager}
                    renderItem={renderGuessingGame}
                    showsVerticalScrollIndicator={false}
                    style = {{
                        backgroundColor: 'transparent',
                        height: height,
                        width: width,
                    }} 
                    windowSize={3}
                />
            }
            <ReelayFeedHeader feedSource={'guessingGame'} navigation={navigation} />
        </ReelayFeedContainer>
    );
}