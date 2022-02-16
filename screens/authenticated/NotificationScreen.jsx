import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { ActionButton, BWButton } from '../../components/global/Buttons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { FlatList } from 'react-native-gesture-handler';
import { followCreator, getReelay, prepareReelay } from '../../api/ReelayDBApi';
import { handlePushNotificationResponse } from '../../navigation/NotificationHandler';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import moment from 'moment';
import NotificationSwipeableRow from '../../components/notifications/NotificationSwipeableRow';
import ProfilePicture from '../../components/global/ProfilePicture';
import ReelayIcon from '../../assets/icons/reelay-icon.png';
import * as ReelayText from '../../components/global/Text';
import { refreshMyNotifications } from '../../api/ReelayUserApi';
import ReelayColors from '../../constants/ReelayColors';
import { sendFollowNotification } from '../../api/NotificationsApi';
import styled from 'styled-components/native';

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
const ReelayIconImage = styled(Image)`
    border-radius: 12px;
    height: ${ACTIVITY_IMAGE_SIZE}px;
    width: ${ACTIVITY_IMAGE_SIZE}px;
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

    const { id, title, body, data, createdAt } = notificationContent;
    const authContext = useContext(AuthContext);
    const { reelayDBUser, myFollowing, setMyFollowing } = authContext;
    const [pressed, setPressed] = useState(false);
    const timestamp = moment(createdAt).fromNow();

    const FollowButton = ({ followedByUser }) => {
        const FollowButtonContainer = styled(View)`
            height: 40px;
            width: 90px;
            justify-content: center;
        `
        const alreadyFollowing = !!myFollowing.find((nextUser) => {
            return (nextUser?.creatorSub === followedByUser?.sub);
        });

        const followUser = async () => {
            const followResult = await followCreator(followedByUser?.sub, reelayDBUser?.sub);
            const success = !followResult?.error && !followResult?.requestStatus;
            
            if (success) {
                const allMyFollowing = [...myFollowing, followResult];
                setMyFollowing(allMyFollowing);
                await AsyncStorage.setItem('myFollowing', JSON.stringify(allMyFollowing));
            } else {
                logAmplitudeEventProd('followCreatorError', {
                    error: followResult?.error,
                    requestStatus: followResult?.requestStatus,
                });
                return;
            }
    
            logAmplitudeEventProd('followedCreator', {
                username: reelayDBUser?.username,
                creatorName: followedByUser?.username,
            });
    
            await sendFollowNotification({
              creatorSub: followedByUser?.sub,
              follower: reelayDBUser,
            });
        }

        if (!alreadyFollowing) {
            return (
                <FollowButtonContainer>
                    <ActionButton
                        backgroundColor={ReelayColors.reelayRed}
                        borderColor={ReelayColors.reelayBlack}
                        borderRadius="8px"
                        color="blue"
                        onPress={followUser}
                        text="Follow"
                        rightIcon={<Icon type='ionicon' name='person-add' size={16} color='white' />}                
                    />
                </FollowButtonContainer>
            );        
        } else {
            return (
                <FollowButtonContainer>
                    <BWButton 
                        borderRadius="8px" 
                        text="Friends"
                        rightIcon={<Icon type="ionicon" name="checkmark-circle" color={"white"} size={16} />}                
                    />
                </FollowButtonContainer>
            );
        }
    }

    const ReplyButton = () => {
        const ReplyButtonContainer = styled(View)`
            height: 40px;
            width: 90px;
            justify-content: center;
        `
        const pushSingleReelayScreen = async () => {
            setPressed(true);
            const singleReelay = await getReelay(data?.reelaySub);
            const preparedReelay = await prepareReelay(singleReelay); 
            setPressed(false);
            navigation.push('SingleReelayScreen', { 
                openCommentsOnLoad: true,
                preparedReelay 
            });    
        }

        return (
            <ReplyButtonContainer>
                <ActionButton
                    backgroundColor={ReelayColors.reelayRed}
                    borderColor={ReelayColors.reelayBlack}
                    borderRadius="8px"
                    color="blue"
                    onPress={pushSingleReelayScreen}
                    text="Reply"
                    rightIcon={<Icon type='ionicon' name='arrow-undo' size={16} color='white' />}                
                />
            </ReplyButtonContainer>
        );        
    }

    const renderNotificationMessage = () => {
        return (
            <React.Fragment>
                <MessageTitle>{title}</MessageTitle>
                { (body.length > 0) &&
                    <MessageBody key={body} style={{ paddingBottom: 4 }}>
                        {body}
                    </MessageBody>                
                }
                <MessageTimestamp>
                    {timestamp}
                </MessageTimestamp>
            </React.Fragment>
        );
    }

    const renderNotificationPic = () => {
        const { notifyType, user } = data;
        // newItems is ONLY present on openMyRecs actions
        // user is present in openSingleReelayScreen actions and openUserProfileScreen actions
        // title is present on openSingleReelayScreen actions

        const profilePicNotifyTypes = [
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'sendCommentNotificationToCreator',
            'sendCommentNotificationToThread',
            'sendFollowNotification',
            'sendLikeNotification',
            'sendStackPushNotificationToOtherCreators',
        ];

        if (profilePicNotifyTypes.includes(notifyType)) {
            return <ProfilePicture navigation={navigation} user={user} size={ACTIVITY_IMAGE_SIZE} />;
        }

        if (notifyType === 'loveYourself') {
            return <Icon type='ionicon' name='heart' size={ACTIVITY_IMAGE_SIZE} color={'red'} />
        }

        return <React.Fragment />        
    }

    const renderRightAction = () => {
        const { notifyType, title, user, newItems } = data;
        const followButtonTypes = ['sendFollowNotification'];
        const posterButtonTypes = [
            'notifyOnReelayedRec',
            'notifyOnSendRec',
            'sendCommentNotificationToCreator',
            'sendCommentNotificationToThread',
            'sendLikeNotification',
            'sendStackPushNotificationToOtherCreators',
        ];

        if (followButtonTypes.includes(notifyType)) {
            return <FollowButton followedByUser={user} />
        }

        if (posterButtonTypes.includes(notifyType)) {
            const posterSource = (notifyType === 'notifyOnSendRec') 
                ? newItems?.[0]?.title?.posterSource
                : title?.posterSource;
            return <TitlePoster source={posterSource} />;
        }

        return <React.Fragment />
    }

    const onPress = async () => {
        setPressed(true);
        await handlePushNotificationResponse({ 
            navigation,
            notificationContent, 
            userContext: authContext,
        });
        setPressed(false);
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
    const { cognitoUser, myNotifications, setMyNotifications } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const renderNotificationItem = ({ item }) => <NotificationItem navigation={navigation} notificationContent={item} onRefresh={onRefresh} />;

    const displayNotifications = myNotifications.sort((item0, item1) => {
        const moment0 = moment(item0?.createdAt);
        const moment1 = moment(item1?.createdAt);
        return moment0.diff(moment1) < 0;
    })

    const onRefresh = async () => {
        console.log('CALLING ON REFRESH');
        const allMyNotifications = await refreshMyNotifications(cognitoUser?.attributes?.sub);
        setMyNotifications(allMyNotifications);
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
    return (
        <NotificationScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'Activity'} />
            <NotificationList navigation={navigation} />
        </NotificationScreenContainer>
    );
};