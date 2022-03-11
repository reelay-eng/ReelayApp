import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { Camera } from 'expo-camera';
import { Dimensions, View, SafeAreaView, Pressable} from 'react-native';
import { Image, Icon } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import BackButton from '../../components/utils/BackButton';
import { VenueIcon } from '../../components/utils/VenueIcon';
import styled from 'styled-components/native';
import { showErrorToast } from '../../components/utils/toasts';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

const { height, width } = Dimensions.get('window');
const captureSize = Math.floor(height * 0.07);
const ringSize = captureSize + 20;    

export default ReelayCameraScreen = ({ navigation, route }) => {
    var backCount = 0;
    var backTimer = 0;
    const { reelayDBUser} = useContext(AuthContext);
    const { titleObj, venue } = route.params;

    const cameraRef = useRef(null);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
    const [retakeCounter, setRetakeCounter] = useState(0);

    const pushToUploadScreen = async (videoURI) => {
        if (!videoURI) {
            showErrorToast('Oops! Source file for video not found.');
            return;
        }

        navigation.push('ReelayUploadScreen', {
            titleObj: titleObj,
            videoURI: videoURI,
            venue: venue,
        });

        // setting this prematurely when we advance to the upload screen,
        // not when we return from it via the Retake button
        setRetakeCounter(retakeCounter + 1);
    }
    
    const recordVideo = async () => {
        if (cameraRef.current) {
            try {
                const videoRecording = await cameraRef.current.recordAsync();
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

    const flipCamera = () => {
        setCameraType((prevCameraType) =>
            prevCameraType === Camera.Constants.Type.back
            ? Camera.Constants.Type.front
            : Camera.Constants.Type.back
        );
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

        useEffect(() => {
            if (isRecording) {
                recordVideo();
            }
        }, [isRecording]);

        const onRecordButtonPress = () => {
            if (isRecording) {
                stopVideoRecording();
            } else {
                setIsRecording(true);
            }
        }

        const stopVideoRecording = async () => {
            setIsRecording(false);
            if (cameraRef.current) {
                await cameraRef.current.stopRecording();
                console.log('stop recording complete');            
            }
        };    

        // https://github.com/vydimitrov/react-countdown-circle-timer
        
        return (
            <CountdownCircleTimer 
                colors={[[RECORD_COLOR]]}
                duration={REELAY_DURATION_SECONDS} 
                isPlaying={isRecording} 
                key={retakeCounter} // this resets the timer on a retake
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
        const posterStyle = {
            borderRadius: 8, 
            height: 120, 
            width: 80, 
        }

        return (
            <OverlayContainer>
                <TopLeftContainer>
                    <BackButton navigation={navigation}/>
                </TopLeftContainer>
                <TopRightContainer>
                    <Image source={titleObj.posterSource} style={posterStyle} />
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
                flashMode={Camera.Constants.FlashMode.off}
                onMountError={(error) => {
                    console.log("camera error", error);
                }}
                whiteBalance={Camera.Constants.WhiteBalance.auto} 
            />
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
                <VenueIcon venue={venue} size={24} border={2} />
            </UnderPosterContainer>
        );
    }

    const CameraContainer = styled(Pressable)`
        position: absolute;
        height: 100%;
        width: 100%;
    `

    return (
        <CameraContainer onPress={() => {
            backCount++
            if (backCount == 2) {
                backTimer=0;
                flipCamera();
            } else {
                backTimer = setTimeout(() => {
                    backCount = 0
                }, 500)
            }
        }}>
            <ReelayCamera />
            <RecordOverlay />
        </CameraContainer>
    );
}