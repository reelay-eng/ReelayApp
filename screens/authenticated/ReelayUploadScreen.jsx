import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UploadContext } from '../../context/UploadContext';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { Reelay } from '../../src/models';

import { EncodingType, readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';
import { 
    S3Client,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    ListMultipartUploadsCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
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
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024;
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

    const { cognitoUser } = useContext(AuthContext);
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

    const publishReelay = async () => {
        if (!videoURI) {
            console.log('No video to upload.');
            return;
        }

        Amplitude.logEventWithPropertiesAsync('publishReelayStarted', {
            username: cognitoUser.username,
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
                    username: cognitoUser.username,
                    title: titleObj.display,
                });
            }    
        }

        try {
            console.log('Upload dialog initiated.');
            // Set current user as the creator
            const creator = await Auth.currentAuthenticatedUser();
            console.log(creator.attributes.sub);
    
            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const videoS3Key = 'reelayvid-' + creator.attributes.sub + '-' + Date.now() + '.mp4';
            const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
            const videoBuffer = Buffer.from(videoStr, 'base64');
            console.log('BYTE LENGTH: ', videoBuffer.byteLength);
    
            setUploading(true);
            // const uploadStatusS3 = await Storage.put(videoS3Key, videoData, {
            //     progressCallback(progress) {
            //         if (progress && progress.loaded && progress.total) {
            //             console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            //             setChunksUploaded(progress.loaded);
            //             setChunksTotal(progress.total);    
            //         } else {
            //             console.log('Progress callback missing values.');
            //         }
            //     }
            // });

            const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: `public/${videoS3Key}`,
            }));

            const numParts = videoBuffer.byteLength / UPLOAD_CHUNK_SIZE + 1;

            let partNumber;
            for (partNumber = 1; partNumber <= numParts; partNumber += 1) {
                const byteBegin = partNumber * UPLOAD_CHUNK_SIZE;
                const byteEnd = (partNumber === numParts)
                    ? videoBuffer.byteLength
                    : byteBegin + UPLOAD_CHUNK_SIZE;

                console.log('PART NUMBER: ', partNumber);


                const uploadPartStatus = await s3Client.send(new UploadPartCommand({
                    Body: videoBuffer.slice(byteBegin, byteEnd),
                    Bucket: S3_UPLOAD_BUCKET,
                    Key: `public/${videoS3Key}`,
                    PartNumber: partNumber,
                    UploadId: UploadId,
                }));
                console.log(uploadPartStatus);
            }

            const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: `public/${videoS3Key}`,
                UploadId: UploadId,
            }));

            console.log(uploadCompleteStatus);

            setUploading(false);
            return;

            // Create Reelay object for Amplify --> we're getting rid of this
            const reelay = new Reelay({
                owner: creator.attributes.sub,
                creatorID: creator.attributes.sub,
                isMovie: titleObj.isMovie,
                isSeries: titleObj.isSeries,
                movieID: titleObj.id.toString(),
                seriesSeason: -1,
                seasonEpisode: -1,
                uploadedAt: new Date().toISOString(),
                tmdbTitleID: titleObj.id.toString(),
                venue: venue,
                videoS3Key: videoS3Key,
                visibility: UPLOAD_VISIBILITY,
            });

            // Upload Reelay object to Amplfiy, get ID
            const datastoreReelay = await DataStore.save(reelay);
            console.log('Saved Reelay to datastore: ', datastoreReelay);

            // Post Reelay object to ReelayDB --> we're moving to this
            const reelayDBBody = {
                creatorSub: datastoreReelay.creatorID,
                creatorName: cognitoUser.username,
                datastoreSub: datastoreReelay.id,
                isMovie: datastoreReelay.isMovie,
                isSeries: datastoreReelay.isSeries,
                postedAt: datastoreReelay.uploadedAt,
                tmdbTitleID: datastoreReelay.tmdbTitleID,
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
                username: cognitoUser.username,
                title: titleObj.display,
            });

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayApi
            await sendStackPushNotificationToOtherCreators({
                creator: cognitoUser,
                reelay: { 
                    ...reelay, 
                    title: {
                        id: reelay.tmdbTitleID 
                    }
                },
            });


        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadErrorStatus(true);
            setUploading(false);
            setUploadComplete(false);
            
            setChunksUploaded(0);
            setChunksTotal(0);

            Amplitude.logEventWithPropertiesAsync('uploadFailed', {
                username: cognitoUser.username,
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
                    username: cognitoUser.username,
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