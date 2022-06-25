import React from 'react';
import { SafeAreaView } from 'react-native';
import styled from 'styled-components';

import EditAccount from '../../components/profile/EditAccount';

export default EditAccountScreen = ({ navigation, route }) => {
    const EditAccountContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <EditAccountContainer>
            <EditAccount navigation={navigation} />
        </EditAccountContainer>
    )
}
