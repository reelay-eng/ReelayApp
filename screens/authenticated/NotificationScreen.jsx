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

const MessageTitle = styled(ReelayText.Body2)`
    color: white;
`
const MessageBody = styled(ReelayText.Body2)`
    color: white;
`
const MessageTimestamp = styled(ReelayText.Body2)`
    color: #9C9AA3;
`
const NotificationItemPressable = styled(Pressable)`
    background-color: ${(props) => (props.pressed) ? '#2d2d2d' : '#1d1d1d' };
    border-color: #2d2d2d;
    border-radius: 8px;
    border-width: 0.3px;
    flex-direction: row;
    margin-top: 6px;
    margin-bottom: 6px;
    padding: 6px;
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
            const followResult = await followCreator(followedByUser.sub, reelayDBUser?.sub);
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
            navigation.push('SingleReelayScreen', { preparedReelay });    
        }

        // logAmplitudeEventProd('tappedReplyFromNotificationCenter', {
        //     username: reelayDBUser?.username,
        //     creatorName: followedByUser?.username,
        // });

        return (
            <ReplyButtonContainer>
                <ActionButton
                    backgroundColor={ReelayColors.reelayRed}
                    borderColor={ReelayColors.reelayBlack}
                    borderRadius="8px"
                    color="green"
                    onPress={pushSingleReelayScreen}
                    text="Reply"
                />
            </ReplyButtonContainer>
        );        
    }

    const renderNotificationMessage = () => {
        const { action, commentText, newItems, notifyType, user } = data;
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
        const { action, newItems, notifyType, title, user } = data;
        // availability: 
        // newItems is ONLY present on openMyRecs actions
        // user is present in openUserProfileScreen actions and altActions
        // title is present on openSingleReelayScreen actions

        if (notifyType === 'loveYourself') {
            return <Icon type='ionicon' name='heart' size={ACTIVITY_IMAGE_SIZE} color={'red'} />
        } else if (notifyType === 'sendCommentNotificationToCreator' 
                || notifyType === 'sendCommentNotificationToThread') {
            const posterSource = title?.posterSource;
            return <TitlePoster source={posterSource} /> ;        
        }

        if (action === 'openCreateScreen') {
            return <ReelayIconImage source={ReelayIcon} />;
        } else if (action === 'openMyRecs') {
            const posterSource = newItems[0]?.title?.posterSource;
            return <TitlePoster source={posterSource} /> ;
        } else if (action === 'openSingleReelayScreen') {
            const posterSource = title?.posterSource;
            return <TitlePoster source={posterSource} />;
        } else if (action === 'openUserProfileScreen') {
            return <ProfilePicture userSub={user?.sub} size={ACTIVITY_IMAGE_SIZE} />
        }
    }

    const renderRightAction = () => {
        const { notifyType, user } = data;
        if (notifyType === 'sendFollowNotification' ||
            notifyType === 'sendLikeNotification') {
            return <FollowButton followedByUser={user} />
        }
        
        if (notifyType === 'sendCommentNotificationToCreator' ||
            notifyType === 'sendCommentNotificationToThread') {
                return <ReplyButton />
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
    const NotificationItemContainer = styled(View)`
        width: 100%;
    `
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