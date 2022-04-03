import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { FlatList } from 'react-native-gesture-handler';
import FollowButton from '../../components/global/FollowButton';
import { handlePushNotificationResponse } from '../../navigation/NotificationHandler';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import moment from 'moment';
import NotificationSwipeableRow from '../../components/notifications/NotificationSwipeableRow';
import ProfilePicture from '../../components/global/ProfilePicture';
import * as ReelayText from '../../components/global/Text';
import { refreshMyNotifications } from '../../api/ReelayUserApi';
import ReelayColors from '../../constants/ReelayColors';
import { markNotificationActivated, markAllNotificationsSeen, notifyCreatorOnFollow } from '../../api/NotificationsApi';
import styled from 'styled-components/native';
import { ReelayedByLine } from '../../components/watchlist/RecPills';
import { setBadgeCountAsync } from 'expo-notifications';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { useDispatch, useSelector } from 'react-redux';

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
const NotificationItemPressable = styled(Pressable)`
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

    const dispatch = useDispatch();
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const setMyWatchlistItems = (payload) => dispatch({ action: 'setMyWatchlistItems', payload });

    const { id, title, body, data, createdAt, seen } = notificationContent;
    const { reelayDBUser } = useContext(AuthContext);
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
                <ReelayedByLineContainer>
                    { data?.newWatchlistItem?.recommendedReelaySub && 
                        <ReelayedByLine marginLeft={0} navigation={navigation} watchlistItem={data?.newWatchlistItem} />
                    }
                </ReelayedByLineContainer>
            </React.Fragment>
        );
    }

    const renderNotificationPic = () => {
        const { notifyType, fromUser } = data;

        const profilePicNotifyTypes = [
            'notifyOnAcceptRec',
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'notifyCreatorOnComment',
            'notifyThreadOnComment',
            'notifyCreatorOnFollow',
            'notifyCreatorOnLike',
            'notifyOtherCreatorsOnReelayPosted',
        ];

        if (profilePicNotifyTypes.includes(notifyType)) {
            return <ProfilePicture navigation={navigation} user={fromUser} size={ACTIVITY_IMAGE_SIZE} />;
        }

        if (notifyType === 'loveYourself') {
            return <Icon type='ionicon' name='heart' size={ACTIVITY_IMAGE_SIZE} color={'red'} />
        }

        return <React.Fragment />        
    }

    const renderRightAction = () => {
        const { notifyType, title, fromUser } = data;
        const followButtonTypes = ['notifyCreatorOnFollow'];
        const posterButtonTypes = [
            'notifyOnAcceptRec',
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'notifyCreatorOnComment',
            'notifyThreadOnComment',
            'notifyCreatorOnLike',
            'notifyOtherCreatorsOnReelayPosted',
        ];

        if (followButtonTypes.includes(notifyType)) {
            return <FollowButton creator={fromUser} fancy followingThem/>
        }

        if (posterButtonTypes.includes(notifyType)) {
            const posterSource = title?.posterSource;
            return <TitlePoster source={posterSource} />;
        }

        return <React.Fragment />
    }

    const onPress = async () => {
        markNotificationActivated(id);
        handlePushNotificationResponse({ 
            myWatchlistItems,
            navigation,
            notificationContent, 
            reelayDBUser,
            setMyWatchlistItems,
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
    const dispatch = useDispatch();
    const myNotifications = useSelector(state => state.myNotifications);
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
        console.log('CALLING ON REFRESH');
        const allMyNotifications = await refreshMyNotifications(reelayDBUser?.sub);
        console.log(allMyNotifications[allMyNotifications.length - 1]);
        dispatch({ type: 'setMyNotifications', payload: allMyNotifications });
        setRefreshing(false);
    }

    return (
        <FlatList 
            data={displayNotifications}
            horizontal={false}
            initialScrollIndex={0}
            pagingEnabled={false}
            renderItem={renderNotificationItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
            style={{
                backgroundColor: 'black',
                height: '100%',
                width: '100%',
                marginBottom: 50,
            }}
        />
    );
}

export default NotificationScreen = ({ navigation, route }) => {
    const NotificationScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const { reelayDBUser } = useContext(AuthContext);
    const myNotifications = useSelector(state => state.myNotifications);
    const unread = myNotifications.filter(({ seen }) => !seen).length;
    const unreadText = (unread > 0) ? `(${unread} new)` : '';

    useEffect(() => {
        if (unread > 0) markAllNotificationsSeen(reelayDBUser?.sub);
        setBadgeCountAsync(0);

        logAmplitudeEventProd('openMyNotifications', { username: reelayDBUser?.username });
    }, [navigation]);

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} fullPage={true} />
    }

    return (
        <NotificationScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={`Activity ${unreadText}`} />
            <NotificationList navigation={navigation} />
        </NotificationScreenContainer>
    );
};