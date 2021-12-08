import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UploadContext } from '../../context/UploadContext';

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

import Constants from 'expo-constants';
import * as MediaLibrary from 'expo-media-library';

import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';

import { Dimensions, Image, SafeAreaView, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Progress from 'react-native-progress';

import * as Amplitude from 'expo-analytics-amplitude';
import { sendStackPushNotificationToOtherCreators } from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { postReelayToDB } from '../../api/ReelayDBApi';
import { getPosterURL } from '../../api/TMDbApi';
import ReelayColors from '../../constants/ReelayColors';

const { height, width } = Dimensions.get('window');
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const BackButtonPressable = styled(Pressable)`
    top: 10px;
    left: 10px;
`
const PosterContainer = styled(View)`
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
    border-color: white;
    border-radius: 24px;
    border-width: 1px;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 80px;
    bottom: 10px;
    left: 10px;
`
const UploadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-color: white;
    border-radius: 24px;
    border-width: 1px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 240px;
    bottom: 10px;
    right: 10px;
`
const UploadButtonText = styled(Text)`
    font-family: System;
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin-left: 16px;
`
const UploadBottomBar = styled(SafeAreaView)`
    flex-direction: row;
    justify-content: space-between;
`
const UploadTopBar = styled(SafeAreaView)`
    flex-direction: row;
    justify-content: space-between;
`
const UploadProgressBarContainer = styled(View)`
    align-self: center;
    height: 10px;
    margin: 15px;
    justify-content: center;
    width: 75%;
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
    const [uploadProgress, setUploadProgress] = useState(0.0);
    const [uploadStage, setUploadStage] = useState(uploadStages[0]);

    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const { s3Client } = useContext(UploadContext);

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

        Amplitude.logEventWithPropertiesAsync('publishReelayStarted', {
            username: reelayDBUser.username,
            title: titleObj.display,
        });

        try {
            console.log('Upload dialog initiated.');
            setUploadStage('uploading');

            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${reelayDBUser.sub}-${uploadTimestamp}.mp4`;
            const s3UploadResult = await uploadReelayToS3(videoURI, `public/${videoS3Key}`);
            console.log(s3UploadResult);

            // Post Reelay object to ReelayDB
            // not checking for dupes on uuidv4(), 
            // but a collision is less than a one in a quadrillion chance

            const reelayDBBody = {
                creatorSub: reelayDBUser.sub,
                creatorName: reelayDBUser.username,
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

            Amplitude.logEventWithPropertiesAsync('publishReelayComplete', {
                username: reelayDBUser.username,
                userSub: reelayDBUser.sub,
                title: titleObj.display,
            });

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayDBApi

            await sendStackPushNotificationToOtherCreators({
                creator: cognitoUser,
                reelay: { 
                    ...reelayDBBody, 
                    title: {
                        id: reelayDBBody.tmdbTitleID 
                    }
                },
            });


        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadProgress(0.0);
            setUploadStage('upload-failed-retry');
            
            Amplitude.logEventWithPropertiesAsync('uploadFailed', {
                username: reelayDBUser.username,
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
                Amplitude.logEventWithPropertiesAsync('saveToDeviceFailed', {
                    username: reelayDBUser.username,
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

    const UploadButton = () => {
        
        const getCurrentButtonColor = () => {
            if (uploadStage === 'preview') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'uploading') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'upload-complete') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'upload-failed-retry') {
                return ReelayColors.reelayBlue;
            } else {
                return ReelayColors.reelayRed;
            }
        }

        // https://ionic.io/ionicons
        const getCurrentIconName = () => {
            if (uploadStage === 'preview') {
                return 'paper-plane';
            } else if (uploadStage === 'uploading') {
                return 'ellipsis-horizontal';
            } else if (uploadStage === 'upload-complete') {
                return 'checkmark-done';
            } else if (uploadStage === 'upload-failed-retry') {
                return 'reload';
            } else {
                return 'help';
            }
        }

        const getCurrentText = () => {
            if (uploadStage === 'preview') {
                return 'Publish Reelay';
            } else if (uploadStage === 'uploading') {
                return 'Uploading';
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
                navigation.navigate('HomeFeedScreen', { forceRefresh: true });    
            } else if (uploadStage === 'upload-failed-retry') {
                publishReelay();
            }
        }

        return (
            <UploadButtonPressable onPress={onPress} color={getCurrentButtonColor()}>
                <Icon type='ionicon' name={getCurrentIconName()} color={'white'} size={30} />
                <UploadButtonText>{getCurrentText()}</UploadButtonText>
            </UploadButtonPressable>
        );
    }

    const UploadProgressBar = () => {
        const indeterminate = (uploadProgress < 0.1) && (uploadStage === 'uploading');
    
        return (
            <UploadProgressBarContainer>
                { ((uploadStage === 'uploading') || (uploadStage === 'upload-complete')) && 
                    <Progress.Bar 
                        color={'white'} 
                        indeterminate={indeterminate} 
                        progress={uploadProgress} 
                        width={width * 0.75} 
                    />
                }
            </UploadProgressBarContainer>
        );
    }

    const playPause = () => playing ? setPlaying(false) : setPlaying(true);
    const posterURL = getPosterURL(titleObj?.posterURI);

    const posterStyle = {
        borderColor: 'white',
        borderRadius: 8, 
        borderWidth: 1, 
        height: 150, 
        width: 100, 
    }

    const retakeReelay = async () => {
        Amplitude.logEventWithPropertiesAsync('retake', {
            username: reelayDBUser.username,
            title: titleObj.display,
        });
        navigation.pop();
    }

    return (
        <UploadScreenContainer>
            <PressableVideoContainer onPress={playPause}>
                <PreviewVideoPlayer videoURI={videoURI} playing={playing} />
            </PressableVideoContainer>
            {/* <UploadProgressBar /> */}
            <UploadTopBar>
                <BackButtonPressable onPress={retakeReelay}>
                    <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} />
                </BackButtonPressable>
                <PosterContainer>
                    <Image source={{ uri: posterURL }} style={posterStyle} />
                </PosterContainer>
            </UploadTopBar>
            <UploadBottomBar>
                <SaveButton />
                <UploadButton />
            </UploadBottomBar>
        </UploadScreenContainer>
    );
};