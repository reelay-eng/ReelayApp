import React, { useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ContainerStyles } from '../styles';
import styled from 'styled-components/native';

import SearchField from '../components/create-reelay/SearchField';
import SearchResults from '../components/create-reelay/SearchResults';

const MarginBelowLine = styled(View)`
    height: 30px
`
const HorizontalLine = styled(View)`
    margin: 0px 0px 0px 0px;
    height: 1px;
    width: 100%;
    background-color: #D3D3D3
`;

export default SelectTitleScreen = ({ navigation }) => {
    return (
        <SafeAreaView fullScreen={true} style={ContainerStyles.searchPageContainer}>
            <HorizontalLine />
            <SearchField />
            <MarginBelowLine />
            <SearchResults navigation={navigation} />
        </SafeAreaView>
    );
};