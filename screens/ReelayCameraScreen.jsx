import React, { useContext, useEffect, useRef, createRef, useState } from 'react';
import { UploadContext } from '../context/UploadContext';
import { getPosterURI } from '../api/TMDbApi';

import { Camera } from 'expo-camera';
import { Dimensions, View, Text, SafeAreaView, Pressable} from 'react-native';
import { Image, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../components/utils/BackButton';
import styled from 'styled-components/native';
import { showErrorToast, showMessageToast } from '../components/utils/toasts';


const { height, width } = Dimensions.get('window');

export default ReelayCameraScreen = ({ navigation }) => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);

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
    
    const recordVideo = async () => {
        if (cameraRef.current) {
            try {
                console.log('start record async');
                const videoRecordPromise = cameraRef.current.recordAsync();
                if (videoRecordPromise) {
                    const data = await videoRecordPromise;
                    const source = data.uri;
                    if (source) {
                        uploadContext.setUploadVideoSource(source);
                        uploadContext.setUploadErrorStatus(false);
                        console.log('video source', source);    
                        navigation.push('ReelayUploadScreen');    
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
        }
    };
    
    const switchCamera = () => {
        setCameraType((prevCameraType) =>
            prevCameraType === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        );
    };

    const MediaLibraryPicker = () => {

        const IconContainer = styled(Pressable)`
            height: 36px;
            width: 36px;
        `

        const onPress = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                const selectedVideo = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                    quality: 1,
                });
                if (!selectedVideo || !selectedVideo.uri || selectedVideo.cancelled) return;
                if (selectedVideo.duration > 15000) { // in milliseconds
                    showErrorToast('You can only upload 15 second videos or shorter');
                    return;
                }

                const source = selectedVideo.uri; // note: on android, this uri is read-only    
                console.log('source: ', source);
                console.log('duration :', selectedVideo.duration);
    
                uploadContext.setUploadVideoSource(source);
                uploadContext.setUploadErrorStatus(false);
                console.log('video source', source);    
                navigation.push('ReelayUploadScreen');      

            } else {
                showErrorToast('Sorry, we need camera roll permissions to make this work');
            }
        }

        return (
            <IconContainer onPress={onPress}>
                <Icon type='ionicon' name='images' color={'white'} size={36} />
            </IconContainer>
        );

    }

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
                // setIsRecording(false);
            } else {
                recordVideo();
                setIsRecording(true);
            }
        }

        // these positions are eyeballed
        const MediaLibraryContainer = styled(SafeAreaView)`
            position: absolute;
            left: ${-1 * ringSize}px;
            bottom: ${0.25 * ringSize}px;
        `

        return (
            <RecordContainer>
                <CountdownCircleTimer 
                    colors={[[RECORD_COLOR]]}
                    duration={REELAY_DURATION_SECONDS} 
                    isPlaying={isRecording} 
                    size={ringSize} 
                    strokeWidth={5} 
                    trailColor='transparent'
                    strokeLinecap={'round'}
                    onComplete={() => {
                        stopVideoRecording();
                    }}>
                    <RecordButtonCenter 
                        activeOpacity={0.7} 
                        onPress={onRecordButtonPress} 
                    />
                </CountdownCircleTimer>
                <MediaLibraryContainer>
                { !isRecording && <MediaLibraryPicker /> }
                </MediaLibraryContainer>
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