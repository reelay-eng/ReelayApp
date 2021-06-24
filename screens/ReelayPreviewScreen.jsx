import React, { useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import VideoPlayer from '../components/view-reelay/VideoPlayer';
import Poster from '../components/view-reelay/Poster';
import styled from 'styled-components/native';

const TitleContainer = styled.View`
    flex: 1;
`

const PosterContainer = styled.View`
    flex: 1;
    position: absolute;
    flex-direction: column;
    justify-content: flex-start;
    margin-right: 200px;
`

export default ReelayPreviewScreen = ({ navigation }) => {

    const titleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);

    return (
        <TitleContainer>
            <VideoPlayer videoURI={videoSource} poster={titleObject.poster_source} isPlay={true} />
            <PosterContainer>
                <Poster titleObject={titleObject} showTitle={true} />
            </PosterContainer>
        </TitleContainer>
    );
};