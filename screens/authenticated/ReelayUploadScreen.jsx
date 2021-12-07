import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UploadContext } from '../../context/UploadContext';
import { Auth, DataStore, Storage } from 'aws-amplify';

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

import BackButton from '../../components/utils/BackButton';
import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';
import ReelayPreviewOverlay from '../../components/overlay/ReelayPreviewOverlay';

import { Dimensions, Text, View, SafeAreaView, Pressable } from 'react-native';
import { Button } from 'react-native-elements';
import { Switch } from 'react-native-paper';
import * as Progress from 'react-native-progress';

import * as Amplitude from 'expo-analytics-amplitude';
import { sendStackPushNotificationToOtherCreators } from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { postReelayToDB } from '../../api/ReelayDBApi';

const { height, width } = Dimensions.get('window');
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const UploadScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    justify-content: flex-start;
    width: 100%;
`
const UploadTop = styled(View)`
    flex-direction: row;
    height: 60px;
    width: 100%;
`
const UploadTopLeft = styled(View)`
    flex-direction: row;
    margin: 10px;
    justify-content: flex-start;
    width: 50%;
`
const UploadVideoContainer = styled(Pressable)`
    align-self: center;
    border-radius: 10px;
    height: 75%;
    margin: 10px;
    overflow: hidden;
    width: 75%;
`

export default ReelayUploadScreen = ({ navigation, route }) => {

    const { titleObj, videoURI, venue } = route.params;

    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [playing, setPlaying] = useState(true);
    const [saveToDevice, setSaveToDevice] = useState(false);

    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadErrorStatus, setUploadErrorStatus] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const {
        chunksTotal, 
        chunksUploaded,
        setChunksTotal,
        setChunksUploaded,
        s3Client,
    } = useContext(UploadContext);

    useEffect(() => {
        (async () => {
            if (saveToDevice && !hasSavePermission) {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setHasSavePermission(status === "granted");
            }
        })();
    }, [saveToDevice]);


    const uploadReelayToS3 = async (videoURI, videoS3Key) => {
        const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
        const videoBuffer = Buffer.from(videoStr, 'base64');

        // let result;
        // if (videoBuffer.byteLength < UPLOAD_CHUNK_SIZE) {
        //     result = await uploadToS3SinglePart(videoBuffer, videoS3Key);
        // } else {
        //     result = await uploadToS3Multipart(videoBuffer, videoS3Key);
        // }
        const result = await uploadToS3SinglePart(videoBuffer, videoS3Key);

        console.log('Upload complete');
        return result;
    }

    const uploadToS3SinglePart = async (videoBuffer, videoS3Key) => {
        setChunksTotal(3);
        setChunksUploaded(1);

        const uploadResult = await s3Client.send(new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
            Body: videoBuffer,
        }));

        setChunksUploaded(3);
        return uploadResult;
    }

    const uploadToS3Multipart = async (videoBuffer, videoS3Key) => {
        const numParts = Math.floor(videoBuffer.byteLength / UPLOAD_CHUNK_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index + 1);

        setChunksUploaded(1);
        setChunksTotal(numParts + 1);

        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
        }));

        const uploadPartResults = await Promise.all(partNumberRange.map(async (partNumber) => {
            console.log('PART NUMBER: ', partNumber);

            const byteBegin = partNumber * UPLOAD_CHUNK_SIZE;
            const byteEnd = (partNumber === numParts)
                ? videoBuffer.byteLength
                : byteBegin + UPLOAD_CHUNK_SIZE;

            const result = await s3Client.send(new UploadPartCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: videoS3Key,
                ContentType: 'video/mp4',
                Body: videoBuffer.slice(byteBegin, byteEnd),
                PartNumber: partNumber,
                UploadId: UploadId,
            }));

            console.log('result completed');
            setChunksUploaded(chunksUploaded + 1);
            return result;
        }));

        console.log(uploadPartResults);

        const uploadParts = await s3Client.send(new ListPartsCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            UploadId: UploadId,
        }))
        
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

        if (saveToDevice) {
            if (!hasSavePermission) {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                const nextHasSavePermission = status === 'granted';
                setHasSavePermission(nextHasSavePermission);
                if (!nextHasSavePermission) return;
            }

            try {
                await MediaLibrary.saveToLibraryAsync(videoURI);
            } catch (error) {
                console.log('Could not save to local device...');
                Amplitude.logEventWithPropertiesAsync('saveToDeviceFailed', {
                    username: reelayDBUser.username,
                    title: titleObj.display,
                });
            }    
        }

        try {
            console.log('Upload dialog initiated.');
            // Set current user as the creator
    
            setUploading(true);

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
            
            setUploading(false);    
            setUploadComplete(true);

            console.log('saved new Reelay');
            console.log('Upload dialog complete.');

            Amplitude.logEventWithPropertiesAsync('publishReelayComplete', {
                username: reelayDBUser.username,
                userSub: reelayDBUser.sub,
                title: titleObj.display,
            });

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayApi

            // await sendStackPushNotificationToOtherCreators({
            //     creator: cognitoUser,
            //     reelay: { 
            //         ...reelay, 
            //         title: {
            //             id: reelay.tmdbTitleID 
            //         }
            //     },
            // });


        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadErrorStatus(true);
            setUploading(false);
            setUploadComplete(false);
            
            setChunksUploaded(0);
            setChunksTotal(0);

            Amplitude.logEventWithPropertiesAsync('uploadFailed', {
                username: reelayDBUser.username,
                title: titleObj.display,
            });
        }
    }

    const Retake = () => {
        const RetakeContainer = styled(Pressable)`
            height: 20px;
            top: 12px;
        `
        const RetakeText = styled(Text)`
            font-size: 20px;
            font-family: System;
            color: white;
        `
        return (
            <RetakeContainer onPress={() => { 
                Amplitude.logEventWithPropertiesAsync('retake', {
                    username: reelayDBUser.username,
                    title: titleObj.display,
                });
                navigation.pop();
            }}>
                <RetakeText>{'Retake'}</RetakeText>
            </RetakeContainer>
        );
    }

    const UploadStatus = () => {
        const UploadStatusContainer = styled(View)`
            height: 20px;
            position: absolute;
            right: ${width / 8}px;
            top: 12px;
        `
        const UploadStatusText = styled(Text)`
            font-size: 20px;
            font-family: System;
            color: white;
        `
        const StatusTextContainer = styled(View)`
            height: 30px;
            align-self: flex-end;
        `
        const PublishButton = styled(Pressable)`
            align-self: flex-end;
            height: 30px;
            margin: 10px;
        `

        const readyToPublish = (!uploading && !uploadComplete && !uploadErrorStatus);

        return (
            <UploadStatusContainer>
                { uploading && 
                    <StatusTextContainer>
                        <UploadStatusText>{'Uploading...'}</UploadStatusText>
                    </StatusTextContainer>
                }
                { uploadComplete && 
                    <StatusTextContainer>
                        <UploadStatusText>{'Uploaded'}</UploadStatusText>
                    </StatusTextContainer>
                }
                { uploadErrorStatus && 
                    <StatusTextContainer>
                        <UploadStatusText>{'Upload Error'}</UploadStatusText>
                    </StatusTextContainer>
                }
                { readyToPublish && <PublishButton onPress={publishReelay}>
                    <UploadStatusText>{'Publish'}</UploadStatusText>
                </PublishButton>}
            </UploadStatusContainer>
        );
    }

    const UploadOptions = () => {
        const UploadOptionsContainer = styled(View)`
            margin: 5px;
        `
        const UploadOptionItemContainer = styled(View)`
            height: 15px;
            width: 75%;
            margin-bottom: 20px;
            margin-left: 10px;
            flex-direction: row;
            justify-content: space-between;
        `
        const OptionText = styled(Text)`
            font-size: 17px;
            font-family: System;
            color: white;
            position: absolute;
            left: 12.5%;
        `
        const OptionSetter = styled(Pressable)`
            height: 100%;
            width: 100%;
            position: absolute;
            left:83.5%;
        `
        const SwitchContainer = styled(View)`
            height: 100%;
            width: 100%;
            position: absolute;
            left: 96%;
        `

        const toggleSaveToDevice = () => {
            setSaveToDevice(!saveToDevice);
        }

        return (
            <UploadOptionsContainer>
                <UploadOptionItemContainer>
                    <OptionText>{'Who can see'}</OptionText>
                    <OptionSetter>
                        <OptionText>{'Public'}</OptionText>
                    </OptionSetter>
                </UploadOptionItemContainer>
                <UploadOptionItemContainer>
                    <OptionText>{'Save to Device'}</OptionText>
                    <SwitchContainer>
                        <Switch value={saveToDevice} onValueChange={toggleSaveToDevice} color={'#db1f2e'} />
                    </SwitchContainer>
                </UploadOptionItemContainer>
            </UploadOptionsContainer>
        );
    }

    const UploadProgressBar = () => {
        const UploadProgressBarContainer = styled(View)`
            align-self: center;
            height: 10px;
            margin: 15px;
            justify-content: center;
            width: 75%;
        `
        const indeterminate = chunksUploaded == 0 && uploading;

        // +1 prevents NaN error. hacky.
        let progress = chunksUploaded / (chunksTotal + 1);
        if (!chunksUploaded == 0 && chunksUploaded == chunksTotal) {
            progress = 1;
        }
    
        return (
            <UploadProgressBarContainer>
                { (uploading || uploadComplete) && 
                    <Progress.Bar color={'white'} indeterminate={indeterminate} progress={progress} width={width * 0.75} />
                }
            </UploadProgressBarContainer>
        );
    }

    const DoneButton = () => {

        const DoneButtonMargin = styled(View)`
            align-self: center;
            height: 40px;
            margin: 10px;
            width: 60%;
        `
        const exitCreate = ({ navigation }) => {
            setUploading(false);
            setUploadComplete(false);

            setChunksUploaded(0);
            setChunksTotal(0);

            navigation.popToTop();
            navigation.navigate('HomeFeedScreen', { forceRefresh: true });
        }

        return (
            <DoneButtonMargin>
                { uploadComplete &&
                    <Button 
                        buttonStyle={{ borderColor: 'white' }}
                        titleStyle={{ color: 'white' }}
                        onPress={() => exitCreate({ navigation })}
                        title='Done' type='outline' />
                }
            </DoneButtonMargin>
        );
    }

    const playPause = () => playing ? setPlaying(false) : setPlaying(true);

    return (
        <UploadScreenContainer>
            <UploadTop>
                { !uploading && !uploadComplete &&
                    <UploadTopLeft>
                        <BackButton navigation={navigation} />
                        <Retake />          
                    </UploadTopLeft>          
                }
                <UploadStatus />
            </UploadTop>
            <UploadProgressBar />
            <UploadVideoContainer onPress={playPause}>
                <PreviewVideoPlayer videoURI={videoURI} playing={playing} />
                <ReelayPreviewOverlay titleObj={titleObj} venue={venue} />
            </UploadVideoContainer>
            { !uploadComplete && !uploading && <UploadOptions /> }
            { uploadComplete && <DoneButton /> }
        </UploadScreenContainer>
    );
};