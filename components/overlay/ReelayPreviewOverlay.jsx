import React, { useContext } from 'react';
import { UploadContext } from '../../context/UploadContext';
import { getPosterURI } from '../../api/TMDbApi';

import { View } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';

const PreviewPosterContainer = styled(View)`
    height: 135px;
    width: 90px;
    margin: 10px;
    border-radius: 8px;
    align-self: flex-end;
`
const OverlayContainer = styled(View)`
    height: 100%;
    width: 100%;
    flex: 1;
    justify-content: flex-start;
`

export default ReelayPreviewOverlay = () => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;
    const posterURI = getPosterURI(titleObject.poster_path);

    return (
        <OverlayContainer>
            <PreviewPosterContainer>
                <Image source={posterURI} />
            </PreviewPosterContainer>
        </OverlayContainer>
    );
}