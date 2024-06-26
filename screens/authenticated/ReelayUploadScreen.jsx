import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';
import Constants from 'expo-constants';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';
import PostDestinationDrawer from '../../components/clubs/PostDestinationDrawer';

import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    SafeAreaView,
    TouchableOpacity,
    View,
} from 'react-native';
import * as ReelayText from '../../components/global/Text';
import TitleBanner from '../../components/feed/TitleBanner';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import DownloadButton from '../../components/create-reelay/DownloadButton';
import UploadDescriptionAndStarRating from '../../components/create-reelay/UploadDescriptionAndStarRating';
import { useFocusEffect } from '@react-navigation/native';
import { addTitleToClub, getClubTitles } from '../../api/ClubsApi';
import { showErrorToast } from '../../components/utils/toasts';
import ReelayFeedHeader from '../../components/feed/ReelayFeedHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import { HeaderSkipBack } from '../../components/global/Headers';
import UploadProgressBar from '../../components/global/UploadProgressBar';
import { async } from 'validate.js';
import { getStacksByCreator } from '../../api/ReelayDBApi';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../../components/utils/EventLogger';

const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const UploadButtonPressable = styled(TouchableOpacity)`
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
    margin-right: 6px;
    text-align: center;
`
const UploadBottomArea = styled(Pressable)`
    justify-content: flex-end;
`
const UploadBottomBar = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 24px;
    margin-left: 2px;
    margin-right: 2px;
`
const UploadScreenContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`
const TitleBannerContainer = styled(View)`
    position: absolute;
    top: ${props => props.topOffset + 36}px;
`

const SortOptionsView = styled(View)`
background-color: black;
padding: 2px;
position: absolute;
padding-top: ${props => props.topOffset - 7}px;

    width: 100%;
`

export default ReelayUploadScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('Reelay upload screen mounted');
        const {
            clubID = null,
            draftGame = null,
            titleObj,
            topicID = null,
            videoURI = null,
            venue = '',
            fromFirstTitle = false
        } = route.params;

        const { reelayDBUser } = useContext(AuthContext);
        const authSession = useSelector(state => state.authSession);
        const dispatch = useDispatch();

        const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);
        const [destinationDrawerVisible, setDestinationDrawerVisible] = useState(false);
        const [previewIsMuted, setPreviewIsMuted] = useState(false);

        const descriptionRef = useRef('');
        const starCountRef = useRef(0);
        const topOffset = useSafeAreaInsets().top;

        // get the club we're (optionally) posting in
        const myClubs = useSelector(state => state.myClubs);

        // get the topic we're (optionally) posting in
        const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
        const uploadRequest = useSelector(state => state.uploadRequest);
        const uploadStage = useSelector(state => state.uploadStage);
        const myCreatorStacks = useSelector(state => state.myCreatorStacks);
        const uploadStartedStages = ['check-club-title', 'upload-ready', 'preparing-upload', 'uploading'];
        const uploadStarted = uploadStartedStages.includes(uploadStage);

        const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
        const showProgressBar = showProgressBarStages.includes(uploadStage);

        // createUploadRequest can either be called from this screen or the
        // select destination drawer, so we need a variable clubID
        const createUploadRequest = async () => {
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

                const getReelayTopic = () => {
                    if (topicID && draftGame) {
                        return draftGame;
                    } else if (topicID && clubID) {
                        return reelayClub?.topics?.find(nextTopic => nextTopic.id === topicID);
                    } else if (topicID) {
                        return discoverTopics.find(nextTopic => nextTopic.id === topicID);
                    }
                    return null;
                }

                const reelayTopic = getReelayTopic();
                const destination = (clubID) ? 'InClub'
                    : (topicID) ? 'InTopic'
                        : 'OnProfile';

                const reelayDBBody = {
                    clubID: clubID && clubID !== "" ? clubID : null,
                    creatorSub: reelayDBUser?.sub,
                    creatorName: reelayDBUser.username,
                    datastoreSub: uuidv4(),
                    description: descriptionRef.current,
                    isMovie: !titleObj.isSeries,
                    isSeries: titleObj.isSeries,
                    postedAt: uploadTimestamp,
                    starRating: Math.floor(starRating / 2),
                    starRatingAddHalf: (starRating % 2 === 1) ? true : false,
                    tmdbTitleID: titleObj.id,
                    topicID: topicID && topicID !== "" ? topicID : null,
                    venue: venue,
                    videoS3Key: videoS3Key,
                    visibility: (!!draftGame) ? 'draft' : UPLOAD_VISIBILITY,
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

        const getOrCreateClubTitle = async () => {
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

        const onRefresh = async () => {
            console.log("onRefresh")
            const nextMyCreatorStacks = await getStacksByCreator(reelayDBUser?.sub)
            dispatch({ type: 'setMyCreatorStacks', payload: nextMyCreatorStacks });
            console.log("nextMyCreatorStacks", nextMyCreatorStacks)
            // navigation.push('ProfileFeedScreen', { 
            //     initialFeedPos: 0, 
            //     stackList: nextMyCreatorStacks, 
            // });
            navigation.reset({
                index: 1,
                routes: [{ name: 'HomeScreen' }, {
                    name: 'ProfileFeedScreen', params: {
                        initialFeedPos: 0,
                        stackList: nextMyCreatorStacks,
                        firstReelAfterSignup: true
                    }
                }],
            })

        }

        const publishReelay = async () => {
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
            const skipp = async () => {
                // navigation.replace('HomeScreen') 
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen' }],
                })
            }
            const goBack = () => { navigation.goBack(); }

            return (
                <View>
                    {/* <ReelayFeedHeader feedSource={'upload'} navigation={navigation} /> */}
                    {!fromFirstTitle ?
                        <ReelayFeedHeader feedSource={'upload'} navigation={navigation} /> :
                        <SortOptionsView topOffset={topOffset}>
                            <HeaderSkipBack onPressOverride={goBack} onSkip={skipp} navigation={navigation} text='upload' />
                        </SortOptionsView>}
                    {(!!titleObj?.id) && (
                        <TitleBannerContainer topOffset={topOffset}>
                            <TitleBanner titleObj={titleObj} onCameraScreen={true} venue={venue} />
                        </TitleBannerContainer>
                    )}
                </View>
            );
        };

        const UploadBottomRow = () => {
            const showStarRating = !!titleObj?.id && !draftGame;
            return (
                <KeyboardAvoidingView behavior='position'>
                    <UploadBottomArea onPress={Keyboard.dismiss}>
                        {!uploadStarted && (
                            <UploadDescriptionAndStarRating
                                showStarRating={showStarRating}
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
            const getPostDestinationText = () => {
                if (draftGame) return 'Upload Clue';
                if (topicID) return 'Post to Topic';
                if (clubID) return 'Post to Club';
                return 'Post';
                // if (myClubs.length === 0) return 'Post to Profile';
                // return 'Next';
            }

            const postDestinationText = getPostDestinationText();
            const buttonText = (uploadStarted) ? 'Preparing...   ' : postDestinationText;
            const buttonTextColor = (uploadStarted) ? 'black' : 'white';
            const buttonColor = (uploadStarted) ? 'white' : ReelayColors.reelayBlue;
            const showGlobeIcon = (!uploadStarted && !draftGame && !topicID && !clubID);

            return (
                <UploadButtonPressable color={buttonColor} onPress={publishReelay}>
                    <UploadButtonText buttonTextColor={buttonTextColor}>
                        {buttonText}
                    </UploadButtonText>
                    {showGlobeIcon && (<FontAwesomeIcon icon={faGlobeAmericas} color='white' size={20} />)}
                    {uploadStarted && <ActivityIndicator />}
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
                if (!fromFirstTitle) {
                    navigation.popToTop();
                }
                const { reelayClub, reelayTopic } = uploadRequest;
                if (reelayClub) {
                    navigation.navigate('ClubActivityScreen', { club: reelayClub });
                } else if (draftGame) {
                    navigation.navigate('CreateGuessingGameCluesScreen', { game: draftGame })
                } else {
                    if (fromFirstTitle) {
                        // navigation.replace('HomeScreen')   
                        return;
                    }
                    navigation.navigate('Discover');
                }
            }
        }, [uploadStage])

        return (
            <UploadScreenContainer>
                <PreviewVideoPlayer isMuted={previewIsMuted} title={titleObj} videoURI={videoURI} />
                {showProgressBar && fromFirstTitle && <UploadProgressBar mountLocation={'OnProfile'} onRefresh={onRefresh} />}
                <HeaderWithPoster />
                {!showProgressBar && <UploadBottomRow />}
                {confirmRetakeDrawerVisible && (
                    <ConfirmRetakeDrawer
                        navigation={navigation} titleObj={titleObj}
                        confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                        setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                        lastState={"Upload"}
                    />
                )}
                {destinationDrawerVisible && (
                    <PostDestinationDrawer
                        publishReelay={publishReelay}
                        drawerVisible={destinationDrawerVisible}
                        setDrawerVisible={setDestinationDrawerVisible}
                    />
                )}
            </UploadScreenContainer>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
