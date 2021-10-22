import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UploadContext } from '../../context/UploadContext';
import { getPosterURL } from '../../api/TMDbApi';

import { Camera } from 'expo-camera';
import { Dimensions, View, Text, SafeAreaView, Pressable} from 'react-native';
import { Image, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../../components/utils/BackButton';
import { VenueIcon } from '../../components/utils/VenueIcon';
import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';

import * as Amplitude from 'expo-analytics-amplitude';

const { height, width } = Dimensions.get('window');
const captureSize = Math.floor(height * 0.07);
const ringSize = captureSize + 20;    

export default ReelayCameraScreen = ({ navigation, route }) => {

    const { user } = useContext(AuthContext);
    const { 
        setUploadErrorStatus,
        setUploadVideoSource,
        uploading,
        uploadTitleObject,
        venueSelected,
    } = useContext(UploadContext);

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

    const pushToUploadScreen = async (videoURI) => {
        if (!videoURI) {
            showErrorToast('Oops! Source file for video not found.');
            return;
        }

        setUploadVideoSource(videoURI);
        setUploadErrorStatus(false);
        console.log('video source', videoURI);    
        navigation.push('ReelayUploadScreen');    
    }
    
    const recordVideo = async () => {
        if (cameraRef.current) {
            try {
                console.log('start record async');
                const videoRecordPromise = cameraRef.current.recordAsync();
                if (videoRecordPromise) {
                    const data = await videoRecordPromise;
                    const source = data.uri;
                    pushToUploadScreen(source);

                    // const titleObject = uploadContext.uploadTitleObject;
                    Amplitude.logEventWithPropertiesAsync('videoRecorded', {
                        username: user.username,
                        title: uploadTitleObject.title ? uploadTitleObject.title : uploadTitleObject.name,
                    })
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
    

    const MediaLibraryPicker = () => {

        // these positions are eyeballed
        const MediaLibraryContainer = styled(SafeAreaView)`
            position: absolute;
            left: ${-1 * ringSize}px;
            bottom: ${0.25 * ringSize}px;
        ` 
        const IconContainer = styled(Pressable)`
            height: 36px;
            width: 36px;
        `

        const onPress = async () => {
            let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log(status);

            if (status === 'granted') {
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
                pushToUploadScreen(source);
            } else {
                showErrorToast('Sorry, we need camera roll permissions to make this work');
            }
        }

        return (
            <MediaLibraryContainer>
                <IconContainer onPress={onPress}>
                    <Icon type='ionicon' name='images' color={'white'} size={36} />
                </IconContainer>
            </MediaLibraryContainer>
        );
    }

    const RecordButton = () => {

        const RECORD_COLOR = '#cb2d26';
        const REELAY_DURATION_SECONDS = 15;

        const [isRecording, setIsRecording] = useState(false);

        const RecordButtonCenter = styled(Pressable)`
            background-color: ${RECORD_COLOR};
            height: ${captureSize}px;
            width: ${captureSize}px;
            border-radius: ${Math.floor(captureSize / 2)}px;
        `

        const onRecordButtonPress = () => {
            if (isRecording) {
                stopVideoRecording();
            } else {
                recordVideo();
                setIsRecording(true);
            }
        }
        
        return (
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
                <RecordButtonCenter activeOpacity={0.7} onPress={onRecordButtonPress} />
            </CountdownCircleTimer>
        )

    }

    const FlipCameraButton = () => {
        const FlipCameraButtonContainer = styled(Pressable)`
            position: absolute;
            left: ${width / 2 - ringSize}px;
            bottom: ${0.25 * ringSize}px;
            align-self: center;
        `

        const flipCamera = () => {
            setCameraType((prevCameraType) =>
                prevCameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
        };

        return (
            <FlipCameraButtonContainer onPress={flipCamera}>
                <Icon type='ionicon' name='sync-outline' color={'white'} size={36} />
            </FlipCameraButtonContainer>
        );
    }

    const RecordInterface = () => {

        const RecordContainer = styled(SafeAreaView)`
            position: absolute;
            left: ${(width - ringSize) / 2}px;
            bottom: 80px;
            align-self: center;
        `

        return (
            <RecordContainer>
                <MediaLibraryPicker />
                <RecordButton />
                <FlipCameraButton />
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

        const posterURI = getPosterURL(uploadTitleObject.poster_path);

        return (
            <OverlayContainer>
                <TopLeftContainer>
                    <BackButton navigation={navigation}/>
                </TopLeftContainer>
                <TopRightContainer>
                    <Image source={{uri: posterURI}} 
						style={{ height: 180, width: 120, borderRadius: 8, }} />
                    <VenueIndicator />
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

    const VenueIndicator = () => {
        const UnderPosterContainer = styled(View)`
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 10px;
        `
        return (
            <UnderPosterContainer>
                <VenueIcon venue={venueSelected} size={24} border={2} />
            </UnderPosterContainer>
        );
    }

    const CameraContainer = styled(View)`
        position: absolute;
        height: 100%;
        width: 100%;
    `

    return (
        <CameraContainer>
            { !uploading && <ReelayCamera /> }
            { !uploading && <RecordOverlay /> }
        </CameraContainer>
    );
}