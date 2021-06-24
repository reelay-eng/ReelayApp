import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setVideoSource, untagTitle } from '../components/create-reelay/CreateReelaySlice';
import TitleInfo from '../components/view-reelay/TitleInfo';

import { Camera } from 'expo-camera';
import { CameraStyles, ContainerStyles } from '../styles'
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

export default ReelayCameraScreen = ({ navigation }) => {

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const titleObject = useSelector((state) => state.createReelay.titleObject);

    const cameraRef = useRef();
    const dispatch = useDispatch();

    const CaptureControlContainer = styled(View)`
        flex: 0.1;
        flex-direction: row;
        bottom: 38px;
        width: 100%;
        align-items: center;
        justify-content: center;
    `
    const FlipText = styled(Text)`
        color: white;
    `
    const FlipTextContainer = styled(TouchableOpacity)`
        flex: 0.5;
    `
    const RecordButton = styled(TouchableOpacity)`
        position: absolute;
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
        border-radius: 3px;
        height: 6px;
        width: 6px;
        background-color: #ff0000;
        margin-horizontal: 5px;
    `
    const VideoRecordIndicator = styled(View)`
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        opacity: 0.7;
        bottom: 15px;
    `
    const VideoRecordMessage = styled(Text)`
        flex: 1;    
        flex-wrap: wrap;
        fontSize: 14px;
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
                    setIsRecording(true);
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
            setIsRecording(false);
            navigation.push('ReelayPreviewScreen')
        }
    };
    
    const switchCamera = () => {
        setCameraType((prevCameraType) =>
            prevCameraType === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        );
    };

    return (
        <SafeAreaView style={ContainerStyles.fillContainer}>
            <Camera
                ref={cameraRef}
                style={CameraStyles.camera}
                type={cameraType}
                flashMode={Camera.Constants.FlashMode.on}
                onCameraReady={onCameraReady}
                onMountError={(error) => {
                    console.log("camera error", error);
                }}
            >
                {/* Interface is on top of the camera*/}
                <RecordingInterfaceContainer>
                    <TopContainer>
                        <TitleInfo titleObject={titleObject} />
                    </TopContainer>
                    <CaptureControlContainer>
                        <FlipTextContainer disabled={!isCameraReady} onPress={switchCamera}>
                            <FlipText>{'Flip'}</FlipText>
                        </FlipTextContainer>
                        <RecordButton
                            activeOpacity={0.7}
                            disabled={!isCameraReady}
                            onPress={isRecording ? stopVideoRecording : recordVideo}
                        />
                    </CaptureControlContainer>
                    {isRecording && 
                            <VideoRecordIndicator>
                                <VideoRecordDot />
                                <VideoRecordMessage>{'Recording...'}</VideoRecordMessage>
                            </VideoRecordIndicator>
                        }
                </RecordingInterfaceContainer>
            </Camera>
        </SafeAreaView>
    );
}