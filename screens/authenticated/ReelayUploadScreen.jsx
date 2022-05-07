import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';

import { EncodingType, readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';

import { 
    CreateMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    ListPartsCommand,
    PutObjectCommand,
    UploadPartCommand,
} from '@aws-sdk/client-s3';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';  
import Constants from 'expo-constants';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';

import { Dimensions, Pressable, View, Keyboard, KeyboardAvoidingView } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';
import * as Progress from 'react-native-progress';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import {
    notifyOtherCreatorsOnReelayPosted, 
    notifyMentionsOnReelayPosted,
    notifyTopicCreatorOnReelayPosted,
} from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { postReelayToDB, prepareReelay } from '../../api/ReelayDBApi';
import ReelayColors from '../../constants/ReelayColors';
import { notifyOnReelayedRec } from '../../api/WatchlistNotifications';
import DownloadButton from '../../components/create-reelay/DownloadButton';
import UploadDescriptionAndStarRating from '../../components/create-reelay/UploadDescriptionAndStarRating';
import { useFocusEffect } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const UploadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 125px;
    bottom: 10px;
    right: 12px;
`
const UploadButtonText = styled(ReelayText.H6Emphasized)`
    color: white;
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
`
const UploadProgressBarContainer = styled(View)`
    align-self: center;
    justify-content: center;
    padding-top: 12px;
    width: ${width - 24}px;
`
const UploadScreenContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`

export default ReelayUploadScreen = ({ navigation, route }) => {
    const { titleObj, videoURI, venue } = route.params;
    const topicID = route.params?.topicID;
    const globalTopics = useSelector(state => state.globalTopics);
    const reelayTopic = topicID ? globalTopics.find(nextTopic => nextTopic.id === topicID) : null;

    console.log('topic id on upload screen: ', topicID);

    const uploadStages = [
        'preview',
        'uploading',
        'upload-complete',
        'upload-failed-retry',
    ];

    const [uploadProgress, setUploadProgress] = useState(0.0);
    const [uploadStage, setUploadStage] = useState(uploadStages[0]);
    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);

    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
	const s3Client = useSelector(state => state.s3Client);
    const showProgressBar = ((uploadStage === 'uploading') || (uploadStage === 'upload-complete'));
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const descriptionRef = useRef('');
    const starCountRef = useRef(0);

    const uploadReelayToS3 = async (videoURI, videoS3Key) => {
        setUploadProgress(0.2);
        const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
        const videoBuffer = Buffer.from(videoStr, 'base64');
        setUploadProgress(0.4);

        let result;
        if (videoBuffer.byteLength < UPLOAD_CHUNK_SIZE) {
            result = await uploadToS3SinglePart(videoBuffer, videoS3Key);
        } else {
            result = await uploadToS3Multipart(videoBuffer, videoS3Key);
        }

        setUploadProgress(0.8);
        console.log('S3 upload complete');
        return result;
    }

    const uploadToS3SinglePart = async (videoBuffer, videoS3Key) => {
        const uploadResult = await s3Client.send(new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
            Body: videoBuffer,
        }));

        return uploadResult;
    }

    const uploadToS3Multipart = async (videoBuffer, videoS3Key) => {
        /**
         * AWS requires each part must be at least 5MB. In this method, each part
         * is exactly 5MB except the last chunk, which can be up to 10MB
         */

        const numParts = Math.floor(videoBuffer.byteLength / UPLOAD_CHUNK_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index);

        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
        }));

        setUploadProgress(0.6);

        const uploadPartResults = await Promise.all(partNumberRange.map(async (partNumber) => {
            console.log('PART NUMBER: ', partNumber);

            // byteEnd rounds to the end of the file, so its buffer is normally > 5MB
            const byteBegin = partNumber * UPLOAD_CHUNK_SIZE;
            const byteEnd = (partNumber === numParts - 1)
                ? videoBuffer.byteLength
                : byteBegin + UPLOAD_CHUNK_SIZE;

            const result = await s3Client.send(new UploadPartCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: videoS3Key,
                ContentType: 'video/mp4',
                Body: videoBuffer.slice(byteBegin, byteEnd),
                PartNumber: partNumber + 1, // part numbers must be between 1 and 10,000
                UploadId: UploadId,
            }));

            console.log('result completed');
            return result;
        }));

        console.log(uploadPartResults);

        const uploadParts = await s3Client.send(new ListPartsCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            UploadId: UploadId,
        }));
        
        console.log('UPLOAD PARTS: ', uploadParts);
        console.log('about to complete upload');

        const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            UploadId: UploadId,
            MultipartUpload: uploadParts,
        }));

        return uploadCompleteStatus;
    }

    const publishReelay = async () => {
        if (!videoURI) {
            console.log('No video to upload.');
            return;
        }

        logAmplitudeEventProd('publishReelayStarted', {
            username: reelayDBUser.username,
            title: titleObj.display,
            destination: (topicID) ? 'InTopic' : 'OnProfile',
        });

        try {
            console.log('Upload dialog initiated.');
            setUploadStage('uploading');

            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${reelayDBUser?.sub}-${uploadTimestamp}.mp4`;
            const s3UploadResult = await uploadReelayToS3(videoURI, `public/${videoS3Key}`);
            console.log(s3UploadResult);

            // Post Reelay object to ReelayDB
            // not checking for dupes on uuidv4(), 
            // but a collision is less than a one in a quadrillion chance
            const starRating = starCountRef.current * 2;
            
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

            const postResult = await postReelayToDB(reelayDBBody);
            console.log('Saved Reelay to DB: ', postResult);
            
            setUploadProgress(1.0);
            setUploadStage('upload-complete');

            console.log('saved new Reelay');
            console.log('Upload dialog complete.');

            logAmplitudeEventProd('publishReelayComplete', {
                username: reelayDBUser.username,
                userSub: reelayDBUser?.sub,
                title: titleObj.display,
            });

            const preparedReelay = await prepareReelay(reelayDBBody);
            preparedReelay.likes = [];
            preparedReelay.comments = [];

            const mentionedUsers = await notifyMentionsOnReelayPosted({
                creator: reelayDBUser,
                reelay: preparedReelay,
            });

            console.log("mentionedUsers",mentionedUsers)

            notifyOtherCreatorsOnReelayPosted({
                creator: reelayDBUser,
                reelay: preparedReelay,
                topic: reelayTopic ?? null,
                mentionedUsers: mentionedUsers,
            });

            notifyOnReelayedRec({ 
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser?.username,
                reelay: preparedReelay,
                watchlistItems: myWatchlistItems,
            });

            if (reelayTopic) {
                notifyTopicCreatorOnReelayPosted({
                    creator: reelayDBUser,
                    reelay: preparedReelay,
                    topic: reelayTopic,
                });
            }

			dispatch({ type: 'setRefreshOnUpload', payload: true });
            navigation.popToTop();
            if (topicID && reelayTopic) {
                reelayTopic.reelays = [preparedReelay, ...reelayTopic.reelays];
                dispatch({ type: 'setGlobalTopics', payload: globalTopics });
                navigation.navigate('Home');
            } else {
                navigation.navigate('Global', { forceRefresh: true });
            }

        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadProgress(0.0);
            setUploadStage('upload-failed-retry');
            
            logAmplitudeEventProd('uploadFailed', {
                username: reelayDBUser.username,
                title: titleObj.display,
            });
        }
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            padding: 20px;
            align-items: flex-start;
        `;
        const HeaderText = styled(ReelayText.H5Emphasized)`
            text-align: center;
            color: white;
            margin-top: 4px;
            width: 90%;
            margin-right: 18px;
        `;
        const BackButton = styled(Pressable)`
            margin-top: 40px;
            margin-right: 20px;
        `;
        return (
            <>
                <HeaderContainer>
                    <BackButton onPress={() => setConfirmRetakeDrawerVisible(true)}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButton>
                </HeaderContainer>
            </>
        );
    };

    const UploadButton = () => {
        
        const getCurrentButtonColor = () => {
            if (uploadStage === 'preview') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'uploading') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'upload-complete') {
                return 'green';
            } else if (uploadStage === 'upload-failed-retry') {
                return ReelayColors.reelayBlue;
            } else {
                return ReelayColors.reelayRed;
            }
        }

        const getCurrentText = () => {
            if (uploadStage === 'preview') {
                return 'Post';
            } else if (uploadStage === 'uploading') {
                return 'Posting';
            } else if (uploadStage === 'upload-complete') {
                return 'Complete';
            } else if (uploadStage === 'upload-failed-retry') {
                return 'Upload Failed - Retry?';
            } else {
                return 'Something went wrong';
            }
        }

        const onPress = () => {
            if (uploadStage === 'preview') {
                publishReelay();
            } else if (uploadStage === 'uploading') {
                // do nothing
            } else if (uploadStage === 'upload-complete') {
                navigation.popToTop();
                navigation.navigate('Global', { forceRefresh: true });  
            } else if (uploadStage === 'upload-failed-retry') {
                publishReelay();
            }
        }

        return (
            <UploadButtonPressable onPress={onPress} color={getCurrentButtonColor()}>
                <UploadButtonText>{getCurrentText()}</UploadButtonText>
            </UploadButtonPressable>
        );
    }

    const UploadProgressBar = () => {
        const indeterminate = (uploadProgress < 0.1) && (uploadStage === 'uploading');
        const progressBarColor = (uploadStage === 'upload-complete') 
            ? 'green' 
            : 'white';
    
        return (
            <UploadProgressBarContainer>
                    <Progress.Bar 
                        color={progressBarColor} 
                        indeterminate={indeterminate} 
                        progress={uploadProgress} 
                        width={width - 24} 
                        height={8}
                        borderRadius={8}
                    />
            </UploadProgressBarContainer>
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    return (
        <UploadScreenContainer>
            <PreviewVideoPlayer title={titleObj} videoURI={videoURI} />
            <Header navigation={navigation} />
            <KeyboardAvoidingView behavior='position'>
                <UploadBottomArea onPress={Keyboard.dismiss}>
                    <UploadDescriptionAndStarRating 
                        starCountRef={starCountRef}
                        descriptionRef={descriptionRef}
                    />
                    { showProgressBar && <UploadProgressBar /> }
                    <UploadBottomBar>
                        <DownloadButton titleObj={titleObj} videoURI={videoURI} />
                        <UploadButton />
                    </UploadBottomBar>
                </UploadBottomArea>
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