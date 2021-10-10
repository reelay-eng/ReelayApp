import React from 'react';
import { getPosterURL } from '../../api/TMDbApi';

import { Dimensions, View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

export default ReelayPreviewOverlay = ({ titleObject }) => {
    const posterURI = getPosterURL(titleObject.poster_path);

    const OverlayContainer = styled(View)`
        position: absolute;
        height: 75%;
        width: 75%;
        z-index: 2;
    `
    const PreviewPosterContainer = styled(View)`
        position: absolute;    
        top: 10px;
        left: ${0.75 * width - 100}px;
    `
    return (
        <OverlayContainer>
            <PreviewPosterContainer>
                <Image source={{ uri: posterURI }} style={{
                    height: 135,
                    width: 90,
                    borderRadius: 6,
                }} />
            </PreviewPosterContainer>
        </OverlayContainer>
    );
};