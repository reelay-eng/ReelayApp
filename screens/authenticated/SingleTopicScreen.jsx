import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { useDispatch } from 'react-redux';

export default SingleTopicScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const topic = route?.params?.topic;
    const initReelayIndex = route?.params?.initReelayIndex;
    const showTabBarOnReturn = route?.params?.showTabBarOnReturn ?? true;

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            if (showTabBarOnReturn) {
                dispatch({ type: 'setTabBarVisible', payload: true });
            }
        }
    })

    return (
        <TopicStack 
            initialStackPos={initReelayIndex}
            navigation={navigation}
            topic={topic}
            stackViewable={true}
        />
    );
}
