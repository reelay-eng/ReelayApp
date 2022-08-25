import { S3 } from 'aws-sdk';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import AWSExports from '../src/aws-exports';

import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

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
const S3_UPLOAD_QUEUE_SIZE = 3;

const getS3Instance = async () => {
    const getCredentials = fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ 
            region: AWSExports.aws_cognito_region 
        }),
        identityPoolId: AWSExports.aws_cognito_identity_pool_id,
    });

    const credentials = await getCredentials();
    const region = AWSExports.aws_project_region;
    console.log('s3 credentials: ', credentials);
    return new S3({ credentials, region });
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

        setUploadProgress(PROGRESS_PRE_S3_UPLOAD);
        setUploadStage('uploading');

        const uploadCommand = new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: `public/${videoS3Key}`,
            ContentType: 'video/mp4',
            Body: videoBlob,    
        });

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

                console.log('next upload progress: ', progress);
                setUploadProgress(progress);
                setTimeout(updateProgress, nextTickDuration);
            }
        }

        updateProgress();
        await s3Client.send(uploadCommand);
        shouldUpdateProgress = false;
        onUploadComplete();

        // const s3Instance = await getS3Instance();
        // const upload = new S3.ManagedUpload({
        //     params: {
                // Bucket: S3_UPLOAD_BUCKET,
                // Key: `public/${videoS3Key}`,
                // ContentType: 'video/mp4',
                // Body: videoBlob,    
        //     },
        //     partSize: S3_UPLOAD_PART_SIZE,
        //     queueSize: S3_UPLOAD_QUEUE_SIZE,
        //     service: s3Instance,
        // });

        // const onUploadProgress = ({ loaded, total }) => {
        //     const progressRatio = loaded / total;
        //     const progress = PROGRESS_PRE_S3_UPLOAD + (progressRatio * PROGRESS_S3_UPLOAD_RANGE);
        //     setUploadProgress(progress);
        // }

        // upload.send(onUploadComplete);
        // upload.on('httpUploadProgress', onUploadProgress);

    } catch (error) {
        console.log('upload failed in try catch: ', error);
        onUploadFailed();
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
