import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    RefreshControl,
    TouchableOpacity,
    View
} from 'react-native';

import styled from 'styled-components/native';
import moment from 'moment';

import ActiveUsersInChatBar from './ActiveUsersInChatBar';
import ClubChatMessage from './ClubChatMessage';
import ClubTitleCard from './ClubTitleCard';
import ExpandedTitleDrawer from '../watchlist/ExpandedTitleDrawer';
import NoTitlesYetPrompt from './NoTitlesYetPrompt';

import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import TopicCard from '../topics/TopicCard';
import ClubAddedMemberCard from './ClubAddedMemberCard';
import { FlashList } from '@shopify/flash-list';
import { AuthContext } from '../../context/AuthContext';
import InviteToChatExternalPrompt from './InviteToChatExternalPrompt';
import { firebaseCrashlyticsError, firebaseCrashlyticsLog } from '../utils/EventLogger';


const { height, width } = Dimensions.get('window');
const ACTIVITY_PAGE_SIZE = 20;
const LAST_TYPING_MAX_SECONDS = 10;

const ActivityView = styled(View)`
    margin-left: ${props => props.activityType === 'topic' ? 16 : 0}px;
    margin-bottom: 8px;
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
const TypingActivityView = styled(View)`
    padding: 8px;
    padding-left: 16px;
    padding-right: 16px;
`
const ClubActivity = ({ activity, club, feedIndex, navigation, onRefresh, setExpandedTitle }) => {
    const { activityType } = activity;
    const advanceToFeed = (initStackIndex = 0) => {
        if (feedIndex === -1) return;
        navigation.push('ClubFeedScreen', { club, initStackIndex, initFeedIndex: feedIndex });
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
                    setExpandedTitle={setExpandedTitle}
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
                {club.description}
            </DescriptionText>
        </DescriptionView>
    )
}

const TypingActivity = ({ activeUser }) => {
    return (
        <TypingActivityView>
            <DescriptionText>{`${activeUser.username} is typing...`}</DescriptionText>
        </TypingActivityView>
    );
}


export default ClubActivityList = ({
    activeUsersInChatRef,
    club,
    chatMessagesRef,
    loadChatMessageHistory,
    navigation,
    onRefresh,
    refreshing,
    scrollRef,
    showChatMessages,
    socketRef,
}) => {
    try {
        firebaseCrashlyticsLog('Club activity list');
        const { reelayDBUser } = useContext(AuthContext);
        const itemHeights = useRef([]);
        const [usersTyping, setUsersTyping] = useState([]);
        const usersTypingRef = useRef(usersTyping);

        const [chatMessageCount, setChatMessageCount] = useState(chatMessagesRef?.current?.length);
        const [expandedTitle, setExpandedTitle] = useState(null);
        const [maxDisplayPage, setMaxDisplayPage] = useState(0);
        const maxDisplayIndex = (maxDisplayPage + 1) * ACTIVITY_PAGE_SIZE;

        const filterDisplayActivities = (nextActivity, index) => index < maxDisplayIndex;
        const sortByLastUpdated = (activity0, activity1) => {
            if (activity0.activityType === 'typing') return -1;
            if (activity1.activityType === 'typing') return 1;
            const lastActivity0 = moment(activity0?.lastUpdatedAt ?? activity0.createdAt);
            const lastActivity1 = moment(activity1?.lastUpdatedAt ?? activity1.createdAt);
            return lastActivity1.diff(lastActivity0, 'seconds');
        }

        const getItemLayout = (item, index) => {
            const length = itemHeights.current[index] ?? 0;
            const accumulate = (sum, next) => sum + next;
            const offset = itemHeights.current.slice(0, index).reduce(accumulate, 0);
            return { length, offset, index };
        }

        const getUsersTyping = () => {
            const now = moment();
            const usersTypingEntries = {};
            for (const activeUser of Object.values(activeUsersInChatRef?.current)) {
                if (!activeUser?.lastTypingAt) continue;
                if (activeUser?.userSub === reelayDBUser?.sub) continue;
                const secondsSinceTyping = now.diff(activeUser.lastTypingAt, 'seconds');
                if (secondsSinceTyping < LAST_TYPING_MAX_SECONDS) {
                    usersTypingEntries[activeUser?.userSub] = {
                        ...activeUser,
                        activityType: 'typing'
                    };
                }
            }
            return Object.values(usersTypingEntries).sort(sortUsersTyping);
        }

        const sortUsersTyping = (typingUser0, typingUser1) => {
            return typingUser0?.lastTypingAt - typingUser1?.lastTypingAt;
        }

        const displayChatMessages = (showChatMessages) ? chatMessagesRef?.current : [];
        const chatMessagesLastIndex = chatMessagesRef?.current?.length - 1;
        for (const chatMessageIndex in chatMessagesRef?.current) {
            const chatMessage = chatMessagesRef?.current[chatMessageIndex];
            chatMessage.activityType = 'message';
            // note that this only works with a == comparator, not ===
            chatMessage.isOldestMessage = (chatMessageIndex == chatMessagesLastIndex);
        }

        const clubActivities = [
            ...usersTyping,
            ...club.titles,
            ...club.topics,
            ...displayChatMessages,
        ].sort(sortByLastUpdated);

        let displayActivities = clubActivities.filter(filterDisplayActivities);
        const activityCanRenderOnFeed = (titleOrTopic) => {
            return (titleOrTopic.activityType === 'topic' || titleOrTopic?.reelays?.length > 0);
        }
        const feedTitlesAndTopics = clubActivities.filter(activityCanRenderOnFeed);
        const refreshControl = <RefreshControl tintColor={"#fff"} refreshing={refreshing} onRefresh={onRefresh} />;

        const onEndReached = () => {
            const nextMaxDisplayIndex = (maxDisplayPage + 2) * ACTIVITY_PAGE_SIZE;
            const filterNextDisplayActivities = (nextActivity, index) => index < nextMaxDisplayIndex;
            if (clubActivities?.length === displayActivities?.length) return;
            displayActivities = clubActivities.filter(filterNextDisplayActivities);
            setMaxDisplayPage(maxDisplayPage + 1);
        }

        const keyExtractor = (item) => {
            if (item?.activityType === 'description') return 'description';
            if (item?.activityType === 'noTitlesYet') return 'noTitlesYet';
            if (item?.activityType === 'typing') return item?.userSub;
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

            if (activityType === 'message') {
                return (
                    <ClubChatMessage
                        key={activity?.id}
                        loadChatMessageHistory={loadChatMessageHistory}
                        message={activity}
                        navigation={navigation}
                        socketRef={socketRef}
                    />
                );
            }

            if (activityType === 'noTitlesYet') {
                return <NoTitlesYetPrompt key={'noTitlesYet'} />
            }

            if (activityType === 'typing') {
                return <TypingActivity key={activity?.userSub} activeUser={activity} />
            }

            return (
                <ClubActivity
                    activity={activity}
                    club={club}
                    feedIndex={initFeedIndex}
                    navigation={navigation}
                    onRefresh={onRefresh}
                    setExpandedTitle={setExpandedTitle}
                />
            );
        };

        const updateChatActivity = () => {
            if (chatMessagesRef?.current?.length !== chatMessageCount) {
                setChatMessageCount(chatMessagesRef?.current?.length);
            }
        }

        const updateTypingActivity = () => {
            try {
                const nextUsersTyping = getUsersTyping();
                const stateString = JSON.stringify(usersTypingRef.current);
                const nextStateString = JSON.stringify(nextUsersTyping);

                if (nextStateString !== stateString) {
                    usersTypingRef.current = nextUsersTyping;
                    setUsersTyping(nextUsersTyping);
                }
            } catch (error) {
                console.log('error updating typing activity');
                console.log(error);
            }
        }

        useEffect(() => {
            const chatActivityInterval = setInterval(() => {
                updateChatActivity();
                updateTypingActivity();
            }, 250);
            return () => clearInterval(chatActivityInterval);
        }, []);

        return (
            <Fragment>
                {(displayActivities?.length > 0) && (
                    <FlashList
                        data={displayActivities}
                        estimatedItemSize={200}
                        getItemLayout={getItemLayout}
                        inverted={true}
                        keyExtractor={keyExtractor}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.9}
                        ref={scrollRef}
                        refreshControl={refreshControl}
                        renderItem={renderClubActivity}
                        showsVerticalScrollIndicator={false}
                    />
                )}
                {(displayActivities?.length === 0) && (
                    <InviteToChatExternalPrompt club={club} navigation={navigation} />
                )}
                <ActiveUsersInChatBar
                    activeUsersInChatRef={activeUsersInChatRef}
                    navigation={navigation}
                />
                {expandedTitle && (
                    <ExpandedTitleDrawer
                        expandedTitle={expandedTitle}
                        navigation={navigation}
                        onRefresh={() => { }}
                        setExpandedTitle={setExpandedTitle}
                        source='clubs'
                    />
                )}
            </Fragment>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
