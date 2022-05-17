import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { getSingleTopic } from '../../api/TopicsApi';

export default SingleTopicScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const initTopic = route?.params?.topic;
    const initReelayIndex = route?.params?.initReelayIndex;
    const showTabBarOnReturn = route?.params?.showTabBarOnReturn ?? true;

    const [topic, setTopic] = useState(initTopic);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            if (showTabBarOnReturn) {
                dispatch({ type: 'setTabBarVisible', payload: true });
            }
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        const refreshedTopic = await getSingleTopic(topic.id);
        setTopic(refreshedTopic);
        setRefreshing(false);
    }

    const refreshControl = (
        <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
        />
    );

    return (
        <ScrollView 
            refreshControl={refreshControl} 
            showsVerticalScrollIndicator={false}
        >
            <TopicStack 
                initialStackPos={initReelayIndex}
                navigation={navigation}
                topic={topic}
                stackViewable={true}
            />
        </ScrollView>
    );
}
