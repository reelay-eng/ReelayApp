import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';  
import Constants from 'expo-constants';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';
import PostDestinationDrawer from '../../components/clubs/PostDestinationDrawer';
import TitlePoster from '../../components/global/TitlePoster';

import { Pressable, View, Keyboard, KeyboardAvoidingView, ActivityIndicator, Dimensions } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import DownloadButton from '../../components/create-reelay/DownloadButton';
import UploadDescriptionAndStarRating from '../../components/create-reelay/UploadDescriptionAndStarRating';
import { useFocusEffect } from '@react-navigation/native';
import { addTitleToClub, getClubTitles } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';

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
const WhereAmIPostingContainer = styled(View)`
    background-color: rgba(0,0,0,0.35);
    border-radius: 16px;
    margin: 10px;
    margin-bottom: 0px;
    padding: 12px;
`

export default ReelayUploadScreen = ({ navigation, route }) => {
    const { 
        clubID, 
        recordingLengthSeconds, 
        titleObj, 
        topicID, 
        videoURI, 
        venue,
    } = route.params;

    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();

    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);
    const [destinationDrawerVisible, setDestinationDrawerVisible] = useState(false);
    const [previewIsMuted, setPreviewIsMuted] = useState(false);
 
    const descriptionRef = useRef('');
    const starCountRef = useRef(0);
    const pleaseBePatientShouldDisplay = (recordingLengthSeconds > 15);

    console.log('recording length seconds: ', recordingLengthSeconds);

    // get the club we're (optionally) posting in
    const myClubs = useSelector(state => state.myClubs);

    // get the topic we're (optionally) posting in
    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const followingTopics =useSelector(state => state.myHomeContent?.following?.topics);

    const allTopics = [...discoverTopics, ...followingTopics];
    const isNotDuplicate = (topic, index) => (index === allTopics.findIndex(nextTopic => nextTopic?.id === topic?.id));
    const allUniqueTopics = allTopics.filter(isNotDuplicate);
    
    const uploadRequest = useSelector(state => state.uploadRequest);
    const uploadStage = useSelector(state => state.uploadStage);
    const uploadStartedStages = ['check-club-title', 'upload-ready', 'preparing-upload', 'uploading'];
    const uploadStarted = uploadStartedStages.includes(uploadStage);

    // createUploadRequest can either be called from this screen or the
    // select destination drawer, so we need a variable clubID
    const createUploadRequest = async (clubID) => {
        try {
            const posterSource = titleObj?.posterSource;
            const starRating = starCountRef.current * 2;

            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${reelayDBUser?.sub}-${uploadTimestamp}.mp4`;
    
            const matchClubID = (nextClub) => (nextClub.id === clubID);
            const reelayClub = (clubID) ? myClubs.find(matchClubID) : null;
            const hasClubTitle = (clubID && !topicID);
            const reelayClubTitle = (hasClubTitle) ? await getOrCreateClubTitle(clubID) : null;

            if (hasClubTitle && (!reelayClubTitle || reelayClubTitle?.error)) {
                showErrorToast('Ruh roh! Couldn\'t post your reelay. Try again?');
                return { error: 'Could not create club title' };
            }
    
            // the destination drawer cannot post directly into a topic, so
            // if topicID is populated, this clubID must have been passed as a param
            const reelayTopic = (topicID && clubID) 
                ? reelayClub?.topics?.find(nextTopic => nextTopic.id === topicID)
            : (topicID) 
                ? allUniqueTopics.find(nextTopic => nextTopic.id === topicID) 
            : null;
    
            const destination = (clubID) ? 'InClub' 
                : (topicID) ? 'InTopic' 
                : 'OnProfile';
            
            const reelayDBBody = {
                clubID: clubID ?? null,
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser.username,
                datastoreSub: uuidv4(), 
                description: descriptionRef.current,
                isMovie: !titleObj.isSeries,
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
                reelayClub,
                reelayClubTitle, 
                reelayTopic,
                videoURI, 
                videoS3Key,             
            };
    
            return uploadRequest;    
        } catch (error) {
            console.log(error);
            return { error };
        }
    }

    const getOrCreateClubTitle = async (clubID) => {
        try {
            const clubTitles = await getClubTitles({
                authSession,
                clubID,
                reqUserSub: reelayDBUser?.sub,
            });

            const matchClubTitle = (clubTitle) => (
                clubTitle.tmdbTitleID === titleObj.id && 
                clubTitle.titleType === titleObj.titleType
            );    

            const reelayClubTitle = clubTitles?.find(matchClubTitle);
            if (reelayClubTitle) {
                return reelayClubTitle;
            }
            
            const newClubTitle = await addTitleToClub({
                authSession,
                addedByUsername: reelayDBUser?.username,
                addedByUserSub: reelayDBUser?.sub,
                clubID,
                tmdbTitleID: titleObj?.id,
                titleType: titleObj?.titleType,
            });
            return newClubTitle;    
        } catch (error) {
            console.log(error);
            return { error };
        }
    }    

    const publishReelay = async (clubID) => {
        try {
            setPreviewIsMuted(true);
            dispatch({ type: 'setUploadStage', payload: 'check-club-title' });
            const uploadRequest = await createUploadRequest(clubID);
            if (!uploadRequest || uploadRequest?.error) {
                dispatch({ type: 'setUploadStage', payload: 'none' });
                return;
            }
            
            dispatch({ type: 'setUploadRequest', payload: uploadRequest });
            dispatch({ type: 'setUploadStage', payload: 'upload-ready' });
        } catch (error) {
            console.log('Error uploading file: ', error);
            showErrorToast('Ruh roh! Couldn\'t post your reelay. Try again?');
            dispatch({ type: 'setUploadStage', payload: 'none' });
        }
    }

    const confirmPostDestination = () => {
        const destinationTBD = (!clubID && !topicID && myClubs.length > 0);
        if (destinationTBD) {
            setDestinationDrawerVisible(true);
        } else {
            publishReelay(clubID);
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
            <KeyboardAvoidingView behavior='position'>
            <UploadBottomArea onPress={Keyboard.dismiss}>
                { pleaseBePatientShouldDisplay && uploadStarted && <PleaseBePatientPrompt /> }
                { !uploadStarted && (
                    <UploadDescriptionAndStarRating 
                        starCountRef={starCountRef}
                        descriptionRef={descriptionRef}
                    />
                )}
                <UploadBottomBar>
                    <DownloadButton titleObj={titleObj} videoURI={videoURI} />
                    <UploadButton />
                </UploadBottomBar>
            </UploadBottomArea>
            </KeyboardAvoidingView>
        )
    }

    const UploadButton = () => {
        const postDestinationText = (clubID)
                ? 'Post to Club'
            : (topicID)
                ? 'Post to Topic'
            : (myClubs.length === 0)
                ? 'Post to Profile'
            : 'Next';
        const buttonText = (uploadStarted) ? 'Preparing...   ' : postDestinationText;
        const buttonColor = (uploadStarted) ? 'white' : ReelayColors.reelayBlue;
        const buttonTextColor = (uploadStarted) ? 'black' : 'white';

        return (
            <UploadButtonPressable color={buttonColor} onPress={confirmPostDestination}>
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
            const { reelayClub, reelayTopic } = uploadRequest;
            if (reelayClub) {
                navigation.navigate('ClubActivityScreen', { club: reelayClub });
            } else if (reelayTopic) {
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
            <UploadBottomRow />
            { confirmRetakeDrawerVisible && (
                <ConfirmRetakeDrawer 
                    navigation={navigation} titleObj={titleObj} 
                    confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                    setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                    lastState={"Upload"}
                />
            )}
            { destinationDrawerVisible && (
                <PostDestinationDrawer
                    publishReelay={publishReelay}
                    drawerVisible={destinationDrawerVisible}
                    setDrawerVisible={setDestinationDrawerVisible}
                />
            )}
        </UploadScreenContainer>
    );
};
