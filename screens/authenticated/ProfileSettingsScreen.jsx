import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components';
import { registerUser } from '../../api/ReelayDBApi';

import { ProfileSettings } from '../../components/profile/ProfileSettings';

export default ProfileSettingsScreen = ({navigation, route}) => {
    const ProfileSettingsContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const registerCustomUser = async () => {
        const result = await registerUser({
            email: 'ereverhard@gmail.com',
            username: 'emmevv',
            sub: 'b4726550-5d2f-4452-bd51-1ef693d5c33b',
        });
        console.log('register result: ', result);
    }
    useEffect(() => {
        registerCustomUser();
    }, []);
    return (
        <ProfileSettingsContainer>
            <ProfileSettings navigation={navigation}/>
        </ProfileSettingsContainer>
    )
}