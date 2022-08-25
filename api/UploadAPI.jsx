import { 
    CreateMultipartUploadCommand, 
    CompleteMultipartUploadCommand, 
    ListPartsCommand, 
    PutObjectCommand, 
    UploadPartCommand, 
} from '@aws-sdk/client-s3';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import {
    notifyClubMembersOnReelayPosted,
    notifyOtherCreatorsOnReelayPosted, 
    notifyMentionsOnReelayPosted,
    notifyTopicCreatorOnReelayPosted,
} from './NotificationsApi';

import Constants from 'expo-constants';
import { postReelayToDB, prepareReelay } from './ReelayDBApi';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

import { compressVideoForUpload, DEVICE_CAN_COMPRESS } from './FFmpegApi';
import * as Haptics from 'expo-haptics';

const PROGRESS_PRE_COMPRESSION = 0.05;
const PROGRESS_PRE_S3_UPLOAD = 0.15;
const PROGRESS_S3_UPLOAD_RANGE = 0.75;
const PROGRESS_POST_S3_UPLOAD = 0.9;
const PROGRESS_COMPLETE_OR_FAILED = 1.0;

// random progress between 256kb and 1MB
const RANDOM_TICK_MIN_BYTES = 256 * 1024;
const RANDOM_TICK_BYTES_RANGE = 768 * 1024;

// random tick between 0.5 and 2.5 seconds
const RANDOM_TICK_MIN_MS = 250;
const RANDOM_TICK_MS_RANGE = 2000;

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const S3_UPLOAD_PART_SIZE = 10 * 1024 * 1024; // in bytes

const sendNotificationsOnUpload = async ({ authSession, preparedReelay, reelayClubTitle, reelayTopic }) => {
    const { creator } = preparedReelay;
    const mentionedUsers = await notifyMentionsOnReelayPosted({
        authSession,
        clubID: (reelayClubTitle) ? reelayClubTitle?.clubID : null,
        creator,
        reelay: preparedReelay,
    });

    notifyOtherCreatorsOnReelayPosted({
        creator,
        reelay: preparedReelay,
        clubTitle: reelayClubTitle ?? null,
        topic: reelayTopic ?? null,
        mentionedUsers: mentionedUsers,
    });    

    if (reelayTopic) {
        notifyTopicCreatorOnReelayPosted({
            creator,
            reelay: preparedReelay,
            topic: reelayTopic,
        });
    }
}

export const uploadReelay = async ({ 
    authSession,
    clearUploadRequest,
    destination,
    reelayDBBody, 
    reelayClubTitle,
    reelayTopic,
    s3Client,
    setUploadProgress, 
    setUploadStage,
    videoURI, 
    videoS3Key, 
}) => {
    const { creatorName, creatorSub } = reelayDBBody;

    try {
        logAmplitudeEventProd('publishReelayStarted', {
            username: creatorName,
            userSub: creatorSub,
            destination,
            inTopic: !!reelayDBBody?.topicID,
            inClub: !!reelayDBBody?.clubID,
        });

        activateKeepAwake();
        setUploadStage('preparing-upload');
        setUploadProgress(PROGRESS_PRE_COMPRESSION);

        const onUploadFailed = () => {
            setUploadStage('upload-failed-retry');
            setUploadProgress(PROGRESS_COMPLETE_OR_FAILED);
            deactivateKeepAwake();
            logAmplitudeEventProd('uploadFailed', {
                username: creatorName,
                userSub: creatorSub,
            });    
        }

        const onUploadComplete = async (err, data) => {
            if (err) {
                console.log('upload returned error: ', err);
                onUploadFailed();
                return;    
            }

            console.log('Saved Reelay to S3: ');
            setUploadProgress(PROGRESS_POST_S3_UPLOAD);
        
            const publishedReelay = await postReelayToDB(reelayDBBody);
            setUploadProgress(PROGRESS_COMPLETE_OR_FAILED);
            setUploadStage('upload-complete');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
            console.log('Saved Reelay to DB: ', publishedReelay);
            console.log('Upload dialog complete.');

            logAmplitudeEventProd('publishReelayComplete', {
                username: creatorName,
                userSub: creatorSub,
                destination,
            });
    
            const preparedReelay = await prepareReelay(publishedReelay);
            preparedReelay.likes = [];
            preparedReelay.comments = [];    
        
            await sendNotificationsOnUpload({ 
                authSession,
                preparedReelay, 
                reelayClubTitle, 
                reelayTopic 
            });

            deactivateKeepAwake();    
        };
    
        let uploadVideoURI = videoURI;
        if (DEVICE_CAN_COMPRESS) {
            const { error, outputURI, parsedSession } = await compressVideoForUpload(videoURI);
            if (!error) uploadVideoURI = outputURI;
        }
        
        console.log('beginning managed s3 upload: ', uploadVideoURI, videoS3Key);
        const videoFetched = await fetch(uploadVideoURI);
        const videoBlob = await videoFetched.blob();

        const uploadParams = {
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
            Body: videoBlob,    
        }

        setUploadProgress(PROGRESS_PRE_S3_UPLOAD);
        setUploadStage('uploading');

        let displayBytesUploaded = 0;
        let shouldUpdateProgress = true;
        const updateProgress = () => {
            if (shouldUpdateProgress) {
                const progressMultipleThisTick = Math.random();
                const displayBytesThisTick = progressMultipleThisTick * RANDOM_TICK_BYTES_RANGE + RANDOM_TICK_MIN_BYTES;
                const nextTickDuration = progressMultipleThisTick * RANDOM_TICK_MS_RANGE + RANDOM_TICK_MIN_MS;
                console.log('bytes this tick: ', displayBytesThisTick);
                console.log('tick duration: ', )

                displayBytesUploaded += displayBytesThisTick;
                const progressRatio = displayBytesUploaded / videoBlob.size;
                const progress = PROGRESS_PRE_S3_UPLOAD + (progressRatio * PROGRESS_S3_UPLOAD_RANGE);
                if (progressRatio >= 1) shouldUpdateProgress = false;

                console.log('next upload progress: ', progress);
                setUploadProgress(progress);
                setTimeout(updateProgress, nextTickDuration);
            }
        }

        updateProgress();
        let uploadCompleteStatus;
        if (videoBlob.size > S3_UPLOAD_PART_SIZE) {
            uploadCompleteStatus = await uploadReelayToS3MultiPart(s3Client, uploadParams);
        } else {
            uploadCompleteStatus = await uploadReelayToS3SinglePart(s3Client, uploadParams);
        }

        shouldUpdateProgress = false;
        if (uploadCompleteStatus?.error) {
            onUploadFailed();
        } else {
            onUploadComplete();
        }

    } catch (error) {
        console.log('upload failed in try catch: ', error);
        onUploadFailed();
    }
}

const uploadReelayToS3SinglePart = async (s3Client, uploadParams) => {
    try {
        const uploadCommand = new PutObjectCommand(uploadParams);
        const uploadCompleteStatus = await s3Client.send(uploadCommand);
        return uploadCompleteStatus;    
    } catch (error) {
        console.log(error);
        return { error };
    }
}

const uploadReelayToS3MultiPart = async (s3Client, uploadParams) => {
    try {
        const { Body, Bucket, ContentType, Key } = uploadParams;
        const numParts = Math.floor(Body.size / S3_UPLOAD_PART_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index);
    
        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand(uploadParams));
        console.log('Completed create multipart upload command');

        const videoBufferParts = partNumberRange.map((partNumber) => {
            console.log('start slicing video buffer #', partNumber);
            const byteBegin = partNumber * S3_UPLOAD_PART_SIZE;
            const byteEnd = (partNumber === numParts - 1)
                ? Body.size
                : byteBegin + S3_UPLOAD_PART_SIZE;
            const slice = Body.slice(byteBegin, byteEnd);
            console.log('finish slicing video buffer #', partNumber);
            return slice;
        });

        await Promise.all(partNumberRange.map(async (partNumber) => {
            console.log('start upload part #', partNumber);
            const uploadCommand = new UploadPartCommand({
                Bucket,
                Key,
                ContentType,
                Body: videoBufferParts[partNumber],
                PartNumber: partNumber + 1, // part numbers must be between 1 and 10,000
                UploadId,
            });
            const uploadPartResult = await s3Client.send(uploadCommand);
            console.log('complete upload part #', partNumber);
            return uploadPartResult;
        }));
        
        const uploadParts = await s3Client.send(new ListPartsCommand({ Bucket, Key, UploadId }));
        const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket, Key, UploadId, MultipartUpload: uploadParts,
        }));
        return uploadCompleteStatus;
    } catch (error) {
        console.log(error);
        return { error };
    }
}
