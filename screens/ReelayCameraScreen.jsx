import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadContext } from '../context/UploadContext';

import { setVideoSource, untagTitle } from '../components/create-reelay/CreateReelaySlice';
import Poster from '../components/view-reelay/Poster';
import RecordButton from '../components/create-reelay/RecordButton';

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

export default ReelayCameraScreen = ({ navigation }) => {

    const uploadContext = useContext(UploadContext);

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
    const RecordingInterfaceContainer = styled(View)`
        flex: 1;
    `
    const TopContainer = styled(View)`
        flex: 1;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-start;
        margin-top: 30px;
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
                        // dispatch(setVideoSource(source));
                        uploadContext.setUploadVideoSource(source);
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
            navigation.push('ReelayUploadScreen');
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
        <View style={ContainerStyles.fillContainer}>
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
                        <Poster titleObject={titleObject} showTitle={true} />
                    </TopContainer>
                    <CaptureControlContainer>
                        <FlipTextContainer disabled={!isCameraReady} onPress={switchCamera}>
                            <FlipText>{'Flip'}</FlipText>
                        </FlipTextContainer>
                        <RecordButton
                            disabled={!isCameraReady}
                            recording={isRecording}
                            onPress={isRecording ? stopVideoRecording : recordVideo}
                            onComplete={stopVideoRecording}
                        />
                    </CaptureControlContainer>
                </RecordingInterfaceContainer>
            </Camera>
        </View>
    );
}