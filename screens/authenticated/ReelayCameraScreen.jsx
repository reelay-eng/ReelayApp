import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { Camera } from 'expo-camera';
import { Dimensions, View, SafeAreaView, Pressable, TouchableOpacity} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import TitleBanner from '../../components/feed/TitleBanner';
import ReelayFeedHeader from '../../components/feed/ReelayFeedHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCameraRotate, faPhotoVideo, faStop } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { animate } from '../../hooks/animations';

const { height, width } = Dimensions.get('window');
const CAPTURE_SIZE = Math.floor(height * 0.07);

const MEDIA_FLIP_ICON_SIZE = 36;
const RING_ROTATE_INTERVAL_MS = 6000;

const CameraContainer = styled(Pressable)`
    height: 100%;
    position: absolute;
    width: 100%;
`
const FlipCameraButtonContainer = styled(TouchableOpacity)`
    bottom: 100px;
    position: absolute;
    left: ${width / 2 + 80}px;
`
const MediaLibraryContainer = styled(View)`
    bottom: 100px;
    position: absolute;
    left: ${width / 2 - MEDIA_FLIP_ICON_SIZE - 80}px;
` 
const OverlayContainer = styled(View)`
    position: absolute;
    zIndex: 2;
    height: 100%;
    width: 100%;
`
const RecordButtonFadeCircle = styled(View)`
    bottom: -18px;
    background-color: white;
    border-radius: ${CAPTURE_SIZE}px;
    height: ${CAPTURE_SIZE + 12}px;
    justify-content: center;
    left: -18px;
    opacity: 0.5;
    position: absolute;
    width: ${CAPTURE_SIZE + 12}px;
`
const RecordButtonOuterCircle = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: ${Math.floor(CAPTURE_SIZE / 2)}px;
    height: ${CAPTURE_SIZE}px;
    justify-content: center;
    width: ${CAPTURE_SIZE}px;
`
const RecordButtonOuterRing = styled(LinearGradient)`
    bottom: 84px;
    background-color: white;
    border-radius: ${CAPTURE_SIZE}px;
    height: ${CAPTURE_SIZE + 12}px;
    justify-content: center;
    left: ${(width - CAPTURE_SIZE) / 2 - 6}px;
    position: absolute;
    width: ${CAPTURE_SIZE + 12}px;
`
const RecordButtonContainer = styled(SafeAreaView)`
    bottom: 90px;
    left: ${(width - CAPTURE_SIZE) / 2}px;
    position: absolute;
`
const RecordView = styled(View)`
    height: 100%;
    width: 100%;
    position: absolute;
`
const RecordProgressMaxView = styled(View)`
    background-color: #555555;
    height: 4px;
    position: absolute;
    top: ${props => props.topOffset + 46}px;
    width: 100%;
`
const RecordProgressCurrentView = styled(View)`
    background-color: white;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    height: 4px;
    position: absolute;
    top: ${props => props.topOffset + 46}px;
    width: ${props => props.progressRatio * width}px;
`
const TitleBannerContainer = styled(View)`
    position: absolute;
    top: ${props => props.topOffset + 36}px;
`

export default ReelayCameraScreen = ({ navigation, route }) => {
    const { reelayDBUser} = useContext(AuthContext);
    const { titleObj, venue } = route.params;

    console.log('venue: ', venue);

    const topicID = route.params?.topicID ?? null;
    const clubID = route.params?.clubID ?? null;
    const draftGame = route?.params?.draftGame ?? null;

    const cameraRef = useRef(null);
    const topOffset = useSafeAreaInsets().top;

    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [retakeCounter, setRetakeCounter] = useState(0);

    const canUploadLongAssVideos = ['admin', 'supercreator'].includes(reelayDBUser?.role);

    const MAX_MEDIA_VIDEO_DURATION_SEC = (canUploadLongAssVideos) ? 180 : 60;
    const MAX_MEDIA_VIDEO_DURATION_MILLIS = 1000 * MAX_MEDIA_VIDEO_DURATION_SEC;

    const MAX_CAMERA_VIDEO_DURATION_SEC = topicID ? 60 : 30;
    const MAX_CAMERA_VIDEO_DURATION_MILLIS = 1000 * MAX_CAMERA_VIDEO_DURATION_SEC;

    const pushToUploadScreen = async (videoURI) => {
        if (!videoURI) {
            showErrorToast('Oops! Source file for video not found.');
            return;
        }

        navigation.push('ReelayUploadScreen', { 
            clubID,
            draftGame,
            titleObj, 
            topicID, 
            venue,
            videoURI, 
        });

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
                if (selectedVideo.duration > MAX_MEDIA_VIDEO_DURATION_MILLIS) {
                    const maxDurationMessage = `Ruh roh! You can only upload ${MAX_MEDIA_VIDEO_DURATION_SEC} second videos or shorter from media`
                    showErrorToast(maxDurationMessage);
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
                <TouchableOpacity onPress={onPress}>
                    <FontAwesomeIcon icon={faPhotoVideo} color='white' size={MEDIA_FLIP_ICON_SIZE} />
                </TouchableOpacity>
            </MediaLibraryContainer>
        );
    }

    const RecordButton = ({ isRecording, setIsRecording }) => {
        const recordStartMoment = useRef(moment());

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
                    // activateKeepAwake();
                    const videoRecording = await cameraRef.current.recordAsync({
                        codec: Camera.Constants.VideoCodec.H264,
                    });
                    // deactivateKeepAwake();
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
            recordStartMoment.current = moment();
        }

        const stopVideoRecording = async () => {
            if (cameraRef.current) {
                await cameraRef.current.stopRecording();
                console.log('stop recording complete');            
            }
        };  
        
        const RecordProgress = () => {    
            const [forceRender, setForceRender] = useState(0);
            const intervalIDRef = useRef(null);
            const updateCounter = useRef(0);
            
            const renderMoment = moment();
            const timeSinceStarted = renderMoment.diff(recordStartMoment.current, 'ms');
            const progressRatio = timeSinceStarted / MAX_CAMERA_VIDEO_DURATION_MILLIS;

            const rotationInRadians = (timeSinceStarted * 2 * Math.PI / RING_ROTATE_INTERVAL_MS);
            const outerRingXStart = (Math.cos(rotationInRadians) + 1) / 2;
            const outerRingYStart = (Math.sin(rotationInRadians) + 1) / 2;
            const outerRingXEnd = 1 - outerRingXStart;
            const outerRingYEnd = 1 - outerRingYStart;

            if (progressRatio >= 1.0) {
                stopVideoRecording();
                setIsRecording(false);
            }
                
            useEffect(() => {
                if (isRecording) {
                    intervalIDRef.current = setInterval(() => {
                        updateCounter.current+= 1;
                        setForceRender(updateCounter.current);
                    }, 25);        
                } else {
                    clearInterval(intervalIDRef?.current);
                }
            }, [isRecording]);

            return (
                <Fragment>
                    <RecordProgressCurrentView progressRatio={progressRatio} topOffset={topOffset} />
                    <RecordButtonOuterRing 
                        colors={['#0789FD', '#FF4848']} 
                        start={{ x: outerRingXStart, y: outerRingYStart }}
                        end={{ x: outerRingXEnd, y: outerRingYEnd }}
                    />
                </Fragment>
            )
        }
        
        return (
            <Fragment>
                <RecordProgressMaxView topOffset={topOffset} />
                <RecordProgress />
                <RecordButtonContainer>
                    <RecordButtonOuterCircle activeOpacity={0.7} onPress={onRecordButtonPress}>
                        { isRecording && <FontAwesomeIcon icon={faStop} size={24} color='black' /> }
                    </RecordButtonOuterCircle>
                </RecordButtonContainer>
            </Fragment>
        )
    }

    const FlipCameraButton = () => {
        return (
            <FlipCameraButtonContainer onPress={flipCamera}>
                <FontAwesomeIcon icon={faCameraRotate} color='white' size={MEDIA_FLIP_ICON_SIZE} />
            </FlipCameraButtonContainer>
        );
    }

    const RecordInterface = () => {
        const [isRecording, setIsRecording] = useState(false);
        const begunCameraRecording = useRef(false);
        const showControls = (!isRecording && !begunCameraRecording.current);

        useEffect(() => {
            if (isRecording) begunCameraRecording.current = true;
        }, [isRecording]);

        return (
            <RecordView>
                { showControls && <FlipCameraButton /> }
                <RecordButton isRecording={isRecording} setIsRecording={setIsRecording} />
                { showControls && <MediaLibraryPicker /> }
            </RecordView>
        );
    }

    const RecordOverlay = () => {
        return (
            <OverlayContainer>
                <RecordInterface />
                <ReelayFeedHeader navigation={navigation} feedSource={'camera'} />
                {(!!titleObj?.id) && (
                    <TitleBannerContainer topOffset={topOffset}>
                        <TitleBanner titleObj={titleObj} onCameraScreen={true} venue={venue} />
                    </TitleBannerContainer>
                )}
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

    useEffect(() => {
        activateKeepAwake();
        return () => deactivateKeepAwake();
    }, []);

    return (
        <CameraContainer onPress={handleDoubleTap}>
            <ReelayCamera />
            <RecordOverlay />
        </CameraContainer>
    );
}