import React, { useContext, useEffect } from 'react';
import HomeComponent from '../../components/home/HomeComponent';
import styled from 'styled-components/native';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';

export default HomeScreen = ({ navigation }) => {
    try {
        firebaseCrashlyticsLog('Home Screen Mounted');
        const Container = styled.View`
        width: 100%;
        height: 100%;
        flex: 1;
        background-color: black;
    `

        return (
            <Container>
                <HomeComponent navigation={navigation} />
            </Container>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};