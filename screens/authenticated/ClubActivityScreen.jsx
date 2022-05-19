import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import moment from 'moment';

import ClubBanner from '../../components/clubs/ClubBanner';
import ClubTitleCard from '../../components/clubs/ClubTitleCard';
import NoTitlesYetPrompt from '../../components/clubs/NoTitlesYetPrompt';

import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getClubMembers, getClubTitles, getClubTopics } from '../../api/ClubsApi';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../../components/utils/toasts';
import InviteMyFollowsDrawer from '../../components/clubs/InviteMyFollowsDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import ReelayColors from '../../constants/ReelayColors';
import AddTitleOrTopicDrawer from '../../components/clubs/AddTitleOrTopicDrawer';
import UploadProgressBar from '../../components/global/UploadProgressBar';
import TopicCard from '../../components/topics/TopicCard';

const { height, width } = Dimensions.get('window');

const ActivityScreenContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(LinearGradient)`
    align-items: center;
    bottom: 0px;
    padding-top: 20px;
    padding-bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const DescriptionContainer = styled(View)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlack};
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
`
const DescriptionText = styled(ReelayText.Body2)`
    color: white;
`
const ScrollContainer = styled(ScrollView)`
    top: ${(props) => props.topOffset}px;
    height: ${(props) => height - props.topOffset}px;
    padding-bottom: ${(props) => props.bottomOffset}px;
    width: 100%;
`

export default ClubActivityScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { club, promptToInvite } = route.params;
    const authSession = useSelector(state => state.authSession);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);

    const dispatch = useDispatch();
    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom;

    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

    const sortClubActivity = (activity0, activity1) => {
        const lastActivity0 = moment(activity0?.lastUpdatedAt);
        const lastActivity1 = moment(activity1?.lastUpdatedAt);
        return lastActivity0.diff(lastActivity1, 'seconds') < 0;
    }
    const clubActivities = [
        ...club.titles, 
        ...club.topics
    ].sort(sortClubActivity);

    const titleOrTopicHasReelays = (titleOrTopic) => (titleOrTopic?.reelays?.length > 0);
    const feedTitlesAndTopics = clubActivities.filter(titleOrTopicHasReelays);

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        try { 
            setRefreshing(true);
            const [members, titles, topics] = await Promise.all([
                getClubMembers({
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTitles({ 
                    authSession,
                    clubID: club.id, 
                    reqUserSub: reelayDBUser?.sub,
                }),
                getClubTopics({
                    authSession,
                    clubID: club.id,
                    reqUserSub: reelayDBUser?.sub,
                }),
            ]);
            club.members = members;
            club.titles = titles;
            club.topics = topics;
            dispatch({ type: 'setUpdatedClub', payload: club });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    useEffect(() => {
        if (!club.members?.length || !club.titles?.length) {
            onRefresh();
        }
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const AddTitleButton = () => {
        const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);
        return (
            <AddTitleButtonOuterContainer 
                bottomOffset={bottomOffset} 
                colors={['transparent', 'black']}>
                <AddTitleButtonContainer onPress={() => setTitleOrTopicDrawerVisible(true)}>
                    <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
                    <AddTitleButtonText>{'Add title or topic'}</AddTitleButtonText>
                </AddTitleButtonContainer>
                { titleOrTopicDrawerVisible && (
                    <AddTitleOrTopicDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={titleOrTopicDrawerVisible}
                        setDrawerVisible={setTitleOrTopicDrawerVisible}
                    />
                )}
            </AddTitleButtonOuterContainer>
        );
    }

    const ClubActivityScroll = ({ children }) => {
        return (
            <ScrollContainer 
                contentContainerStyle={{ 
                    alignItems: 'center', 
                    paddingBottom: 210,
                }}
                topOffset={topOffset} 
                bottomOffset={bottomOffset}
                refreshControl={refreshControl} 
                showsVerticalScrollIndicator={false}
            >
                { children }
            </ScrollContainer>
        )
    }

    const ClubActivity = ({ activity }) => {
        const { activityType } = activity;
        const matchFeedTitleOrTopic = (nextTitleOrTopic) => (activity.id === nextTitleOrTopic.id);
        const initFeedIndex = feedTitlesAndTopics.findIndex(matchFeedTitleOrTopic);
        const advanceToFeed = () => navigation.push('ClubFeedScreen', { club, initFeedIndex });   

        if (activityType === 'title') {
            const clubTitle = activity;
            return (
                <ClubTitleCard 
                    key={clubTitle.id} 
                    advanceToFeed={advanceToFeed}
                    club={club}
                    clubTitle={clubTitle} 
                    navigation={navigation} 
                    onRefresh={onRefresh}
                />
            );    
        } else if (activityType === 'topic') {
            const clubTopic = activity;
            return (
                <TopicCard 
                    advanceToFeed={advanceToFeed}
                    clubID={club.id}
                    navigation={navigation} 
                    topic={clubTopic} 
                />
            );
        } else {
            return <View />;
        }
    }

    const DescriptionFold = () => {
        return (
            <DescriptionContainer>
                <DescriptionText>
                    { club.description }
                </DescriptionText>
            </DescriptionContainer>
        )
    }

    return (
        <ActivityScreenContainer>
            <ClubActivityScroll>
                <DescriptionFold />
                { showProgressBar && <UploadProgressBar mountLocation={'InClub'} clubID={club.id} /> }
                { (!refreshing && !club?.titles?.length) && <NoTitlesYetPrompt /> } 
                { (clubActivities?.length > 0 ) && clubActivities?.map((activity) => {
                    return <ClubActivity key={activity.id} activity={activity} /> 
                })}
            </ClubActivityScroll>
            <ClubBanner club={club} navigation={navigation} />
            <AddTitleButton />
            { inviteDrawerVisible && (
                <InviteMyFollowsDrawer 
                    club={club}
                    drawerVisible={inviteDrawerVisible}
                    setDrawerVisible={setInviteDrawerVisible}
                    onRefresh={onRefresh}
                />
            )}
        </ActivityScreenContainer>
    );
}