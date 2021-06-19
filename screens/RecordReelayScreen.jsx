// placeholder code from: 
// https://www.instamobile.io/react-native-tutorials/capturing-photos-and-videos-with-the-camera-in-react-native/

import React, { useState, useRef, useEffect } from "react";
import  { Storage, Auth, API, DataStore, progressCallback } from "aws-amplify";
import { User, Artist, Movie, Reelay } from '../src/models';

import { useDispatch, useSelector } from 'react-redux';
import { untagTitle } from "../redux/slices/CreateReelaySlice";

import { Camera } from "expo-camera";
import { Video, AVPlaybackStatus } from "expo-av";
import { Button } from 'react-native-elements';

import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import TitleInfo from "../components/create-reelay/TitleInfo";
import TagMovieOverlay from "../components/create-reelay/TagMovieOverlay";

import styled from 'styled-components/native';

const WINDOW_HEIGHT = Dimensions.get("window").height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.032);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);

export default function RecordReelayScreen({ navigation }) {
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [hasPermission, setHasPermission] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [videoSource, setVideoSource] = useState(null);

  const cameraRef = useRef();
  const videoRef = useRef();

  const overlayVisible = useSelector((state) => state.createReelay.overlayVisible);

  const dispatch = useDispatch();

  const BackButtonContainer = styled(View)`
	  flex: 1;
    flex-direction: column;
	  justify-content: flex-end;
    align-items: flex-start;
  `
  const TopContainer = styled(View)`
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  `

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("on record reelay screen");
    });
    return unsubscribe;
  }, [navigation]);

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const recordVideo = async () => {
    if (cameraRef.current) {
      try {
        const videoRecordPromise = cameraRef.current.recordAsync();
        if (videoRecordPromise) {
          setIsVideoRecording(true);
          const data = await videoRecordPromise;
          const source = data.uri;
          if (source) {
            setIsPreview(true);
            console.log("video source", source);
            setVideoSource(source);
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const stopVideoRecording = () => {
    if (cameraRef.current) {
      setIsPreview(false);
      setIsVideoRecording(false);
      cameraRef.current.stopRecording();
    }
  };

  const switchCamera = () => {
    if (isPreview) {
      return;
    }

    setCameraType((prevCameraType) =>
      prevCameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setVideoSource(null);
  };

  const renderCancelPreviewButton = () => (
    <TouchableOpacity onPress={cancelPreview} style={styles.closeButton}>
      <View style={[styles.closeCross, { transform: [{ rotate: "45deg" }] }]} />
      <View
        style={[styles.closeCross, { transform: [{ rotate: "-45deg" }] }]}
      />
    </TouchableOpacity>
  );

  const renderVideoPlayer = () => (
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={{ uri: videoSource }}
          shouldPlay={false}
          style={styles.media}
          useNativeControls
          resizeMode="contain"
          onPlaybackStatusUpdate={playbackStatus => setPlaybackStatus(() => playbackStatus)}
        />
        <View style={styles.upload}>
          <TouchableOpacity disabled={!videoSource} onPress={uploadReelay}>
            <Text style={styles.text}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
  );

  const renderVideoRecordIndicator = () => (
    <View style={styles.recordIndicatorContainer}>
      <View style={styles.recordDot} />
      <Text style={styles.recordTitle}>{"Recording..."}</Text>
    </View>
  );

  const renderCaptureControl = () => (
    <View style={styles.control}>
      <TouchableOpacity disabled={!isCameraReady} onPress={switchCamera}>
        <Text style={styles.text}>{"Flip"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!isCameraReady}
        onLongPress={recordVideo}
        onPressOut={stopVideoRecording}
        onPress={!isVideoRecording ? recordVideo : stopVideoRecording}
        style={styles.capture}
      />
    </View>
  );

  const resetCreateReelay = () => {
    console.log('back button pressed');
    dispatch(untagTitle());
  }

  const renderBackButton = () => (
    <BackButtonContainer>
      <Button type='clear' title='Back' onPress={
        resetCreateReelay
      }/>
    </BackButtonContainer>
  );

  const uploadReelay = async () => {
    if (!videoSource) {
      console.log("No video to upload.")
    } else {
      // Set current user as the creator
      const creator = await Auth.currentAuthenticatedUser();
      console.log(creator.attributes.sub);
      const videoS3Key = 'reelayvid-' + creator.attributes.sub + '-' + Date.now();

      // Upload video to S3
      try {
        const response = await fetch(videoSource);
        const blob = await response.blob();
        await Storage.put(videoS3Key, blob, {
          contentType: 'video/mp4',
          progressCallback(progress) {
            console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          }
        }).then(() => {
          console.log("Successfully saved file to S3: " + videoS3Key);
        });
      } catch (error) {
        console.log('Error uploading file: ', error);
      }

      // Create Reelay object
      const reelay = new Reelay({
        movieID: 'Good Will Hunting',
        creatorID: creator.attributes.sub,
        videoS3Key: videoS3Key,
        owner: creator.attributes.sub,
        uploadedAt: new Date().toISOString(),
        visibility: 'global'
      });

      // Upload Reelay object to DynamoDB, get ID
      const savedReelay = await DataStore.save(reelay);
      console.log('Saved new Reelay')
      setVideoSource(false);
      setIsPreview(false);
    }
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.container}
        type={cameraType}
        flashMode={Camera.Constants.FlashMode.on}
        onCameraReady={onCameraReady}
        onMountError={(error) => {
          console.log("camera error", error);
        }}
      />
      <View style={styles.container}>
        {isVideoRecording && renderVideoRecordIndicator()}
        {videoSource && renderVideoPlayer()}
        {isPreview && renderCancelPreviewButton()}
        {!videoSource && !isPreview && renderCaptureControl()}
      </View>
      <View style={styles.container}>
        {overlayVisible && <TagMovieOverlay />}
      </View>
      <TopContainer>
        {!overlayVisible && renderBackButton()}
        {!overlayVisible && <TitleInfo />}
      </TopContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 45,
    left: 15,
    height: closeButtonSize,
    width: closeButtonSize,
    borderRadius: Math.floor(closeButtonSize / 2),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c4c5c4",
    opacity: 0.7,
    zIndex: 2,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  closeCross: {
    width: "68%",
    height: 1,
    backgroundColor: "black",
  },
  control: {
    position: "absolute",
    flexDirection: "row",
    bottom: 38,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: {
    backgroundColor: "#f5f6f5",
    borderRadius: 5,
    height: captureSize,
    width: captureSize,
    borderRadius: Math.floor(captureSize / 2),
    marginHorizontal: 31,
  },
  recordIndicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 25,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
  text: {
    color: "#fff",
  },
  upload: {
    position: "absolute",
    flexDirection: "row",
    top: 45,
    right: 15
  }
});