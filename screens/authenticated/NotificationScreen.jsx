import React, { useContext, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, SafeAreaView, View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from '../../components/global/Headers';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { refreshMyNotifications } from '../../api/ReelayUserApi';
import { FlatList } from 'react-native-gesture-handler';
import { handlePushNotificationResponse } from '../../navigation/NotificationHandler';
import ReelayIcon from '../../assets/icons/reelay-icon.png'

import moment from 'moment';

const NotificationItemPressable = styled(Pressable)`
    background-color: ${(props) => (props.pressed) ? '#2d2d2d' : '#1d1d1d' };
    border-color: #2d2d2d;
    border-radius: 8px;
    border-width: 0.3px;
    flex-direction: row;
    margin-top: 6px;
    margin-bottom: 6px;
    padding: 6px;
    width: 90%;
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
    margin-left: 10px;
    padding: 8px;
`
const MessageTitle = styled(ReelayText.Body2)`
    color: white;
`
const MessageBody = styled(ReelayText.Body2)`
    color: white;
`
const MessageTimestamp = styled(ReelayText.Body2)`
    color: #9C9AA3;
`

const NotificationItem = ({ navigation, notificationContent }) => {
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
    const timestamp = moment(createdAt).fromNow();
    const authContext = useContext(AuthContext);
    const [pressed, setPressed] = useState(false);

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
        <NotificationItemPressable key={id} onPress={onPress} pressed={pressed}>
            <NotificationPicContainer>
                <Image source={ReelayIcon} style={{ height: 54, width: 54, borderRadius: 12 }} />
            </NotificationPicContainer>
            <NotificationMessageContainer>
                <MessageTitle>{title}</MessageTitle>
                <MessageBody key={body} style={{ paddingBottom: 4 }}>
                    {body}
                </MessageBody>
                <MessageTimestamp>
                    {timestamp}
                </MessageTimestamp>
            </NotificationMessageContainer>
        </NotificationItemPressable>
    )
}

const NotificationList = ({ navigation }) => {
    const { cognitoUser, myNotifications, setMyNotifications } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const renderNotificationItem = ({ item }) => <NotificationItem navigation={navigation} notificationContent={item} />;

    const onRefresh = async () => {
        console.log('CALLING ON REFRESH');
        await refreshMyNotifications(cognitoUser?.attributes?.sub);
    }

    return (
        <FlatList 
            data={myNotifications}
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