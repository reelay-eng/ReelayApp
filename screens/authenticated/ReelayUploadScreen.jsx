import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

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

import * as MediaLibrary from 'expo-media-library';

import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';

import { Image, SafeAreaView, Pressable, View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import { notifyOnReelayedRec } from '../../api/WatchlistNotifications';
import { useDispatch, useSelector } from 'react-redux';

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const BackButtonPressable = styled(Pressable)`
    top: 10px;
    left: 10px;
`
const PosterContainer = styled(SafeAreaView)`
    top: 10px;
    right: 10px;
`
const PressableVideoContainer = styled(Pressable)`
    height: 100%;
    width: 100%;
    position: absolute;
`
const SaveButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 80px;
    bottom: 10px;
    left: 10px;
`
const ContinueButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 240px;
    bottom: 10px;
    right: 10px;
`
const ContinueButtonText = styled(ReelayText.H6Emphasized)`
    color: white;
    margin-left: 10px;
`
const UploadBottomArea = styled(SafeAreaView)`
    justify-content: flex-end;
`
const UploadBottomBar = styled(SafeAreaView)`
    flex-direction: row;
    justify-content: space-between;
`
const UploadTopArea = styled(SafeAreaView)`
    flex-direction: row;
    justify-content: space-between;
`
const UploadScreenContainer = styled(View)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`

export default ReelayUploadScreen = ({ navigation, route }) => {

    const { titleObj, videoURI, venue } = route.params;

    const uploadStages = [
        'preview',
        'uploading',
        'upload-complete',
        'upload-failed-retry',
    ];

    const [playing, setPlaying] = useState(true);
    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);

    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const s3Client = useSelector(state => state.s3Client);

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
            username: reelayDBUser?.username,
            title: titleObj.display,
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

            const reelayDBBody = {
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser?.username,
                datastoreSub: uuidv4(), 
                isMovie: titleObj.isMovie,
                isSeries: titleObj.isSeries,
                postedAt: uploadTimestamp,
                tmdbTitleID: titleObj.id,
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

            console.log('REELAYDB USER: ', reelayDBUser);

            logAmplitudeEventProd('publishReelayComplete', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                title: titleObj.display,
            });

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayDBApi

            const annotatedTitle = await fetchAnnotatedTitle(reelayDBBody.tmdbTitleID, reelayDBBody.isSeries);
            await notifyOtherCreatorsOnReelayPosted({
                creator: reelayDBUser,
                reelay: { 
                    ...reelayDBBody, 
                    title: annotatedTitle,
                },
            });

            notifyOnReelayedRec({ 
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser?.username,
                reelay: reelayDBBody,
                watchlistItems: myWatchlistItems,
            });
            
			dispatch({ type: 'setRefreshOnUpload', payload: true })
            navigation.popToTop();
            navigation.navigate("FeedScreen", { forceRefresh: true });

        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadProgress(0.0);
            setUploadStage('upload-failed-retry');
            
            logAmplitudeEventProd('uploadFailed', {
                username: reelayDBUser?.username,
                title: titleObj.display,
            });
        }
    }

    const SaveButton = () => {
        const [hasSavePermission, setHasSavePermission] = useState(null);
        const [downloadStage, setDownloadStage] = useState('preview');

        const getBackgroundColor = () => {
            if (downloadStage === 'preview') {
                return ReelayColors.reelayBlue;
            } else if (downloadStage === 'downloading') {
                return ReelayColors.reelayBlack;
            } else if (downloadStage === 'download-complete') {
                return 'green';
            } else {
                return ReelayColors.reelayRed;
            }
        }

        const getCurrentIconName = () => {
            if (downloadStage === 'preview') {
                return 'download';
            } else if (downloadStage === 'downloading') {
                return 'download';
            } else if (downloadStage === 'download-complete') {
                return 'checkmark-done';
            } else {
                return 'reload';
            }
        }

        const saveReelay = async () => {
            if (!hasSavePermission) {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                const nextHasSavePermission = status === 'granted';
                setHasSavePermission(nextHasSavePermission);
                if (!nextHasSavePermission) return;
            }
    
            try {
                setDownloadStage('downloading');
                await MediaLibrary.saveToLibraryAsync(videoURI);
                setDownloadStage('download-complete');
            } catch (error) {
                console.log('Could not save to local device...');
                logAmplitudeEventProd('saveToDeviceFailed', {
                    username: reelayDBUser?.username,
                    title: titleObj.display,
                });
                setDownloadStage('download-failed-retry');
            }
        }
    
        return (
            <SaveButtonPressable onPress={saveReelay} color={getBackgroundColor()}>
                <Icon type='ionicon' name={getCurrentIconName()} color={'white'} size={30} />
            </SaveButtonPressable>  
        );
    }

    const ContinueButton = () => {
        const onPress = () => {
            // if (uploadStage === 'preview') {
            //     publishReelay();
            // } else if (uploadStage === 'uploading') {
            //     // do nothing
            // } else if (uploadStage === 'upload-complete') {
            //     navigation.popToTop();
            //     navigation.navigate('FeedScreen', { forceRefresh: true });    
            // } else if (uploadStage === 'upload-failed-retry') {
            //     publishReelay();
            // }
            navigation.push("ReelayInfoScreen", {
                titleObj: titleObj,
                videoURI: videoURI,
                venue: venue,
            })
        }

        return (
            <ContinueButtonPressable onPress={onPress} color={ReelayColors.reelayBlue}>
                <Icon type='ionicon' name={"checkmark-outline"} color={'white'} size={30} />
                <ContinueButtonText>{"Continue"}</ContinueButtonText>
            </ContinueButtonPressable>
        );
    }

    const playPause = () => playing ? setPlaying(false) : setPlaying(true);

    const posterStyle = {
        borderRadius: 8, 
        height: 120, 
        width: 80, 
    }

    const openConfirmRetakeDrawer = async () => {
        setConfirmRetakeDrawerVisible(true);
    }

    return (
        <UploadScreenContainer>
            <PressableVideoContainer onPress={playPause}>
                <PreviewVideoPlayer videoURI={videoURI} playing={playing} />
            </PressableVideoContainer>
            <UploadTopArea>
                <BackButtonPressable onPress={openConfirmRetakeDrawer}>
                    <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} />
                </BackButtonPressable>
                <PosterContainer>
                    <Image source={titleObj.posterSource} style={posterStyle} />
                </PosterContainer>
            </UploadTopArea>
            <UploadBottomArea>
                <UploadBottomBar>
                    <SaveButton />
                    <ContinueButton />
                </UploadBottomBar>
            </UploadBottomArea>
            <ConfirmRetakeDrawer 
                navigation={navigation} titleObj={titleObj} 
                confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                lastState={"Preview Video"}
            />
        </UploadScreenContainer>
    );
};