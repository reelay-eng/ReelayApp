import React, { Fragment, useContext, useEffect, useRef, useState, memo } from 'react';
import { 
    ActivityIndicator,
    Dimensions, 
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
import { FlashList } from '@shopify/flash-list';

import { io } from 'socket.io-client';

const { height, width } = Dimensions.get('window');
const ACTIVITY_PAGE_SIZE = 20;
const CHAT_BASE_URL = Constants.manifest.extra.reelayChatBaseUrl;
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
    flex: 0.45;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-right: 16px;
`
const ActivityBottomSpacer = styled(View)`
    height: ${props => props.bottomOffset + 100}px;
`
const ActivityTopSpacer = styled(View)`
    height: ${props => props.topOffset}px;
`
const ActivityView = styled(View)`
    margin-left: ${props => props.activityType === 'topic' ? 16 : 0}px;
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
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`
const BottomButtonOuterView = styled(LinearGradient)`
    align-items: center;
    bottom: 0px;
    flex-direction: row;
    justify-content: space-around;
    padding-top: 20px;
    padding-bottom: ${(props) => props.bottomOffset + 44}px;
    position: absolute;
    width: 100%;
`
const InviteFoldOuterView = styled(View)`
    align-items: center;
    background-color: black;
    justify-content: space-around;
    position: absolute;
    padding: 16px;
    top: ${props => props.topOffset}px;
    width: 100%;
`
const InviteFoldButtonRow = styled(View)`
    flex-direction: row;
    justify-content: space-around;
    margin-top: 12px;
    width: 100%;
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
const InviteText = styled(ReelayText.Overline)`
    color: white;
`
const RejectInvitePressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: gray;
    border-radius: 20px;
    display: flex;
    flex: 0.45;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin-left: 16px;
`

const ClubActivity = ({ activity, club, feedIndex, navigation, onRefresh }) => {
    const { activityType } = activity;
    const advanceToFeed = (initReelayIndex = 0) => {
        if (feedIndex === -1) return;
        navigation.push('ClubFeedScreen', { club, initReelayIndex, initFeedIndex: feedIndex });   
    }

    if (activityType === 'title') {
        const clubTitle = activity;
        return (
            <ActivityView activityType={activityType}>
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
            <ActivityView activityType={activityType}>
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

const DescriptionFold = () => {
    return (
        <DescriptionView>
            <DescriptionText>
                { club.description }
            </DescriptionText>
        </DescriptionView>
    )
}

const InviteFold = ({ clubMember, navigation, isPublicClub, onRefresh }) => {
    const authSession = useSelector(state => state.authSession);
    const [loading, setLoading] = useState(false);
    const { reelayDBUser } = useContext(AuthContext);
    const topOffset = useSafeAreaInsets().top + 60;

    const AcceptInviteButton = () => {
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
                <InviteText>{'Accept'}</InviteText>
            </AcceptInvitePressable>
        );
    }

    const AcceptRejectInviteRow = () => {
        return (
            <InviteFoldOuterView topOffset={topOffset} >
                <Invitation />
                <InviteFoldButtonRow>
                    <RejectInviteButton />
                    <AcceptInviteButton />
                </InviteFoldButtonRow>
            </InviteFoldOuterView>
        );    
    }

    const Invitation = () => {
        const inviteText = `${clubMember?.invitedByUsername} invited you to join`;
        return (
            <Fragment>
                <InviteText>{inviteText}</InviteText>
            </Fragment>
        )
    }

    const RejectInviteButton = () => {
        const rejectInvite = async () => {
            setLoading(true);
            const rejectResult = await rejectInviteFromClub({
                authSession,
                clubMemberID: clubMember?.id,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log('reject invite result: ', rejectResult);
            await onRefresh();
            if (!isPublicClub) navigation.popToTop();
            setLoading(false);
        }

        return (
            <RejectInvitePressable onPress={rejectInvite}>
                <InviteText>{'Ignore'}</InviteText>
            </RejectInvitePressable>
        );
    }

    const LoadingIndicator = () => {
        return (
            <AcceptRejectInviteRowView>
                <ActivityIndicator />
            </AcceptRejectInviteRowView>
        );
    }

    if (loading) {
        return <LoadingIndicator />
    } else {
        return <AcceptRejectInviteRow />;    
    }

}

const ClubActivityList = ({ club, navigation, onRefresh, refreshing }) => {
    const itemHeights = useRef([]);
    const [maxDisplayPage, setMaxDisplayPage] = useState(0);
    const maxDisplayIndex = (maxDisplayPage + 1) * ACTIVITY_PAGE_SIZE;

    const filterDisplayActivities = (nextActivity, index) => index < maxDisplayIndex;
    const sortByLastUpdated = (activity0, activity1) => {
        const lastActivity0 = moment(activity0?.lastUpdatedAt ?? activity0.createdAt);
        const lastActivity1 = moment(activity1?.lastUpdatedAt ?? activity1.createdAt);
        return lastActivity1.diff(lastActivity0, 'seconds');
    }

    const clubActivities = [
        ...club.titles,
        ...club.topics,
        ...club.members,
    ].sort(sortByLastUpdated);

    const displayActivities = useRef(clubActivities.filter(filterDisplayActivities));

    const activityCanRenderOnFeed = (titleOrTopic) => {
        return (titleOrTopic.activityType === 'topic' || titleOrTopic?.reelays?.length > 0);
    }
    const feedTitlesAndTopics = clubActivities.filter(activityCanRenderOnFeed);
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
        
        const matchFeedTitleOrTopic = (nextTitleOrTopic) => (activity.id === nextTitleOrTopic.id);
        const initFeedIndex = feedTitlesAndTopics.findIndex(matchFeedTitleOrTopic);    

        if (activityType === 'description') {
            return <DescriptionFold key={'description'} />;
        }
        if (activityType === 'noTitlesYet') {
            return <NoTitlesYetPrompt key={'noTitlesYet'} />
        }

        return (
            <ClubActivity 
                activity={activity} 
                club={club}
                feedIndex={initFeedIndex} 
                navigation={navigation}
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

    if (refreshing) {
        return <ActivityIndicator />
    }

    return (
        <FlashList
            data={displayActivities.current}
            estimatedItemSize={200}
            getItemLayout={getItemLayout}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.9}
            refreshControl={refreshControl} 
            renderItem={renderClubActivity}
            showsVerticalScrollIndicator={false}
        />
    )
}
 
export default ClubActivityScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const socketRef = useRef(null);

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

    const initClubsChat = async () => {
        const socket = io(CHAT_BASE_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('socket initialized: ', socket.id);
            socket.emit('joinChat', {
                authSession, 
                clubID: club?.id, 
                username: reelayDBUser?.username, 
                userSub: reelayDBUser?.sub,
                visibility: FEED_VISIBILITY,
            });
        });

        socket.on('activeUsersInChatUpdated', ({ activeUsersInChat }) => {
            console.log('event received: active users');
            console.log('active users in chat: ', activeUsersInChat);
        });

        socket.on('chatMessagesLoaded', ({ messages, page }) => {
            console.log('event received: messages loaded');
            console.log('chat messages loaded: ', messages);
        })

        socket.on('chatMessageSent', ({ message }) => {
            console.log('chat message received: ', message);
        });

        return socket;
    }

    const closeClubsChat = () => {
        if (!socketRef.current) {
            console.log('error closing clubs chat: could not find socket ref');
            return;
        }

        const socket = socketRef.current;
        socket.emit('leaveChat', {
            authSession, 
            clubID: club?.id, 
            userSub: reelayDBUser?.sub,
        });
        socket.close();
        socketRef.current = null;
    }

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
            onRefresh().then(() => initClubsChat());
        } else {
            if (clubMember?.id) {
                clubMember.lastActivitySeenAt = moment().toISOString();
                markClubActivitySeen({ authSession, clubMemberID: clubMember.id, reqUserSub: reelayDBUser?.sub });
            }
            initClubsChat();
        }

        logAmplitudeEventProd('openedClubActivityScreen', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            clubID: club?.id,
            club: club?.name,
        });

        return () => closeClubsChat();
    }, []);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

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
            <ActivityTopSpacer topOffset={topOffset} />
            <ClubActivityList club={club} navigation={navigation} onRefresh={onRefresh} refreshing={refreshing} />
            <ActivityBottomSpacer bottomOffset={bottomOffset} />
            <ClubBanner club={club} navigation={navigation} />

            { !clubMember && isPublicClub && <JoinClubButton /> }
            { clubMember && clubMemberHasJoined && <AddTitleButton /> }
            { clubMember && !clubMemberHasJoined && (
                <InviteFold 
                    clubMember={clubMember} 
                    isPublicClub={isPublicClub} 
                    navigation={navigation} 
                    onRefresh={onRefresh} 
                />
            )}

            { showProgressBar && (
                <UploadProgressBar clubID={club.id} mountLocation={'InClub'} onRefresh={onRefresh} />
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