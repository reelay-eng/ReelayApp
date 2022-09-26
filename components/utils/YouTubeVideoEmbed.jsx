import { useEffect } from "react";
import React, { useState, useCallback, useRef } from 'react';
import { View, Alert, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as ScreenOrientation from "expo-screen-orientation";
import styled from 'styled-components/native';

const PORTRAIT_MODE = ScreenOrientation.OrientationLock.PORTRAIT_UP;
const EmbedView = styled(View)`
    border-radius: ${props => props.borderRadius}px;
`

export default function YoutubeVideoEmbed({ borderRadius = 0, height, youtubeVideoID }) {
    console.log('youtube video id: ', youtubeVideoID);
    const [playing, setPlaying] = useState(true);

    useEffect(()=> {
        if (playing) {
            ScreenOrientation.unlockAsync();
        } else {
            ScreenOrientation.lockAsync(PORTRAIT_MODE);
        }
        return () => ScreenOrientation.lockAsync(PORTRAIT_MODE);
    }, [playing]);

    const onStateChange = useCallback((state) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    return (
        <EmbedView borderRadius={borderRadius}>
            <YoutubePlayer
                height={height}
                play={playing}
                videoId={youtubeVideoID}
                onChangeState={onStateChange}
            />
        </EmbedView>
    );
}