import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import VideoPlayer from '../components/view-reelay/VideoPlayer';
import TitleInfo from '../components/view-reelay/TitleInfo';

import {
    SafeAreaView,
} from 'react-native';

export default ReelayPreviewScreen = ({ navigation }) => {

    const titleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);

    return (
        <SafeAreaView>
            <VideoPlayer videoURI={videoSource} poster={titleObject.poster_source} isPlay={true}>
                <TitleInfo titleObject={titleObject} />
            </VideoPlayer>
        </SafeAreaView>
    );
};