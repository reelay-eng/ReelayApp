import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { Camera } from 'expo-camera';
import { Dimensions, View, SafeAreaView, Pressable} from 'react-native';
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../../components/utils/BackButton';
import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import TitleBanner from '../../components/feed/TitleBanner';
import ReelayFeedHeader from '../../components/feed/ReelayFeedHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');
const CAPTURE_SIZE = Math.floor(height * 0.07);
const RECORD_COLOR = '#cb2d26';  
const RING_SIZE = CAPTURE_SIZE + 20;

const CameraContainer = styled(Pressable)`
    height: 100%;
    position: absolute;
    width: 100%;
`
const FlipCameraButtonContainer = styled(Pressable)`
    align-self: center;
    bottom: ${0.25 * RING_SIZE}px;
    left: ${width / 2 - RING_SIZE}px;
    position: absolute;
`
const IconContainer = styled(Pressable)`
    height: 36px;
    width: 36px;
`
const MediaLibraryContainer = styled(SafeAreaView)`
    bottom: ${0.25 * RING_SIZE}px;
    position: absolute;
    left: ${-1 * RING_SIZE}px;
` 
const OverlayContainer = styled(View)`
    position: absolute;
    zIndex: 2;
    height: 100%;
    width: 100%;
`
const RecordButtonCenter = styled(Pressable)`
    background-color: ${RECORD_COLOR};
    border-radius: ${Math.floor(CAPTURE_SIZE / 2)}px;
    height: ${CAPTURE_SIZE}px;
    width: ${CAPTURE_SIZE}px;
`
const RecordContainer = styled(SafeAreaView)`
    align-self: center;
    bottom: 80px;
    left: ${(width - RING_SIZE) / 2}px;
    position: absolute;
`
const TitleBannerContainer = styled(View)`
    position: absolute;
    top: ${props => props.topOffset + 36}px;
`

export default ReelayCameraScreen = ({ navigation, route }) => {
    const { reelayDBUser} = useContext(AuthContext);
    const { titleObj, venue } = route.params;

    const topicID = route.params?.topicID ?? null;
    const clubID = route.params?.clubID ?? null;

    const cameraRef = useRef(null);
    const intervalIDRef = useRef(null);
    const recordingLength = useRef(0);
    const topOffset = useSafeAreaInsets().top;

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [retakeCounter, setRetakeCounter] = useState(0);

    const MAX_VIDEO_DURATION_SEC = topicID ? 60 : 30;
    const MAX_VIDEO_DURATION_MILLIS = 1000 * MAX_VIDEO_DURATION_SEC;

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
                    const maxDurationMessage = `Ruh roh! You can only upload ${MAX_VIDEO_DURATION_SEC} second videos or shorter`
                    showErrorToast(maxDurationMessage);
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

    const RecordButton = ({ isRecording, setIsRecording }) => {
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
                    activateKeepAwake();
                    const videoRecording = await cameraRef.current.recordAsync({
                        codec: Camera.Constants.VideoCodec.H264,
                    });
                    deactivateKeepAwake();
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
                size={RING_SIZE} 
                strokeWidth={5} 
                trailColor='transparent'
                strokeLinecap={'round'}
                onComplete={() => {
                    stopVideoRecording();
                    setIsRecording(false);
                }}>
                <RecordButtonCenter activeOpacity={0.7} onPress={onRecordButtonPress} />
            </CountdownCircleTimer>
        )
    }

    const FlipCameraButton = () => {
        return (
            <FlipCameraButtonContainer onPress={flipCamera}>
                <Icon type='ionicon' name='sync-outline' color={'white'} size={36} />
            </FlipCameraButtonContainer>
        );
    }

    const RecordInterface = () => {
        const [isRecording, setIsRecording] = useState(false);

        return (
            <RecordContainer>
                { !isRecording && <MediaLibraryPicker /> }
                <RecordButton isRecording={isRecording} setIsRecording={setIsRecording} />
                { !isRecording && <FlipCameraButton /> }
            </RecordContainer>
        );
    }

    const RecordOverlay = () => {
        return (
            <OverlayContainer>
                <ReelayFeedHeader navigation={navigation} feedSource={'camera'} />
                <TitleBannerContainer topOffset={topOffset}>
                    <TitleBanner titleObj={titleObj} onCameraScreen={true} venue={venue} />
                </TitleBannerContainer>
                <RecordInterface />
            </OverlayContainer>
        );
    }

    const ReelayCamera = () => {
        const cameraStyle = { height: '100%', width: '100%', position: 'absolute' };
        const flashMode = Camera.Constants.FlashMode.auto;
        const onMountError = (error) => console.log("camera error", error);
        const whiteBalance = Camera.Constants.WhiteBalance.auto;

        try {
            return (
                <Camera 
                    flashMode={flashMode} 
                    onMountError={onMountError} 
                    ref={cameraRef}
                    style={cameraStyle} 
                    type={cameraType} 
                    whiteBalance={whiteBalance} 
                />
            ); 
        } catch (error) {
            console.log(error);
            return <View />;
        } 
    }

    let tapCount = 0;
    const resetDoubleTap = () => tapCount = 0;

    const flipCamera = () => {
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
            setTimeout(resetDoubleTap, 500);
        }
    }

    return (
        <CameraContainer onPress={handleDoubleTap}>
            <ReelayCamera />
            <RecordOverlay />
        </CameraContainer>
    );
}