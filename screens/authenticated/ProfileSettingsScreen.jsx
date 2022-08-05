import React from 'react';
import { SafeAreaView } from 'react-native';
import styled from 'styled-components';

import { ProfileSettings } from '../../components/profile/ProfileSettings';

export default ProfileSettingsScreen = ({ navigation, route }) => {
    const ProfileSettingsContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <ProfileSettingsContainer>
            <ProfileSettings navigation={navigation}/>
        </ProfileSettingsContainer>
    )
}