import { useFocusEffect } from '@react-navigation/native';
import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GuessingGameStack from '../../components/feed/GuessingGameStack';

export default SingleGuessingGameScreen = ({ navigation, route }) => {
    // const guessingGames = useSelector(state => state.discover?.guessingGames?.current ?? []);
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const feedPosition = route?.params?.feedPosition ?? 0;
    const isPreview = route?.params?.isPreview ?? false;
    const feedSource = (isPreview) ? 'guessingGamePreview' : 'guessingGame';
    const previewGuessingGame = route?.params?.previewGuessingGame ?? null;

    const dispatch = useDispatch();
    
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    return (
        <Fragment>
            <GuessingGameStack
                feedPosition={feedPosition}
                initialStackPos={initialStackPos}
                isPreview={isPreview}
                navigation={navigation}
                previewGuessingGame={previewGuessingGame}
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