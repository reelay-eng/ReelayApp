import React, { useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import styled from 'styled-components/native';

import { useSelector } from 'react-redux';

import SearchField from './SearchField';
import SearchResults from './SearchResults';

const { height, width } = Dimensions.get('window');

const MarginAboveLine = styled(View)`
    height: 50px
`
const MarginBelowLine = styled(View)`
    height: 30px
`
const MarginContainer = styled(View)`
`
const HorizontalLine = styled(View)`
    margin: 0px 0px 0px 0px;
    height: 1px;
    width: 100%;
    background-color: #D3D3D3
`;

const OverlayContainer = styled(Overlay)`
    margin: 0px 0px 0px 0px;
`

export default TagMovieOverlay = () => {
    const visible = useSelector((state) => state.createReelay.overlayVisible);

    return (
        <OverlayContainer isVisible={visible} fullScreen={true}>
            <MarginAboveLine />
            <HorizontalLine />
            <SearchField />
            <MarginBelowLine />
            <SearchResults />
        </OverlayContainer>
    );
};