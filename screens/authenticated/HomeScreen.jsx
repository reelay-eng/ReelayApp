import React, { useContext, useEffect } from 'react';
import HomeComponent from '../../components/home/HomeComponent';
import styled from 'styled-components/native';

export default HomeScreen = ({ navigation }) => {
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
};