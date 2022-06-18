import React from 'react';
import { SafeAreaView } from 'react-native';
import styled from 'styled-components';

import DeleteAccount from '../../components/profile/DeleteAccount';

export default DeleteAccountScreen = ({ navigation, route }) => {
    const DeleteAccountContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <DeleteAccountContainer>
            <DeleteAccount navigation={navigation} />
        </DeleteAccountContainer>
    )
}
