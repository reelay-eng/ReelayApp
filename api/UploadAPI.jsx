import { PutObjectCommand } from '@aws-sdk/client-s3';

import {
    notifyClubMembersOnReelayPosted,
    notifyOtherCreatorsOnReelayPosted, 
    notifyMentionsOnReelayPosted,
    notifyTopicCreatorOnReelayPosted,
} from './NotificationsApi';

import Constants from 'expo-constants';
import { postReelayToDB, prepareReelay } from './ReelayDBApi';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';

import { compressVideoForUpload, deviceCanCompress } from './FFmpegApi';

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;

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
        let uploadVideoURI = videoURI;
        // if (deviceCanCompress) {
        //     const { error, outputURI, parsedSession } = await compressVideoForUpload(videoURI);
        //     if (!error) uploadVideoURI = outputURI;
        // }

        // todo: get this working ^^
        
        console.log('beginning s3 upload: ', uploadVideoURI, videoS3Key);
        const videoFetched = await fetch(uploadVideoURI);
        const videoBlob = await videoFetched.blob();

        setUploadProgress(0.4);

        setUploadStage('uploading');
        const result = await s3Client.send(new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
            Body: videoBlob,
        }));

        console.log('S3 upload complete');
        return result;    
    } catch (error) {
        console.log(error);
        return null;
    }
}
