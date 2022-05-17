import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';  
import Constants from 'expo-constants';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';
import TitlePoster from '../../components/global/TitlePoster';

import { Pressable, View, Keyboard, KeyboardAvoidingView, ActivityIndicator, Dimensions } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import DownloadButton from '../../components/create-reelay/DownloadButton';
import UploadDescriptionAndStarRating from '../../components/create-reelay/UploadDescriptionAndStarRating';
import { useFocusEffect } from '@react-navigation/native';

const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;
const { width } = Dimensions.get('window');

const BackButtonContainer = styled(Pressable)`
    margin-top: 40px;
    margin-right: 20px;
`
const HeaderContainer = styled(View)`
    align-items: flex-start;
    flex-direction: row;
    padding: 20px;
    width: ${width}px;
`
const PatientContainer = styled(View)`
    background-color: rgba(0,0,0,0.35);
    border-radius: 16px;
    margin: 10px;
    margin-bottom: 0px;
    padding: 12px;
`
const PatientText = styled(ReelayText.Subtitle1)`
    color: white;
`
const TitlePosterContainer = styled(View)`
    position: absolute;
    top: 40px;
    right: 20px;
`
const UploadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 140px;
    bottom: 10px;
    right: 12px;
`
const UploadButtonText = styled(ReelayText.H6Emphasized)`
    color: ${props => props.buttonTextColor};
    font-size: 16px;
    text-align: center;
`
const UploadBottomArea = styled(Pressable)`
    justify-content: flex-end;
`
const UploadBottomBar = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 40px;
    margin-left: 2px;
    margin-right: 2px;
`
const UploadScreenContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`

export default ReelayUploadScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const { recordingLengthSeconds, titleObj, videoURI, venue } = route.params;
    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);
    const [previewIsMuted, setPreviewIsMuted] = useState(false);
 
    const descriptionRef = useRef('');
    const starCountRef = useRef(0);

    const topicID = route.params?.topicID;
    const globalTopics = useSelector(state => state.globalTopics);
    const reelayTopic = topicID ? globalTopics.find(nextTopic => nextTopic.id === topicID) : null;
    const pleaseBePatientShouldDisplay = (recordingLengthSeconds > 15);

    const uploadStage = useSelector(state => state.uploadStage);
    const uploadStartedStages = ['upload-reelay', 'preparing-upload', 'uploading'];
    const uploadStarted = uploadStartedStages.includes(uploadStage);


    const publishReelay = async () => {
        if (!videoURI) {
            console.log('No video to upload.');
            return;
        }

        try {
            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            setPreviewIsMuted(true);
            const destination = (topicID) ? 'InTopic' : 'OnProfile';
            const posterSource = titleObj?.posterSource;
            const starRating = starCountRef.current * 2;
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${reelayDBUser?.sub}-${uploadTimestamp}.mp4`;
            
            const reelayDBBody = {
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser.username,
                datastoreSub: uuidv4(), 
                description: descriptionRef.current,
                isMovie: titleObj.isMovie,
                isSeries: titleObj.isSeries,
                postedAt: uploadTimestamp,
                starRating: Math.floor(starRating/2),
                starRatingAddHalf: (starRating%2===1) ? true : false,
                tmdbTitleID: titleObj.id,
                topicID: topicID ?? null,
                venue: venue,
                videoS3Key: videoS3Key,
                visibility: UPLOAD_VISIBILITY,
            }

            const uploadRequest = {
                destination,
                posterSource,
                reelayDBBody, 
                reelayTopic,
                videoURI, 
                videoS3Key,             
            }

            dispatch({ type: 'setUploadRequest', payload: uploadRequest });
            dispatch({ type: 'setUploadStage', payload: 'upload-ready' });

        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
        }
    }

    const HeaderWithPoster = () => {
        return (
            <>
                <HeaderContainer>
                    <BackButtonContainer onPress={() => setConfirmRetakeDrawerVisible(true)}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButtonContainer>
                    <TitlePosterContainer>
                        <TitlePoster title={titleObj} width={80} />
                    </TitlePosterContainer>
                </HeaderContainer>
            </>
        );
    };

    const PleaseBePatientPrompt = () => {
        return (
            <PatientContainer>
                <PatientText>
                    {'Longer videos can take a little while to process. Thanks for being patient!'}
                </PatientText>
            </PatientContainer>
        )
    }

    const UploadBottomRow = () => {
        return (
            <UploadBottomArea onPress={Keyboard.dismiss}>
                { pleaseBePatientShouldDisplay && uploadStarted && <PleaseBePatientPrompt /> }
                <UploadDescriptionAndStarRating 
                    starCountRef={starCountRef}
                    descriptionRef={descriptionRef}
                />
                <UploadBottomBar>
                    <DownloadButton titleObj={titleObj} videoURI={videoURI} />
                    <UploadButton />
                </UploadBottomBar>
            </UploadBottomArea>
        )
    }

    const UploadButton = () => {
        const buttonText = (uploadStarted) ? 'Preparing...   ' : 'Post';
        const buttonColor = (uploadStarted) ? 'white' : ReelayColors.reelayBlue;
        const buttonTextColor = (uploadStarted) ? 'black' : 'white';

        return (
            <UploadButtonPressable color={buttonColor} onPress={publishReelay}>
                <UploadButtonText buttonTextColor={buttonTextColor}>
                    {buttonText}
                </UploadButtonText>
                { uploadStarted && <ActivityIndicator /> }
            </UploadButtonPressable>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    useEffect(() => {
        // in multipart uploads, the app will freeze during preparing-upload
        // so we don't want to navigate away until we're done with that part
        if (uploadStage === 'uploading') {
            navigation.popToTop();
            if (reelayTopic) {
                navigation.navigate('SingleTopicScreen', {
                    initReelayIndex: 0,
                    topic: reelayTopic,
                });
            } else {
                navigation.navigate('Global');
            }
        }
    }, [uploadStage])



    return (
        <UploadScreenContainer>
            <PreviewVideoPlayer isMuted={previewIsMuted} title={titleObj} videoURI={videoURI} />
            <HeaderWithPoster />
            <KeyboardAvoidingView behavior='position'>
                <UploadBottomRow />
            </KeyboardAvoidingView>
            <ConfirmRetakeDrawer 
                navigation={navigation} titleObj={titleObj} 
                confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                lastState={"Upload"}
            />
        </UploadScreenContainer>
    );
};
