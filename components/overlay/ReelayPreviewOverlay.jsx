import React, { useContext } from 'react';
import { UploadContext } from '../../context/UploadContext';
import { getPosterURI } from '../../api/TMDbApi';

import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const PreviewPosterContainer = styled(View)`
    position: absolute;    
    top: 10px;
    left: ${0.75 * width - 100}px;
`
const OverlayContainer = styled(View)`
    position: absolute;
    height: 75%;
    width: 75%;
    z-index: 2;
`

export default ReelayPreviewOverlay = () => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;
    const posterURI = getPosterURI(titleObject.poster_path);

    return (
        <OverlayContainer>
            <PreviewPosterContainer>
                <Image source={{uri: posterURI}} style={{
                    height: 135,
                    width: 90,
                    borderRadius: 6,
                }} />
            </PreviewPosterContainer>
        </OverlayContainer>
    );
}