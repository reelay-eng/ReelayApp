import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStage, setVideoSource, untagTitle } from './CreateReelaySlice';

import { Camera } from 'expo-camera';
import TitleInfo from './TitleInfo';
import styled from 'styled-components/native';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

const WINDOW_HEIGHT = Dimensions.get("window").height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.032);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);

export default ReelayCamera = ({ navigation }) => {

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const cameraRef = useRef();
    const creationStage = useSelector((state) => state.createReelay.creationStage);
    const videoSource = useSelector((state) => state.createReelay.videoSource);

    const dispatch = useDispatch();

    const CaptureControlContainer = styled(View)`
        flex: 1;
        flex-direction: row;
        bottom: 38px;
        width: 100%;
        align-items: center;
        justify-content: center;
    `
    const FlipText = styled(Text)`
    `
    const RecordButton = styled(TouchableOpacity)`
        background-color: #f5f6f5;
        height: ${captureSize}px;
        width: ${captureSize}px;
        border-radius: ${Math.floor(captureSize / 2)}px;
        margin-horizontal: 31px;
    `
    const RecordingInterfaceContainer = styled(View)`
        flex: 1;
    `
    const TopContainer = styled(View)`
        flex: 1;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
    `  
    const VideoRecordDot = styled(View)`
        border-radius: 3;
        height: 6px;
        width: 6px;
        background-color: #ff0000;
        margin-horizontal: 5px;
    `
    const VideoRecordIndicator = styled(View)`
        flex-direction: row;
        top-margin: 25px;
        align-self: center;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        opacity: 0.7;
    `
    const VideoRecordMessage = styled(View)`
        fontSize: 14;
        color: #ffffff;
        textAlign: center;
    `


    // todo: move to styled-components
    const styles = StyleSheet.create({
        camera: {
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        },
    });

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

    // handle permission denied cases
    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text style={styles.text}>No access to camera</Text>;
    }
    
    const onCameraReady = () => {
        setIsCameraReady(true);
    };
    
    const recordVideo = async () => {
        if (cameraRef.current) {
            try {
                const videoRecordPromise = cameraRef.current.recordAsync();
                if (videoRecordPromise) {
                    dispatch(setStage('RECORDING'));
                    const data = await videoRecordPromise;
                    const source = data.uri;
                    if (source) {
                        console.log("video source", source);
                        dispatch(setVideoSource(source));
                    }
                }
            } catch (error) {
                console.warn(error);
            }
        }
    };
    
    const stopVideoRecording = () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
            dispatch(setStage('REVIEWING'));
        }
    };
    
    const switchCamera = () => {
        setCameraType((prevCameraType) =>
            prevCameraType === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        );
    };

    return(
        <SafeAreaView>
            <Camera
                ref={cameraRef}
                style={styles.camera}
                type={cameraType}
                flashMode={Camera.Constants.FlashMode.on}
                onCameraReady={onCameraReady}
                onMountError={(error) => {
                    console.log("camera error", error);
                }}
            />
            <RecordingInterfaceContainer>
                <TopContainer>
                    <TitleInfo />
                </TopContainer>
                {creationStage == 'RECORDING' && 
                    <VideoRecordIndicator>
                        <VideoRecordDot />
                        <VideoRecordMessage>{'Recording...'}</VideoRecordMessage>
                    </VideoRecordIndicator>
                }
                <CaptureControlContainer>
                    <TouchableOpacity disabled={!isCameraReady} onPress={switchCamera}>
                        <FlipText>{'Flip'}</FlipText>
                    </TouchableOpacity>
                    <RecordButton
                        activeOpacity={0.7}
                        disabled={!isCameraReady}
                        onLongPress={recordVideo}
                        onPressOut={stopVideoRecording}
                        onPress={creationStage == 'RECORDING' ? recordVideo : stopVideoRecording}
                    />
                </CaptureControlContainer>
            </RecordingInterfaceContainer>
        </SafeAreaView>
    );
}