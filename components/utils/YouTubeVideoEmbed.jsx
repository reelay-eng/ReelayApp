import { useEffect } from "react";
import React, { useState, useCallback, useRef } from 'react';
import { View, Alert, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as ScreenOrientation from "expo-screen-orientation";

export default function YoutubeVideoEmbed({ youtubeVideoID, height }) {
    const [playing, setPlaying] = useState(true);

    useEffect(()=> {
        if (playing) {
            ScreenOrientation.unlockAsync();
        } else {
            ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
        }
    }, [playing]);

    const onStateChange = useCallback((state) => {
        console.log(state);
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    return (
        <View>
        <YoutubePlayer
            height={height}
            play={playing}
            videoId={youtubeVideoID}
            onChangeState={onStateChange}
        />
        </View>
    );
}