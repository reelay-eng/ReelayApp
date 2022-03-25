import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components';

import GeneralSettings from '../../components/profile/GeneralSettings';

export default GeneralSettingsScreen = ({navigation, route}) => {
    const GeneralSettingsContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <GeneralSettingsContainer>
            <GeneralSettings navigation={navigation}/>
        </GeneralSettingsContainer>
    )
}