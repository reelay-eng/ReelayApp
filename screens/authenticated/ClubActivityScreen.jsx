import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    Dimensions, 
    FlatList, 
    RefreshControl, 
    TouchableOpacity, 
    View 
} from 'react-native';
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
import ClubAddedMemberCard from './ClubAddedMemberCard';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

const { height, width } = Dimensions.get('window');
const MAX_ACTIVITY_INDEX = 30;

const ActivityContainer = styled(View)`
    margin-bottom: 8px;
`
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
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 4px;
    border-color: white;
    border-width: 1px;
    z-index: 5;
`
const DescriptionText = styled(ReelayText.Body2)`
    color: white;
`
const UploadProgressBarView = styled(View)`
    align-items: center;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`
 
export default ClubActivityScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const { club, promptToInvite } = route.params;
    const authSession = useSelector(state => state.authSession);
    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);
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
            console.log('updated club: ', club);
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom;

    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);
    const notLoaded = (!club.members?.length && !club.titles?.length && !club.topics?.length);

    const filterOldActivities = (activity, index) => index < MAX_ACTIVITY_INDEX;

    const sortClubActivity = (activity0, activity1) => {
        const activityType0 = activity0?.activityType;
        const activityType1 = activity1?.activityType;

        if (activityType0 === 'description') return -1;
        if (activityType1 === 'description') return 1;

        const lastActivity0 = moment(activity0?.lastUpdatedAt ?? activity0?.createdAt);
        const lastActivity1 = moment(activity1?.lastUpdatedAt ?? activity0?.createdAt);
        return lastActivity0.diff(lastActivity1, 'seconds') < 0;
    }

    const tagActivityType = (activity, type) => {
        activity.activityType = type;
        return activity;
    }

    useEffect(() => {
        if (notLoaded) onRefresh();
        logAmplitudeEventProd('openedClubActivityScreen', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            clubID: club?.id,
            club: club?.name,
        });
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const descActivity = club.description ? [{ activityType: 'description' }] : [];
    const clubActivities = (club.members?.length > 0) 
        ? [
            ...descActivity,
            ...club.members?.map(member => tagActivityType(member, 'member')),
            ...club.titles?.map(title => tagActivityType(title, 'title')), 
            ...club.topics?.map(topic => tagActivityType(topic, 'topic')),
        ].sort(sortClubActivity).filter(filterOldActivities)
        : [];

    const activityHasReelays = (titleOrTopic) => (titleOrTopic?.reelays?.length > 0);
    const feedTitlesAndTopics = clubActivities.filter(activityHasReelays);
    const iAmMember = !!club.members?.find(nextMember => nextMember.userSub === reelayDBUser?.sub);

    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;
    const noTitlesYet = (!refreshing && !club?.titles?.length && !club?.topics?.length);

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

    const ClubActivityList = () => {
        const renderClubActivity = ({ item, index }) => {
            const activity = item;
            const { activityType } = activity;
            if (activityType === 'description') {
                return <DescriptionFold key={'description'} />;
            }
            return <ClubActivity key={activity.id} activity={activity} />
        }

        const activityListStyle = { 
            alignItems: 'center', 
            paddingTop: topOffset, 
            paddingBottom: bottomOffset + 60,
        };

        const keyExtractor = (item) => {
            return item.activityType === 'description' ? 'description' : item?.id;
        }
        
        return (
            <FlatList
                bottomOffset={bottomOffset}
                contentContainerStyle={activityListStyle}
                data={clubActivities}
                keyExtractor={keyExtractor}
                refreshControl={refreshControl} 
                renderItem={renderClubActivity}
                showsVerticalScrollIndicator={false}
                topOffset={topOffset} 
            />
        )
    }

    const ClubActivity = ({ activity }) => {
        const { activityType } = activity;
        const matchFeedTitleOrTopic = (nextTitleOrTopic) => (activity.id === nextTitleOrTopic.id);
        const initFeedIndex = feedTitlesAndTopics.findIndex(matchFeedTitleOrTopic);
        const advanceToFeed = () => {
            if (initFeedIndex === -1) return;
            navigation.push('ClubFeedScreen', { club, initFeedIndex });   
        }

        if (activityType === 'title') {
            const clubTitle = activity;
            return (
                <ActivityContainer>
                    <ClubTitleCard 
                        key={clubTitle.id} 
                        advanceToFeed={advanceToFeed}
                        club={club}
                        clubTitle={clubTitle} 
                        navigation={navigation} 
                        onRefresh={onRefresh}
                    />
                </ActivityContainer>
            );    
        } else if (activityType === 'topic') {
            const clubTopic = activity;
            return (
                <ActivityContainer>
                    <TopicCard 
                        advanceToFeed={advanceToFeed}
                        clubID={club.id}
                        navigation={navigation} 
                        topic={clubTopic} 
                    />
                </ActivityContainer>
            );
        } else if (activityType === 'member' && activityType?.role !== 'banned') {
            return <ClubAddedMemberCard member={activity} />
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

    const JoinClubButton = () => {
        const onPress = () => {}
        return (
            <AddTitleButtonOuterContainer 
                bottomOffset={bottomOffset} 
                colors={['transparent', 'black']}>
                <AddTitleButtonContainer onPress={onPress}>
                    <AddTitleButtonText>{'Join club'}</AddTitleButtonText>
                </AddTitleButtonContainer>
            </AddTitleButtonOuterContainer>
        );
    }



    return (
        <ActivityScreenContainer>
            { noTitlesYet && <NoTitlesYetPrompt /> } 
            { !noTitlesYet && <ClubActivityList /> }
            <ClubBanner club={club} navigation={navigation} />
            { iAmMember && <AddTitleButton /> }
            { !iAmMember && <JoinClubButton /> }
            { showProgressBar && (
                <UploadProgressBarView topOffset={topOffset}>
                    <UploadProgressBar clubID={club.id} mountLocation={'InClub'} onRefresh={onRefresh} />
                </UploadProgressBarView>
            )}
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