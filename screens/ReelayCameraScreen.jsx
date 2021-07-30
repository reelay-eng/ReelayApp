import React, { useContext, useEffect, useRef, createRef, useState } from 'react';
import { UploadContext } from '../context/UploadContext';
import { getPosterURI } from '../api/TMDbApi';

import { Camera } from 'expo-camera';
import { Dimensions, View, Text, SafeAreaView, Pressable} from 'react-native';
import { Image } from 'react-native-elements';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../components/utils/BackButton';
import styled from 'styled-components/native';


const { height, width } = Dimensions.get('window');

export default ReelayCameraScreen = ({ navigation }) => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(true);

    const cameraRef = useRef(null);

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
    
    // const onCameraReady = () => {
    //     setIsCameraReady(true);
    // };
    
    const recordVideo = async () => {
        if (cameraRef.current) {
            try {
                console.log('start record async');
                const videoRecordPromise = cameraRef.current.recordAsync();
                if (videoRecordPromise) {
                    console.log('awaiting data');
                    const data = await videoRecordPromise;
                    console.log('finished awaiting data')
                    const source = data.uri;
                    if (source) {
                        uploadContext.setUploadVideoSource(source);
                        console.log('video source', source);    
                    }
                }
            } catch (error) {
                console.warn(error);
            }
        }
    };
    
    const stopVideoRecording = async () => {
        if (cameraRef.current) {
            await cameraRef.current.stopRecording();
            console.log('stop recording complete');            
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

    const RecordInterface = () => {

        const REELAY_DURATION_SECONDS = 15;
        const RECORD_COLOR = '#cb2d26';
        const captureSize = Math.floor(height * 0.07);
        const ringSize = captureSize + 20;    

        const RecordButtonCenter = styled(Pressable)`
            background-color: ${RECORD_COLOR};
            height: ${captureSize}px;
            width: ${captureSize}px;
            border-radius: ${Math.floor(captureSize / 2)}px;
        `
        const RecordContainer = styled(View)`
            position: absolute;
            left: ${(width - ringSize) / 2}px;
            bottom: 80px;
            align-self: center;
        `

        const [isRecording, setIsRecording] = useState(false);

        const onRecordButtonPress = () => {
            if (isRecording) {
                stopVideoRecording();
                setIsRecording(false);
            } else {
                recordVideo();
                setIsRecording(true);
            }
        }

        return (
            <RecordContainer>
                <CountdownCircleTimer 
                    colors={[[RECORD_COLOR]]}
                    duration={REELAY_DURATION_SECONDS} 
                    isPlaying={isRecording} 
                    onComplete={stopVideoRecording}
                    size={ringSize} 
                    strokeWidth={5} 
                    strokeLinecap={'round'}>
                    <RecordButtonCenter activeOpacity={0.7} 
                        // disabled={!isCameraReady} 
                        onPress={onRecordButtonPress} />
                </CountdownCircleTimer>
            </RecordContainer>
        );
    }

    const RecordOverlay = () => {

        const OverlayContainer = styled(View)`
            position: absolute;
            zIndex: 2;
            height: 100%;
            width: 100%;
        `
        const TopLeftContainer = styled(SafeAreaView)`
            position: absolute;
            left: 10px;
            top: 10px;
        `
        const TopRightContainer = styled(SafeAreaView)`
            position: absolute;
            right: 10px;
            top: 10px;
        `
        const posterURI = getPosterURI(titleObject.poster_path);

        return (
            <OverlayContainer>
                <TopLeftContainer>
                    <BackButton navigation={navigation}/>
                </TopLeftContainer>
                <TopRightContainer>
                    <Image source={{uri: posterURI}} 
						style={{ height: 180, width: 120, borderRadius: 8, }} />
                </TopRightContainer>
                <RecordInterface />
            </OverlayContainer>
        );
    }

    

    const ReelayCamera = () => {
        return (
            <Camera
                ref={cameraRef}
                type={cameraType} 
                style={{ height: '100%', width: '100%', position: 'absolute'}}
                flashMode={Camera.Constants.FlashMode.on}
                onMountError={(error) => {
                    console.log("camera error", error);
                }} />
        );
    }

    const CameraContainer = styled(View)`
        position: absolute;
        height: 100%;
        width: 100%;
    `

    return (
        <CameraContainer>
            <ReelayCamera />
            <RecordOverlay />
        </CameraContainer>
    );
}