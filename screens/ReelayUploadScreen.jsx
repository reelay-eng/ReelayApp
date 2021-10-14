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
import { Button } from 'react-native-elements';
import { Switch } from 'react-native-paper';
import * as Progress from 'react-native-progress';

import * as Amplitude from 'expo-analytics-amplitude';
import { sendStackPushNotificationToOtherCreators } from '../api/NotificationsApi';

import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');
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

export default ReelayUploadScreen = ({ navigation }) => {

    const [hasSavePermission, setHasSavePermission] = useState(null);
    const [playing, setPlaying] = useState(true);
    const [saveToDevice, setSaveToDevice] = useState(false);

    const authContext = useContext(AuthContext);
    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;
    const venue = uploadContext.venueSelected;
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
                venue: venue,
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

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayApi
            await sendStackPushNotificationToOtherCreators({
                creator: authContext.user,
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
                    username: authContext.user.username,
                    title: titleObject.title ? titleObject.title : titleObject.name,
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
            align-self: center;
            height: 10px;
            margin: 15px;
            justify-content: center;
            width: 75%;
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
                { (uploadContext.uploading || uploadContext.uploadComplete) && 
                    <Progress.Bar color={'white'} indeterminate={indeterminate} progress={progress} width={width * 0.75} />
                }
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
                        <Switch value={saveToDevice} onValueChange={toggleSaveToDevice} color={'#db1f2e'} />
                    </SwitchContainer>
                </UploadOptionItemContainer>
            </UploadOptionsContainer>
        );
    }

    const DoneButton = () => {

        const DoneButtonMargin = styled(View)`
            align-self: center;
            height: 40px;
            margin: 10px;
            width: 60%;
        `
        const DoneText = styled(Text)`
            align-self: center;
            font-size: 18px;
            font-family: System;
            color: white;
        `

        const exitCreate = ({ navigation }) => {
            uploadContext.setUploading(false);
            uploadContext.setUploadComplete(false);
            uploadContext.setUploadErrorStatus(false);

            uploadContext.setChunksUploaded(0);
            uploadContext.setChunksTotal(0);
            uploadContext.setUploadVideoSource('');
            uploadContext.setUploadTitleObject({});

            navigation.popToTop();
            navigation.navigate('HomeFeedScreen', { forceRefresh: true });
        }

        return (
            <DoneButtonMargin>
                { uploadContext.uploadComplete &&
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
                { !uploadContext.uploading && !uploadContext.uploadComplete &&
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
                <ReelayPreviewOverlay titleObject={titleObject} />
            </UploadVideoContainer>
            { !uploadContext.uploadComplete && !uploadContext.uploading && <UploadOptions /> }
            { uploadContext.uploadComplete && <DoneButton /> }
        </UploadScreenContainer>
    );
};