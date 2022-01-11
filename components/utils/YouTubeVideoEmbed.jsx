import React, { useState, useCallback, useRef } from 'react';
import { View, Alert, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function YoutubeVideoEmbed({ youtubeVideoID, height }) {
    const [playing, setPlaying] = useState(true);

    const onStateChange = useCallback((state) => {
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