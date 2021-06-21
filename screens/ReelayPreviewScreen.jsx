import React, { useState, useRef, useEffect } from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ContainerStyles, TextStyles } from '../styles';
import styled from 'styled-components/native';

import { AntDesign } from '@expo/vector-icons'; 
import VideoPlayer from '../components/view-reelay/VideoPlayer';
import TitleInfo from '../components/view-reelay/TitleInfo';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

export default ReelayPreviewScreen = ({ navigation }) => {
    const [isPlaying, setIsPlaying] = useState(true);

    const titleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);
    const dispatch = useDispatch();

    const playPause = () => setIsPlaying(!isPlaying);

    const TopContainer = styled(View)`
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
`  

    return (
        <SafeAreaView>
            <VideoPlayer videoURI={videoSource} poster={titleObject.poster_source} isPlaying={isPlaying}>
                <TitleInfo />
            </VideoPlayer>
        </SafeAreaView>
    );
};