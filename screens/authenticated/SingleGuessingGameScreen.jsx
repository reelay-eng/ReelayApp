import { useFocusEffect } from '@react-navigation/native';
import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GuessingGameStack from '../../components/feed/GuessingGameStack';

export default SingleGuessingGameScreen = ({ navigation, route }) => {
    // const guessingGames = useSelector(state => state.discover?.guessingGames?.current ?? []);
    const initialStackPos = route?.params?.initialStackPos ?? 0;
    const initialFeedPos = route?.params?.initialFeedPos ?? 0;
    const isPreview = route?.params?.isPreview;
    const isUnlocked = route?.params?.isUnlocked;
    const feedSource = (isPreview) ? 'guessingGamePreview' : 'guessingGame';
    const onRefresh = () => {};

    const dispatch = useDispatch();
    
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    return (
        <Fragment>
            <GuessingGameStack
                initialFeedPos={initialFeedPos}
                initialStackPos={initialStackPos}
                isPreview={isPreview}
                isUnlocked={isUnlocked}
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