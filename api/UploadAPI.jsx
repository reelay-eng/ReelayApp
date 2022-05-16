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

import {
    notifyOtherCreatorsOnReelayPosted, 
    notifyMentionsOnReelayPosted,
    notifyTopicCreatorOnReelayPosted,
} from './NotificationsApi';
// import { notifyOnReelayedRec } from '../../api/WatchlistNotifications';

import Constants from 'expo-constants';
import { postReelayToDB, prepareReelay } from './ReelayDBApi';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;


export const uploadReelay = async ({ 
    destination,
    reelayDBBody, 
    reelayTopic,
    pushToGlobalTopics,
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
        });

        setUploadStage('uploading');
        setUploadProgress(0.2);
    
        const s3UploadResult = await uploadReelayToS3({ 
            s3Client, 
            setUploadProgress, 
            videoURI, 
            videoS3Key,
        });
        console.log('Saved Reelay to S3: ', s3UploadResult);
        setUploadProgress(0.8);
    
        const dbUploadResult = await postReelayToDB(reelayDBBody);
        console.log('Saved Reelay to DB: ', dbUploadResult);
        setUploadProgress(1.0);
        setUploadStage('upload-complete');

        setTimeout(() => {
            setUploadStage('none');
            setUploadProgress(0.0);
        }, 3000);
    
        console.log('saved new Reelay');
        console.log('Upload dialog complete.');
    
        logAmplitudeEventProd('publishReelayComplete', {
            username: creatorName,
            userSub: creatorSub,
            destination,
        });

        const preparedReelay = await prepareReelay(reelayDBBody);
        preparedReelay.likes = [];
        preparedReelay.comments = [];    

        if (reelayTopic) {
            reelayTopic.reelays = [preparedReelay, ...reelayTopic.reelays];
            pushToGlobalTopics(reelayTopic);
        }
    
        await sendNotificationsOnUpload({ preparedReelay, reelayTopic });     
    } catch (error) {
        setUploadProgress(0.0);
        setUploadStage('upload-failed-retry');
        
        logAmplitudeEventProd('uploadFailed', {
            username: creatorName,
            userSub: creatorSub,
        });
    }
}

const sendNotificationsOnUpload = async ({ preparedReelay, reelayTopic }) => {
    const { creator } = preparedReelay;
    const mentionedUsers = await notifyMentionsOnReelayPosted({
        creator,
        reelay: preparedReelay,
    });

    notifyOtherCreatorsOnReelayPosted({
        creator,
        reelay: preparedReelay,
        topic: reelayTopic ?? null,
        mentionedUsers: mentionedUsers,
    });

    // notifyOnReelayedRec({ 
    //     creatorSub: reelayDBUser?.sub,
    //     creatorName: reelayDBUser?.username,
    //     reelay: preparedReelay,
    //     watchlistItems: myWatchlistItems,
    // });

    if (reelayTopic) {
        reelayTopic.reelays = [preparedReelay, ...reelayTopic.reelays];
        notifyTopicCreatorOnReelayPosted({
            creator,
            reelay: preparedReelay,
            topic: reelayTopic,
        });
    }
}

const uploadReelayToS3 = async ({ s3Client, setUploadProgress, videoURI, videoS3Key }) => {
    console.log('beginning s3 upload: ', videoURI, videoS3Key);
    const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
    const videoBuffer = Buffer.from(videoStr, 'base64');
    setUploadProgress(0.4);

    let result;
    if (videoBuffer.byteLength < UPLOAD_CHUNK_SIZE) {
        result = await uploadToS3SinglePart({ s3Client, videoBuffer, videoS3Key });
    } else {
        result = await uploadToS3Multipart({ s3Client, setUploadProgress, videoBuffer, videoS3Key });
    }

    console.log('S3 upload complete');
    return result;
}

const uploadToS3SinglePart = async ({ s3Client, videoBuffer, videoS3Key }) => {
    const uploadResult = await s3Client.send(new PutObjectCommand({
        Bucket: S3_UPLOAD_BUCKET,
        Key: `public/${videoS3Key}`,
        ContentType: 'video/mp4',
        Body: videoBuffer,
    }));

    return uploadResult;
}

const uploadToS3Multipart = async ({ s3Client, setUploadProgress, videoBuffer, videoS3Key }) => {
    /**
     * AWS requires each part must be at least 5MB. In this method, each part
     * is exactly 5MB except the last chunk, which can be up to 10MB
     */

    try {
        console.log('Beginning multipart upload');
        const numParts = Math.floor(videoBuffer.byteLength / UPLOAD_CHUNK_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index);
    
        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
        }));
    
        console.log('Completed create multipart upload command: ');
    
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
                Key: `public/${videoS3Key}`,
                ContentType: 'video/mp4',
                Body: videoBuffer.slice(byteBegin, byteEnd),
                PartNumber: partNumber + 1, // part numbers must be between 1 and 10,000
                UploadId: UploadId,
            }));
    
            console.log('result completed');
            return result;
        }));
    
        // console.log(uploadPartResults);
    
        const uploadParts = await s3Client.send(new ListPartsCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            UploadId: UploadId,
        }));
        
        console.log('UPLOAD PARTS: ', uploadParts);
        console.log('about to complete upload');
    
        const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            UploadId: UploadId,
            MultipartUpload: uploadParts,
        }));
    
        return uploadCompleteStatus;
    
    } catch (error) {
        console.log(error);
    }
}
