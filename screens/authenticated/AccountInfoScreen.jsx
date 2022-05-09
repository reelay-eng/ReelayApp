import React from 'react';
import { SafeAreaView } from 'react-native';
import styled from 'styled-components';

import AccountInfo from '../../components/profile/AccountInfo';

export default AccountInfoScreen = ({ navigation, route }) => {
    const AccountInfoContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    const refreshProfile = route?.params?.refreshProfile;
    return (
        <AccountInfoContainer>
            <AccountInfo navigation={navigation} refreshProfile={refreshProfile} />
        </AccountInfoContainer>
    )
}
