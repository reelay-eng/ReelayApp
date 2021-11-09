import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components';

import NotificationSettings from '../../components/profile/NotificationSettings';

export default NotificationSettingsScreen = ({navigation, route}) => {
    const NotificationSettingsContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <NotificationSettingsContainer>
            <NotificationSettings navigation={navigation}/>
        </NotificationSettingsContainer>
    )
}