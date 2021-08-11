import React, { useState, useCallback, useRef } from 'react';
import { View, Alert, Pressable } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import styled from 'styled-components/native';

export default function YoutubeVideoEmbed({ youtubeVideoID, height }) {
  const [playing, setPlaying] = useState(true);

  const PlayPauseTouchable = styled(Pressable)`
    position: absolute;
    height: 100%;
    width: 100%;
  `

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  return (
    <View>
      <YoutubePlayer
        initialPlayerParams={{
          controls: false,
        }}
        height={height}
        play={playing}
        videoId={youtubeVideoID}
        onChangeState={onStateChange}
      />
      <PlayPauseTouchable onPress={togglePlaying} />
    </View>
  );
}