import React, { useRef, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import styled from 'styled-components/native';

import { useSelector } from 'react-redux';

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
    const visible = useSelector((state) => state.createReelay.overlayVisible);

    return (
        <SafeAreaView isVisible={visible} fullScreen={true}>
            <HorizontalLine />
            <SearchField />
            <MarginBelowLine />
            <SearchResults navigation={navigation} />
        </SafeAreaView>
    );
};