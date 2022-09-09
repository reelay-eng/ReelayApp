import Constants from 'expo-constants';
import { getThumbnailAsync } from "expo-video-thumbnails";
import { Buffer } from 'buffer';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { EncodingType, readAsStringAsync } from 'expo-file-system';

const CLOUDFRONT_THUMBNAIL_URL = Constants.manifest.extra.cloudfrontThumbnailUrl;
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3ThumbnailBucket;
const THUMBNAIL_QUALITY = 0.5;

export const getThumbnailURI = (reelay) => {
    return `${CLOUDFRONT_THUMBNAIL_URL}/thumbnails/reelay-${reelay?.sub}`;
}

export const getThumbnailS3Key = (reelay) => {
    return `thumbnails/reelay-${reelay?.sub}`;
}

export const generateThumbnail = async (reelay) => {
    const tryTimecodesMillis = [3000, 1000, 100];
    let timecodeIndex = 0;
    while (timecodeIndex < tryTimecodesMillis.length) {
        try {
            const thumbnailTimecode = tryTimecodesMillis[timecodeIndex];
            const source = reelay?.content?.videoURI;
            const options = { time: thumbnailTimecode, quality: THUMBNAIL_QUALITY };
            const thumbnailObj = await getThumbnailAsync(source, options);
            return thumbnailObj;
        } catch (error) {
            console.warn(error);
            timecodeIndex++;
        }
    }
    return { error: 'Could not generate thumbnail' };
}

export const saveThumbnail = async (reelay, s3Client, thumbnailObj) => {
    const imageStr = await readAsStringAsync(thumbnailObj?.uri, { encoding: EncodingType.Base64 });
    const imageBuffer = Buffer.from(imageStr, 'base64');

    const s3Key = getThumbnailS3Key(reelay);
    const uploadResult = await uploadToS3SinglePart(imageBuffer, s3Client, s3Key);
    // todo: write boolean to reelay obj: thumbnailExists
}

const uploadToS3SinglePart = async (imageBuffer, s3Client, s3Key) => {
    const uploadResult = await s3Client.send(new PutObjectCommand({
        Bucket: S3_UPLOAD_BUCKET,
        Key: s3Key,
        ContentType: 'image/jpeg',
        Body: imageBuffer,
    }));

    return uploadResult;
}
