import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UploadContext } from '../context/UploadContext';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { Reelay } from '../src/models';

import Constants from 'expo-constants';
import * as MediaLibrary from 'expo-media-library';

import BackButton from '../components/utils/BackButton';
import PreviewVideoPlayer from '../components/create-reelay/PreviewVideoPlayer';
import ReelayPreviewOverlay from '../components/overlay/ReelayPreviewOverlay';

import { Dimensions, Text, View, SafeAreaView, Pressable } from 'react-native';
import { ProgressBar, Switch } from 'react-native-paper';

import styled from 'styled-components/native';

import * as Amplitude from 'expo-analytics-amplitude';

const { height, width } = Dimensions.get('window');
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const UploadScreenContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
    background-color: black;
`
const UploadTop = styled(View)`
    flex: 0.7;
    flex-direction: row;
    height: 20px;
`
const UploadTopLeft = styled(View)`
    flex: 1;
    flex-direction: row;
    justify-content: flex-start;
    width: ${width / 2}px;
    margin: 10px;
`
const UploadVideoContainer = styled(View)`
    height: 75%;
    width: 75%;
    margin: 10px;
    align-self: center;
    border-radius: 10px;
    overflow: hidden;
`

export default ReelayUploadScreen = ({ navigation }) => {

    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [saveToDevice, setSaveToDevice] = useState(false);

    const authContext = useContext(AuthContext);
    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;
    const videoURI = uploadContext.uploadVideoSource;

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
            username: authContext.user.username,
            title: titleObject.title ? titleObject.title : titleObject.name,
        });

        if (saveToDevice && !hasSavePermission) {
            try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                setHasSavePermission(status === "granted");
                MediaLibrary.saveToLibraryAsync(videoURI);
            } catch (error) {
                console.log('Could not save to local device...');
                Amplitude.logEventWithPropertiesAsync('saveToDeviceFailed', {
                    username: authContext.user.username,
                    title: titleObject.title ? titleObject.title : titleObject.name,
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
    
            // Upload video to S3
            const videoResponse = await fetch(videoURI);
            const videoData = await videoResponse.blob();

            uploadContext.setUploading(true);
            const uploadStatusS3 = await Storage.put(videoS3Key, videoData, {
                progressCallback(progress) {
                    if (progress && progress.loaded && progress.total) {
                        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                        uploadContext.setChunksUploaded(progress.loaded);
                        uploadContext.setChunksTotal(progress.total);    
                    } else {
                        console.log('Progress callback missing values.');
                    }
                }
            });

            console.log(uploadStatusS3);
            console.log('Successfully saved video to S3: ', videoS3Key);


            // Create Reelay object
            const reelay = new Reelay({
                owner: creator.attributes.sub,
                creatorID: creator.attributes.sub,
                isMovie: titleObject.is_movie,
                isSeries: titleObject.is_series,
                movieID: titleObject.id.toString(),
                seriesSeason: -1,
                seasonEpisode: -1,
                uploadedAt: new Date().toISOString(),
                tmdbTitleID: titleObject.id.toString(),
                videoS3Key: videoS3Key,
                visibility: UPLOAD_VISIBILITY,
            });

            // Upload Reelay object to DynamoDB, get ID
            const uploadStatusDataStore = await DataStore.save(reelay);
            
            uploadContext.setUploading(false);
            uploadContext.setUploadComplete(true);

            console.log('saved new Reelay');
            console.log(uploadStatusDataStore);
            console.log('Upload dialog complete.');

            Amplitude.logEventWithPropertiesAsync('publishReelayComplete', {
                username: authContext.user.username,
                title: titleObject.title ? titleObject.title : titleObject.name,
            });


        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            uploadContext.setUploadErrorStatus(true);
            uploadContext.setUploading(false);
            uploadContext.setUploadComplete(false);
            
            uploadContext.setChunksUploaded(0);
            uploadContext.setChunksTotal(0);

            Amplitude.logEventWithPropertiesAsync('uploadFailed', {
                username: authContext.user.username,
                title: titleObject.title ? titleObject.title : titleObject.name,
            });
        }
    }

    const PageTitle = () => {
        const PageTitleContainer = styled(Pressable)`
            height: 20px;
            margin-top: 12px;
            margin-left: 0px;
        `
        const PageTitleText = styled(Text)`
            font-size: 20px;
            font-family: System;
            color: white;
        `
        return (
            <PageTitleContainer onPress={() => { 
                Amplitude.logEventWithPropertiesAsync('retake', {
                    username: authContext.user.username,
                    title: titleObject.title ? titleObject.title : titleObject.name,
                });
                navigation.pop();
            }}>
                <PageTitleText>{'Retake'}</PageTitleText>
            </PageTitleContainer>
        );
    }

    const UploadStatus = () => {
        const UploadStatusContainer = styled(View)`
            height: 40px;
            margin: 10px;
        `
        const UploadStatusText = styled(Text)`
            font-size: 20px;
            font-family: System;
            color: white;
        `
        const StatusTextContainer = styled(View)`
            height: 30px;
            margin: 10px;
            align-self: flex-end;
            right: 10px;
        `
        const PublishButton = styled(Pressable)`
            height: 30px;
            margin: 10px;
            align-self: flex-end;
            right: 10px;
        `

        const readyToPublish = 
            (!uploadContext.uploading) && 
            (!uploadContext.uploadComplete) && 
            (!uploadContext.uploadErrorStatus);

        return (
            <UploadStatusContainer>
                { uploadContext.uploading && 
                    <StatusTextContainer>
                        <UploadStatusText>{'Uploading...'}</UploadStatusText>
                    </StatusTextContainer>
                }
                { uploadContext.uploadComplete && 
                    <StatusTextContainer>
                        <UploadStatusText>{'Uploaded'}</UploadStatusText>
                    </StatusTextContainer>
                }
                { uploadContext.uploadErrorStatus && 
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

    const UploadProgressBar = () => {
        const UploadProgressBarContainer = styled(View)`
            height: 10px;
            width: 75%;
            margin: 10px;
            align-self: center;
        `

        const chunksUploaded = uploadContext.chunksUploaded;
        const chunksTotal = uploadContext.chunksTotal;    
        const indeterminate = chunksUploaded == 0 && uploadContext.uploading;

        // +1 prevents NaN error. hacky.
        let progress = chunksUploaded / (chunksTotal + 1);
        if (!chunksUploaded == 0 && chunksUploaded == chunksTotal) {
            progress = 1;
        }
    
        return (
            <UploadProgressBarContainer>
                <ProgressBar indeterminate={indeterminate} progress={progress} color={'white'} />
            </UploadProgressBarContainer>
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
                        <Switch value={saveToDevice} onValueChange={toggleSaveToDevice} color={'#b83636'} />
                    </SwitchContainer>
                </UploadOptionItemContainer>
            </UploadOptionsContainer>
        );
    }

    const DoneButton = () => {

        const DoneButtonMargin = styled(View)`
            height: 20px;
            width: 75%;
            margin: 10px;
            align-self: center;
        `
        const DoneText = styled(Text)`
            font-size: 18px;
            font-family: System;
            align-self: center;
            color: white;
        `
        const DoneButtonContainer = styled(Pressable)``

        const exitCreate = ({ navigation }) => {
            uploadContext.setUploading(false);
            uploadContext.setUploadComplete(false);
            uploadContext.setUploadErrorStatus(false);

            uploadContext.setChunksUploaded(0);
            uploadContext.setChunksTotal(0);
            uploadContext.setUploadVideoSource('');
            uploadContext.setUploadTitleObject({});

            navigation.popToTop();
            navigation.navigate('HomeFeedScreen');
        }

        return (
            <DoneButtonMargin>
                <DoneButtonContainer 
                    onPress={() => exitCreate({ navigation })}>
                    <DoneText>{'Done'}</DoneText>
                </DoneButtonContainer>
            </DoneButtonMargin>
        );
    }

    return (
        <UploadScreenContainer>
            <UploadTop>
                <UploadTopLeft>
                    <BackButton navigation={navigation} />
                    <PageTitle />
                </UploadTopLeft>
                <UploadStatus />
            </UploadTop>
            { uploadContext.uploading && <UploadProgressBar /> }
            <UploadVideoContainer>
                <PreviewVideoPlayer videoURI={videoURI} playing={true} />
                <ReelayPreviewOverlay />
            </UploadVideoContainer>
            { !uploadContext.uploadComplete && !uploadContext.uploading && <UploadOptions /> }
            { uploadContext.uploadComplete && <DoneButton /> }
        </UploadScreenContainer>
    );
};