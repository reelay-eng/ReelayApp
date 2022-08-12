import React, { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator,
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
import { inviteMemberToClub, getClubMembers, getClubTitles, getClubTopics, markClubActivitySeen, acceptInviteToClub, rejectInviteFromClub } from '../../api/ClubsApi';
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
import Constants from 'expo-constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const { height, width } = Dimensions.get('window');
const ACTIVITY_PAGE_SIZE = 20;
const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;


const AcceptRejectInviteRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: ${width - 32}px;
`
const AcceptInvitePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    display: flex;
    flex: 0.75;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-right: 16px;
`
const ActivityView = styled(View)`
    margin-bottom: 8px;
`
const ActivityScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const AddTitleButtonView = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const BottomButtonOuterView = styled(LinearGradient)`
    align-items: center;
    bottom: 0px;
    flex-direction: row;
    justify-content: space-around;
    padding-top: 20px;
    padding-bottom: ${(props) => props.bottomOffset + 56 ?? 56}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const DescriptionView = styled(View)`
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
const RejectInvitePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: gray;
    border-radius: 20px;
    display: flex;
    flex: 0.2;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-left: 16px;
`
const UploadProgressBarView = styled(View)`
    align-items: center;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`

const ClubActivity = ({ activity, club, feedIndex, navigation, onLayout, onRefresh }) => {
    const { activityType } = activity;
    const advanceToFeed = () => {
        if (feedIndex === -1) return;
        navigation.push('ClubFeedScreen', { club, initFeedIndex: feedIndex });   
    }

    if (activityType === 'title') {
        const clubTitle = activity;
        return (
            <ActivityView onLayout={onLayout}>
                <ClubTitleCard 
                    key={clubTitle.id} 
                    advanceToFeed={advanceToFeed}
                    club={club}
                    clubTitle={clubTitle} 
                    navigation={navigation} 
                    onRefresh={onRefresh}
                />
            </ActivityView>
        );    
    } else if (activityType === 'topic') {
        const clubTopic = activity;
        return (
            <ActivityView onLayout={onLayout}>
                <TopicCard 
                    advanceToFeed={advanceToFeed}
                    clubID={club.id}
                    navigation={navigation} 
                    source={'clubs'}
                    topic={clubTopic} 
                />
            </ActivityView>
        );
    } else if (activityType === 'member' && activityType?.role !== 'banned') {
        return <ClubAddedMemberCard member={activity} />
    } else {
        return <View />;
    }
}

const DescriptionFold = ({ onLayout }) => {
    return (
        <DescriptionView onLayout={onLayout}>
            <DescriptionText>
                { club.description }
            </DescriptionText>
        </DescriptionView>
    )
}


const ClubActivityList = ({ club, navigation, onRefresh, refreshing }) => {
    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom + 20;

    const activityListStyle = { 
        alignItems: 'center', 
        paddingTop: topOffset, 
        paddingBottom: bottomOffset + 100,
    };

    const itemHeights = useRef([]);
    const [maxDisplayPage, setMaxDisplayPage] = useState(0);
    const maxDisplayIndex = (maxDisplayPage + 1) * ACTIVITY_PAGE_SIZE;

    const filterJustThisClub = (nextActivity) => (nextActivity?.clubID === club.id);
    const filterDisplayActivities = (nextActivity, index) => index < maxDisplayIndex;

    const allMyClubActivities = useSelector(state => state.myClubActivities);
    const clubActivities = allMyClubActivities.filter(filterJustThisClub);
    const displayActivities = useRef(clubActivities.filter(filterDisplayActivities));

    const activityHasReelays = (titleOrTopic) => (titleOrTopic?.reelays?.length > 0);
    const feedTitlesAndTopics = clubActivities.filter(activityHasReelays);
    const refreshControl = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />;

    const onEndReached = () => {
        const nextMaxDisplayIndex = (maxDisplayPage + 2) * ACTIVITY_PAGE_SIZE;
        const filterNextDisplayActivities = (nextActivity, index) => index < nextMaxDisplayIndex;
        if (clubActivities?.length === displayActivities.current?.length) return; 
        displayActivities.current = clubActivities.filter(filterNextDisplayActivities);
        setMaxDisplayPage(maxDisplayPage + 1);
    }

    const keyExtractor = (item) => {
        if (item?.activityType === 'description') return 'description';
        if (item?.activityType === 'noTitlesYet') return 'noTitlesYet';
        return item?.id;
    }

    const renderClubActivity = ({ item, index }) => {
        const activity = item;
        const { activityType } = activity;
        
        const onLayout = ({ nativeEvent }) => {
            itemHeights.current[index] = nativeEvent?.layout?.height;
        }

        const matchFeedTitleOrTopic = (nextTitleOrTopic) => (activity.id === nextTitleOrTopic.id);
        const initFeedIndex = feedTitlesAndTopics.findIndex(matchFeedTitleOrTopic);    

        if (activityType === 'description') {
            return <DescriptionFold key={'description'} onLayout={onLayout} />;
        }
        if (activityType === 'noTitlesYet') {
            return <NoTitlesYetPrompt key={'noTitlesYet'} onLayout={onLayout} />
        }

        return (
            <ClubActivity key={activity.id} 
                activity={activity} 
                club={club}
                feedIndex={initFeedIndex} 
                navigation={navigation}
                onLayout={onLayout} 
                onRefresh={onRefresh}
            />
        );    
    };

    const getItemLayout = (item, index) => {
        const length = itemHeights.current[index] ?? 0;
        const accumulate = (sum, next) => sum + next;
        const offset = itemHeights.current.slice(0, index).reduce(accumulate, 0);
        return { length, offset, index };
    }

    return (
        <FlatList
            bottomOffset={bottomOffset}
            contentContainerStyle={activityListStyle}
            data={displayActivities.current}
            getItemLayout={getItemLayout}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.9}
            refreshControl={refreshControl} 
            renderItem={renderClubActivity}
            showsVerticalScrollIndicator={false}
            topOffset={topOffset} 
        />
    )
}

 
export default ClubActivityScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const { club, promptToInvite } = route.params;

    const [inviteDrawerVisible, setInviteDrawerVisible] = useState(promptToInvite);
    const [refreshing, setRefreshing] = useState(false);

    const matchClubMember = (nextMember) => nextMember?.userSub === reelayDBUser?.sub;
    const clubMember = club.members.find(matchClubMember);
    const clubMemberHasJoined = clubMember?.hasAcceptedInvite;
    const isPublicClub = (club.visibility === FEED_VISIBILITY);

    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom + 20;

    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);
    const notLoaded = (!club.members?.length && !club.titles?.length && !club.topics?.length);

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

            if (clubMember?.id) {
                clubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ 
                    authSession, 
                    clubMemberID: clubMember.id, 
                    reqUserSub: reelayDBUser?.sub,
                });
            }

            dispatch({ type: 'setUpdatedClub', payload: club });
            setRefreshing(false); 
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
            setRefreshing(false);
        }
    }

    useEffect(() => {
        if (notLoaded) {
            onRefresh();
        } else {
            if (clubMember?.id) {
                clubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ authSession, clubMemberID: clubMember.id, reqUserSub: reelayDBUser?.sub });
            }
        }

        logAmplitudeEventProd('openedClubActivityScreen', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            clubID: club?.id,
            club: club?.name,
        });
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const AcceptInviteButton = ({ setLoading }) => {
        const acceptInvite = async () => {
            setLoading(true);
            const acceptResult = await acceptInviteToClub({
                authSession,
                clubMemberID: clubMember?.id,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('accept invite result: ', acceptResult);
            await onRefresh();
            setLoading(false);
        }

        return (
            <AcceptInvitePressable onPress={acceptInvite}>
                <AddTitleButtonText>{'Accept invite'}</AddTitleButtonText>
            </AcceptInvitePressable>
        );
    }

    const RejectInviteButton = ({ setLoading }) => {
        const rejectInvite = async () => {
            setLoading(true);
            const rejectResult = await rejectInviteFromClub({
                authSession,
                clubMemberID: clubMember?.id,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('accept invite result: ', rejectResult);
            await onRefresh();
            if (!isPublicClub) navigation.popToTop();
            setLoading(false);
        }

        return (
            <RejectInvitePressable onPress={rejectInvite}>
                <AddTitleButtonText>{'Ignore'}</AddTitleButtonText>
                {/* <FontAwesomeIcon icon={faXmark} color='white' size={20} /> */}
            </RejectInvitePressable>
        );
    }

    const AcceptRejectInviteRow = () => {
        const [loading, setLoading] = useState(false);
        if (loading) {
            return (
                <AcceptRejectInviteRowView>
                    <ActivityIndicator />
                </AcceptRejectInviteRowView>
            );
        } else {
            return (
                <BottomButtonOuterView
                    bottomOffset={bottomOffset} 
                    colors={['transparent', 'black']}
                    end={{ x: 0.5, y: 0.5}}>
                    <RejectInviteButton setLoading={setLoading} />
                    <AcceptInviteButton setLoading={setLoading} />
                </BottomButtonOuterView>
            );    
        }
    }

    const AddTitleButton = () => {
        const [titleOrTopicDrawerVisible, setTitleOrTopicDrawerVisible] = useState(false);
        return (
            <BottomButtonOuterView 
                bottomOffset={bottomOffset} 
                colors={['transparent', 'black']}
                end={{ x: 0.5, y: 0.5}}>
                <AddTitleButtonView onPress={() => setTitleOrTopicDrawerVisible(true)}>
                    <Icon type='ionicon' name='add-circle-outline' size={16} color='white' />
                    <AddTitleButtonText>{'Add title or topic'}</AddTitleButtonText>
                </AddTitleButtonView>
                { titleOrTopicDrawerVisible && (
                    <AddTitleOrTopicDrawer
                        club={club}
                        navigation={navigation}
                        drawerVisible={titleOrTopicDrawerVisible}
                        setDrawerVisible={setTitleOrTopicDrawerVisible}
                    />
                )}
            </BottomButtonOuterView>
        );
    }

    const JoinClubButton = () => {
        const joinClub = async () => {
            // inviting yourself => auto-accept invite
            const joinClubResult = await inviteMemberToClub({
                authSession,
                clubID: club.id,
                userSub: reelayDBUser?.sub,
                username: reelayDBUser?.username,
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                role: 'member',
                clubLinkID: null,
            });

            console.log(joinClubResult);
            await onRefresh();
        }

        return (
            <BottomButtonOuterView 
                bottomOffset={bottomOffset} 
                colors={['transparent', 'black']}>
                <AddTitleButtonView onPress={joinClub}>
                    <AddTitleButtonText>{'Join club'}</AddTitleButtonText>
                </AddTitleButtonView>
            </BottomButtonOuterView>
        );
    }

    return (
        <ActivityScreenView>
            <ClubActivityList club={club} navigation={navigation} onRefresh={onRefresh} refreshing={refreshing} />
            <ClubBanner club={club} navigation={navigation} />

            { clubMember && clubMemberHasJoined && <AddTitleButton /> }
            { clubMember && !clubMemberHasJoined && <AcceptRejectInviteRow /> }
            { !clubMember && isPublicClub && <JoinClubButton /> }

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
        </ActivityScreenView>
    );
}