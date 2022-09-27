import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleTopic } from '../../api/TopicsApi';
import EmptyTopic from '../../components/feed/EmptyTopic';
import ReelayFeedHeader from '../../components/feed/ReelayFeedHeader';
import { AuthContext } from '../../context/AuthContext';

export default SingleTopicScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const uploadStage = useSelector(state => state.uploadStage);
    const authSession = useSelector(state => state.authSession);

    const initTopic = route?.params?.topic;
    const initReelayIndex = route?.params?.initReelayIndex;
    const showTabBarOnReturn = route?.params?.showTabBarOnReturn ?? true;

    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

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
        const refreshedTopic = await getSingleTopic({ 
            authSession,
            reqUserSub: reelayDBUser?.sub,
            topicID: topic.id, 
        });
        setTopic(refreshedTopic);
        setRefreshing(false);
    }

    const refreshControl = (
        <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
        />
    );

    if (topic.reelays?.length === 0) {
        return (
            <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                <EmptyTopic navigation={navigation} topic={topic} />
                <ReelayFeedHeader
                    feedSource='topics'
                    navigation={navigation}
                />
                { showProgressBar && <UploadProgressBar mountLocation={'InTopic'} onRefresh={onRefresh} /> }
            </ScrollView>
        )
    }

    return (
        <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
            <TopicStack 
                initialStackPos={initReelayIndex}
                navigation={navigation}
                topic={topic}
                stackViewable={true}
            />
            <ReelayFeedHeader
                feedSource='topics'
                navigation={navigation}
            />
            { showProgressBar && <UploadProgressBar mountLocation={'InTopic'} onRefresh={onRefresh} /> }
        </ScrollView>
    );
}
