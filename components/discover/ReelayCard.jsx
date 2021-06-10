import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { Video, AVPlaybackStatus } from "expo-av";
import { Storage, Auth, API, DataStore } from 'aws-amplify';

import {
    Button,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
  } from "react-native";

  
export default function ReelayCard({ username, movieTitle, videoURL }) {

    const [playbackStatus, setPlaybackStatus] = useState({});
    const [videoSource, setVideoSource] = useState(null);
    const videoRef = useRef();

    useEffect(() => {
        (async () => {
            // todo
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={{ uri: videoURL }}
                shouldPlay={false}
                style={styles.media}
                useNativeControls
                resizeMode={'contain'}
                onPlaybackStatusUpdate={
                    playbackStatus => setPlaybackStatus(() => playbackStatus)
                }
            />
            <Text>{username}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    getStartedText: {
      fontSize: 17,
      lineHeight: 24,
      textAlign: 'center',
    },
    media: {
        height: 300,
        width: 300,
        flex: 1
      },    
  });
  