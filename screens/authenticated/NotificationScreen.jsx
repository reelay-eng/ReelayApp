import React, { useContext, useEffect, useState } from 'react';
import { Image, TouchableOpacity, RefreshControl, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import FollowButton from '../../components/global/FollowButton';
import { handlePushNotificationResponse } from '../../navigation/NotificationHandler';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import moment from 'moment';
import NotificationSwipeableRow from '../../components/notifications/NotificationSwipeableRow';
import ProfilePicture from '../../components/global/ProfilePicture';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { markNotificationActivated, markAllNotificationsSeen, getAllMyNotifications } from '../../api/NotificationsApi';
import styled from 'styled-components/native';
import { setBadgeCountAsync } from 'expo-notifications';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ClubPicture from '../../components/global/ClubPicture';
import { FlashList } from '@shopify/flash-list';
import { GamesIconSmallSVG, GamesIconSVG, TopicsBannerIconSVG } from '../../components/global/SVGs';

const ACTIVITY_IMAGE_SIZE = 44;

const MessageTitle = styled(ReelayText.Body2Emphasized)`
    color: white;
`
const MessageBody = styled(ReelayText.Body2)`
    color: white;
`
const MessageTimestamp = styled(ReelayText.Body2)`
    color: #9C9AA3;
`
const MessageTimestampContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
`
const NotificationItemPressable = styled(TouchableOpacity)`
    background-color: ${(props) => (props.pressed) ? '#2d2d2d' : 'black' };
    flex-direction: row;
    width: 100%;
`
const NotificationPicContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin: 8px;
`
const NotificationMessageContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    padding: 8px;
`
const ReelayedByLineContainer = styled(View)`
    margin-top: 10px;
`
const RightActionContainer = styled(View)`
    align-items: center;
    justify-content: center;
    margin: 8px;
`
const TitlePoster = styled(Image)`
    border-radius: 8px;
    height: ${ACTIVITY_IMAGE_SIZE * 1.5}px;
    width: ${ACTIVITY_IMAGE_SIZE}px;
`
const UnreadIndicator = styled(View)`
    border-radius: 4px;
    background-color: ${ReelayColors.reelayBlue};
    height: 8px;
    margin: 4px;
    width: 8px;
`

const NotificationItem = ({ navigation, notificationContent, onRefresh }) => {
    moment.updateLocale("en", {
        relativeTime: {
            future: "in %s",
            past: "%s",
            s: "just now",
            ss: "%ss",
            m: "1m",
            mm: "%dm",
            h: "1h",
            hh: "%dh",
            d: "1d",
            dd: "%dd",
            M: "1mo",
            MM: "%dmo",
            y: "1y",
            yy: "%dY",
        },
    });    

    const { id, title, body, data, createdAt, seen } = notificationContent;
    const { reelayDBUser } = useContext(AuthContext);

    const authSession = useSelector(state => state.authSession);
    const myClubs = useSelector(state => state.myClubs);
    const [pressed, setPressed] = useState(false);
    const timestamp = moment(createdAt).fromNow();

    const renderNotificationMessage = () => {
        return (
            <React.Fragment>
                <MessageTitle>{title}</MessageTitle>
                { (body.length > 0) &&
                    <MessageBody key={body} style={{ paddingBottom: 4 }}>
                        {body}
                    </MessageBody>                
                }
                <MessageTimestampContainer>
                    <MessageTimestamp>
                        {timestamp}
                    </MessageTimestamp>
                    { !seen && <UnreadIndicator /> }
                </MessageTimestampContainer>
            </React.Fragment>
        );
    }

    const renderNotificationPic = () => {
        const { notifyType, fromUser, titleKey, topicID, posterURI } = data;

        const profilePicNotifyTypes = [
            'notifyClubOnMessageSent',
            'notifyClubOnPrivacyChanges',
            'notifyClubOnTitleAdded',
            'notifyClubOnTopicAdded',
            'notifyClubTitleThreadOnNewReelay',
            'notifyCreatorOnComment',
            'notifyCreatorOnFollow',
            'notifyCreatorOnLike',
            'notifyMentionedUserOnComment',
            'notifyMentionedUserOnReelayPosted',
            'notifyNewMemberOnClubInvite',
            'notifyOnAcceptRec',
            'notifyOnAddedToWatchlist',
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'notifyOtherCreatorsOnReelayPosted',
            'notifyPostsInMyFollowing',
            'notifyPostsInMyWatchlist',
            'notifyThreadOnComment',
            'notifyTopicCreatorOnReelayPosted',
            'notifyUserOnCommentLike',
        ];

        if (profilePicNotifyTypes.includes(notifyType)) {
            return <ProfilePicture navigation={navigation} user={fromUser} size={ACTIVITY_IMAGE_SIZE} />;
        }

        if (notifyType === 'loveYourself') {
            return <Icon type='ionicon' name='heart' size={ACTIVITY_IMAGE_SIZE} color={'red'} />
        }

        if (notifyType === 'notifyTrendingTitles' && posterURI) {
            const posterSource = { uri: posterURI };
            return <TitlePoster source={posterSource} />;
        }

        if (notifyType === 'notifyTrendingTopics') {
            return <TopicsBannerIconSVG />;
        }

        if (notifyType === 'notifyOnNewGuessingGame') {
            return <GamesIconSVG />
        }
        return <React.Fragment />        
    }

    const renderRightAction = () => {
        const { notifyType, club, title, titleKey, topicID, fromUser, posterURI } = data;
        const clubButtonTypes = [
            'notifyClubOnMessageSent',
            'notifyClubOnPrivacyChanges',
        ];
        const followButtonTypes = ['notifyCreatorOnFollow'];
        const posterButtonTypes = [
            'notifyClubOnTitleAdded',
            'notifyClubTitleThreadOnNewReelay',
            'notifyCreatorOnComment',
            'notifyCreatorOnLike',
            'notifyMentionedUserOnComment',
            'notifyMentionedUserOnReelayPosted',
            'notifyNewMemberOnClubInvite',
            'notifyOnAcceptRec',
            'notifyOnAddedToWatchlist',
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'notifyOtherCreatorsOnReelayPosted',
            'notifyPostsInMyWatchlist',
            'notifyThreadOnComment',
            'notifyTopicCreatorOnReelayPosted',
            'notifyUserOnCommentLike',
        ];

        if (followButtonTypes.includes(notifyType)) {
            return <FollowButton creator={fromUser} fancy creatorFollowsMe/> // creator necessarily follows you b.c. your notification is "Follow Back"
        }

        if (posterButtonTypes.includes(notifyType)) {
            const posterSource = title?.posterSource ?? { uri: posterURI };
            return <TitlePoster source={posterSource} />;
        }

        if (clubButtonTypes.includes(notifyType)) {
            if (!club?.id) return <View />;
            return <ClubPicture club={club} size={ACTIVITY_IMAGE_SIZE} />;
        }

        if (notifyType === 'notifyPostsInMyFollowing') {
            if (titleKey && posterURI) {
                const posterSource = { uri: posterURI };
                return <TitlePoster source={posterSource} />;
            } else if (topicID) {
                return <TopicsBannerIconSVG />
            }
        }

        return <React.Fragment />
    }

    const onPress = async () => {
        markNotificationActivated(id);
        handlePushNotificationResponse({ 
            authSession,
            myClubs,
            navigation,
            notificationContent, 
            reelayDBUser,
        });
    };

    return (
        <NotificationSwipeableRow notificationID={id} onRefresh={onRefresh}>
            <NotificationItemPressable key={id} onPress={onPress} pressed={pressed}>
                <NotificationPicContainer>
                    { renderNotificationPic() }
                </NotificationPicContainer>
                <NotificationMessageContainer>
                    { renderNotificationMessage() }
                </NotificationMessageContainer>
                <RightActionContainer>
                    { renderRightAction() }
                </RightActionContainer>
            </NotificationItemPressable>
        </NotificationSwipeableRow>
    )
}

const NotificationList = ({ navigation }) => {
    const PAGE_SIZE = 15;

    const dispatch = useDispatch();
    const myNotifications = useSelector(state => state.myNotifications);
    const unread = myNotifications.filter(({ seen }) => !seen).length;
    const nextPage = Math.floor(myNotifications.length / PAGE_SIZE);

    const { reelayDBUser } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const renderNotificationItem = ({ item }) => <NotificationItem navigation={navigation} notificationContent={item} onRefresh={onRefresh} />;

    const displayNotifications = myNotifications.sort((item0, item1) => {
        const moment0 = moment(item0?.createdAt);
        const moment1 = moment(item1?.createdAt);
        return moment0.diff(moment1) < 0;
    })

    const onRefresh = async () => {
        setRefreshing(true);
        const myNotificationsRefresh = await getAllMyNotifications(reelayDBUser?.sub);
        dispatch({ type: 'setMyNotifications', payload: myNotificationsRefresh });
        setRefreshing(false);
    }

    const extendNotifications = async () => {
        try {
            const fetchedNotifications = await getAllMyNotifications(reelayDBUser?.sub, nextPage);
            if (fetchedNotifications.length === 0) return;

            const combinedNotifications = [
                ...myNotifications,
                ...fetchedNotifications,
            ];
            
            const filteredNotifications = combinedNotifications.filter((notification, index) => {
                const matchOnId = (nextNotification) => (nextNotification.id === notification.id);
                return combinedNotifications.findIndex(matchOnId) === index;
            })

            if (filteredNotifications.length === myNotifications.length) return;

            dispatch({ type: 'setMyNotifications', payload: filteredNotifications });
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (unread > 0) markAllNotificationsSeen(reelayDBUser?.sub);
        setBadgeCountAsync(0);

        logAmplitudeEventProd('openMyNotifications', { username: reelayDBUser?.username });
    }, [navigation]);

    return (
        <FlashList
            data={displayNotifications}
            estimatedItemSize={64}
            keyExtractor={({ id }) => id}
            onEndReached={extendNotifications}
            onEndReachedThreshold={0.1}
            renderItem={renderNotificationItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        />
    );
}

export default NotificationScreen = ({ navigation, route }) => {
    const NotificationScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const dispatch = useDispatch();

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    return (
        <NotificationScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'notifications'} />
            <NotificationList navigation={navigation} />
        </NotificationScreenContainer>
    );
};