import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';

import { Camera, CameraRecordingOptions } from 'expo-camera';
import { Dimensions, View, SafeAreaView, Pressable} from 'react-native';
import { Image, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../../components/utils/BackButton';
import { VenueIcon } from '../../components/utils/VenueIcon';
import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import TitlePoster from '../../components/global/TitlePoster';

const { height, width } = Dimensions.get('window');
const captureSize = Math.floor(height * 0.07);
const ringSize = captureSize + 20;

const MAX_VIDEO_DURATION_SEC = 60;
const MAX_VIDEO_DURATION_MILLIS = 1000 * MAX_VIDEO_DURATION_SEC;

export default ReelayCameraScreen = ({ navigation, route }) => {
    const { reelayDBUser} = useContext(AuthContext);
    const { titleObj, venue } = route.params;

    const topicID = route.params?.topicID ?? null;
    const clubID = route.params?.clubID ?? null;

    const cameraRef = useRef(null);
    const intervalIDRef = useRef(null);
    const recordingLength = useRef(0);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [retakeCounter, setRetakeCounter] = useState(0);

    const pushToUploadScreen = async (videoURI) => {
        if (!videoURI) {
            showErrorToast('Oops! Source file for video not found.');
            return;
        }

        clearInterval(intervalIDRef?.current);

        const recordingLengthSeconds = recordingLength.current;
        navigation.push('ReelayUploadScreen', { 
            titleObj, 
            recordingLengthSeconds,
            videoURI, 
            venue,
            clubID,
            topicID, 
        });
        recordingLength.current = 0;

        // setting this prematurely when we advance to the upload screen,
        // not when we return from it via the Retake button
        setRetakeCounter(retakeCounter + 1);
    }
    
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
                if (selectedVideo.duration > MAX_VIDEO_DURATION_MILLIS) {
                    showErrorToast('You can only upload 15 second videos or shorter');
                    return;
                }

                recordingLength.current = selectedVideo.duration;
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
                setIsRecording(false);
            } else {
                recordVideo();
                setIsRecording(true);
            }
        }

        const recordVideo = async () => {
            if (cameraRef.current) {
                try {
                    startCameraTimer();
                    const videoRecording = await cameraRef.current.recordAsync({
                        // quality: Camera.Constants.VideoQuality['1080p'],
                        codec: Camera.Constants.VideoCodec.H264,
                    });
                    clearInterval(intervalIDRef?.current);
                    console.log('video recording complete');
                    if (videoRecording?.uri) {
                        pushToUploadScreen(videoRecording.uri);
                        logAmplitudeEventProd('videoRecorded', {
                            username: reelayDBUser?.username,
                            title: titleObj.display,
                        })
                        
                    }
                } catch (error) {
                    console.warn(error);
                }
            }
        };    

        const startCameraTimer = () => {
            // note: this is just use to detect how long the video is
            // it does not perform the cutoff
            intervalIDRef.current = setInterval(() => {
                recordingLength.current = recordingLength.current + 1;
            }, 1000);

        }

        const stopVideoRecording = async () => {
            if (cameraRef.current) {
                await cameraRef.current.stopRecording();
                console.log('stop recording complete');            
            }
        };    

        // https://github.com/vydimitrov/react-countdown-circle-timer
        
        return (
            <CountdownCircleTimer 
                colors={[[RECORD_COLOR]]}
                duration={MAX_VIDEO_DURATION_SEC} 
                isPlaying={isRecording} 
                key={retakeCounter} // this resets the timer on a retake
                size={ringSize} 
                strokeWidth={5} 
                trailColor='transparent'
                strokeLinecap={'round'}
                onComplete={() => setIsRecording(false)}>
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

        return (
            <OverlayContainer>
                <TopLeftContainer>
                    <BackButton navigation={navigation}/>
                </TopLeftContainer>
                <TopRightContainer>
                    <TitlePoster title={titleObj} width={80} />
                    <VenueIndicator />
                </TopRightContainer>
                <RecordInterface />
            </OverlayContainer>
        );
    }

    const ReelayCamera = () => {
        try {
            return (
                <Camera
                    ref={cameraRef}
                    type={cameraType} 
                    style={{ height: '100%', width: '100%', position: 'absolute'}}
                    flashMode={Camera.Constants.FlashMode.auto}
                    onMountError={(error) => {
                        console.log("camera error", error);
                    }}
                    whiteBalance={Camera.Constants.WhiteBalance.auto} 
                />
            );    
        } catch (error) {
            console.log(error);
            return <View />;
        } 
    }

    const VenueIndicator = () => {
        const UnderPosterContainer = styled(View)`
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 10px;
        `
        return (
            <UnderPosterContainer>
                <VenueIcon venue={venue} size={24} border={2} />
            </UnderPosterContainer>
        );
    }

    const CameraContainer = styled(Pressable)`
        position: absolute;
        height: 100%;
        width: 100%;
    `

    let tapCount = 0;
    let tapTimer = 0;
    const resetDoubleTap = () => tapCount = 0;

    const flipCamera = () => {
        tapTimer = 0;
        const getNextCameraType = (prevCameraType) => {
            return (prevCameraType === Camera.Constants.Type.back)
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back;
        }
        setCameraType(getNextCameraType);
    };

    const handleDoubleTap = () => {
        tapCount++;
        if (tapCount % 2 === 0) {
            flipCamera(); 
        } else {
            tapTimer = setTimeout(resetDoubleTap, 500);
        }
    }

    return (
        <CameraContainer onPress={handleDoubleTap}>
            <ReelayCamera />
            <RecordOverlay />
        </CameraContainer>
    );
}