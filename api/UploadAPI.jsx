import { EncodingType, readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';

import { 
    CreateMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    ListPartsCommand,
    PutObjectCommand,
    UploadPartCommand,
} from '@aws-sdk/client-s3';

import {
    notifyOtherCreatorsOnReelayPosted, 
    notifyMentionsOnReelayPosted,
    notifyTopicCreatorOnReelayPosted,
} from './NotificationsApi';

import Constants from 'expo-constants';
import { postReelayToDB, prepareReelay } from './ReelayDBApi';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 8 * 1024 * 1024; // 5MB

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

        setUploadStage('preparing-upload');
        setUploadProgress(0.2);
    
        const s3UploadResult = await uploadReelayToS3({ 
            s3Client, 
            setUploadProgress, 
            setUploadStage,
            videoURI, 
            videoS3Key,
        });

        if (!s3UploadResult) {
            setUploadStage('upload-failed-retry');
            setUploadProgress(1.0);
            return;
        }

        console.log('Saved Reelay to S3: ', s3UploadResult);
        setUploadProgress(0.8);
    
        const publishedReelay = await postReelayToDB(reelayDBBody);
        console.log('Saved Reelay to DB: ', publishedReelay);
        setUploadProgress(1.0);
        setUploadStage('upload-complete');
    
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

        const publishObj = {
            preparedReelay,
            reelayClubTitle, 
            reelayTopic
        };
        return publishObj;
    } catch (error) {
        setUploadProgress(0.0);
        setUploadStage('upload-failed-retry');
        
        logAmplitudeEventProd('uploadFailed', {
            username: creatorName,
            userSub: creatorSub,
        });
        return { error };
    }
}

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

const uploadReelayToS3 = async ({ 
    s3Client, 
    setUploadProgress, 
    setUploadStage, 
    videoURI, 
    videoS3Key,
}) => {
    try {
        console.log('beginning s3 upload: ', videoURI, videoS3Key);
        const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
        const videoBuffer = Buffer.from(videoStr, 'base64');
        setUploadProgress(0.4);
    
        let result;
        if (videoBuffer.byteLength < UPLOAD_CHUNK_SIZE) {
            result = await uploadToS3SinglePart({ 
                s3Client, 
                setUploadStage, 
                videoBuffer, 
                videoS3Key, 
            });
        } else {
            result = await uploadToS3Multipart({ 
                s3Client, 
                setUploadProgress, 
                setUploadStage, 
                videoBuffer, 
                videoS3Key,
            });
        }
        console.log('S3 upload complete');
        return result;    
    } catch (error) {
        console.log(error);
        return null;
    }
}

const uploadToS3SinglePart = async ({ s3Client, setUploadStage, videoBuffer, videoS3Key }) => {
    try {
        setUploadStage('uploading');
        return await s3Client.send(new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
            Body: videoBuffer,
        }));
    } catch (error) {
        console.log(error);
        return null;
    }
}

const uploadToS3Multipart = async ({ 
    s3Client, 
    setUploadProgress, 
    setUploadStage, 
    videoBuffer, 
    videoS3Key,
}) => {
    /**
     * AWS requires each part must be at least 5MB. In this method, each part
     * is exactly 5MB except the last chunk, which can be up to 10MB
     */

    try {
        console.log('Creating multipart upload command');
        const numParts = Math.floor(videoBuffer.byteLength / UPLOAD_CHUNK_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index);
    
        // note: the CreateMultipartUploadCommand takes a long time. unclear why
        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
        }));
        console.log('Completed create multipart upload command');

        setUploadStage('uploading');
        setUploadProgress(0.6);

        const videoBufferParts = partNumberRange.map((partNumber) => {
            console.log('start slicing video buffer #', partNumber);
            const byteBegin = partNumber * UPLOAD_CHUNK_SIZE;
            const byteEnd = (partNumber === numParts - 1)
                ? videoBuffer.byteLength
                : byteBegin + UPLOAD_CHUNK_SIZE;
            const slice = videoBuffer.slice(byteBegin, byteEnd);
            console.log('finish slicing video buffer #', partNumber);
            return slice;
        });
    
        await Promise.all(partNumberRange.map(async (partNumber) => {
            console.log('start upload part #', partNumber);
            const uploadPartResult = await s3Client.send(new UploadPartCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: `public/${videoS3Key}`,
                ContentType: 'video/mp4',
                Body: videoBufferParts[partNumber],
                PartNumber: partNumber + 1, // part numbers must be between 1 and 10,000
                UploadId: UploadId,
            }));
            console.log('complete upload part #', partNumber);
            return uploadPartResult;
        }));
        
        const uploadParts = await s3Client.send(new ListPartsCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            UploadId: UploadId,
        }));
            
        const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            UploadId: UploadId,
            MultipartUpload: uploadParts,
        }));
    
        return uploadCompleteStatus;
    
    } catch (error) {
        console.log(error);
        return null;
    }
}
