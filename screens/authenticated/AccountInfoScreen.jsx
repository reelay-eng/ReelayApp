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
    return (
        <AccountInfoContainer>
            <AccountInfo navigation={navigation} />
        </AccountInfoContainer>
    )
}
