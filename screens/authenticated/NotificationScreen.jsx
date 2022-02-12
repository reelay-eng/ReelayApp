import React, { useContext, useEffect } from 'react';
import { Pressable, SafeAreaView, View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from '../../components/global/Headers';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { getAllMyNotifications } from '../../api/NotificationsApi';
import ProfilePicture from '../../components/global/ProfilePicture';
import WatchlistCoachMark from '../../components/watchlist/WatchlistCoachMark';

const NotificationItemContainer = styled(View)`
    flex-direction: row;
    margin: 10px;
    margin-top: 20px;
    padding: 12px;
    width: 90%;
`
const NotificationPicContainer = styled(View)`
    align-items: center;
    justify-content: center;
`
const NotificationMessageContainer = styled(View)`
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    margin-left: 10px;
    padding: 8px;
`

const NotificationItem = ({ notificationObj }) => {
    const { title, body, data } = notificationObj;

    return (
        <NotificationItemContainer>
            <NotificationPicContainer>
                <Image source={ReelayIcon} style={{ height: 54, width: 54, borderRadius: 12 }} />
            </NotificationPicContainer>
            <NotificationMessageContainer>
                <ReelayText.Subtitle1Emphasized>
                    {title}
                </ReelayText.Subtitle1Emphasized>
                <ReelayText.Body2 key={bodyText} style={{ paddingBottom: 4 }}>
                    {body}
                </ReelayText.Body2>    
            </NotificationMessageContainer>
        </NotificationItemContainer>
    )
}

export default NotificationScreen = ({ navigation, route }) => {
    const { cognitoUser } = useContext(AuthContext);
    const NotificationScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `

    useEffect(() => {
        loadMyNotifications();
    })

    const loadMyNotifications = async () => {
        const allMyNotifications = await getAllMyNotifications(cognitoUser?.attributes?.sub);
        console.log('all my notifications: ', allMyNotifications);
    }
    
    return (
        <NotificationScreenContainer>
            <HeaderWithBackButton navigation={navigation} text={'Activity'} />
            {/* <NotificationItem /> */}
        </NotificationScreenContainer>
    );
};