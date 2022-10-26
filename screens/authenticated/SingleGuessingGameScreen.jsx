import { useFocusEffect } from '@react-navigation/native';
import React, { Fragment } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import GuessingGameStack from '../../components/feed/GuessingGameStack';

export default SingleGuessingGameScreen = ({ navigation, route }) => {

    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const guessingGame = route?.params?.guessingGame ?? null;
    const isPreview = route?.params?.isPreview;
    const feedSource = (isPreview) ? 'guessingGamePreview' : 'guessingGame';
    const onRefresh = () => {};

    const dispatch = useDispatch();
    
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    })

    return (
        <Fragment>
            <GuessingGameStack
                initialStackPos={initialStackPos}
                guessingGame={guessingGame}
                isPreview={isPreview}
                navigation={navigation}
                onRefresh={onRefresh}
                stackViewable={true}
            />
            <ReelayFeedHeader 
                displayText={isPreview ? 'preview' : 'guessing game'}
                feedSource={feedSource}
                navigation={navigation}
            />
        </Fragment>
    );
}