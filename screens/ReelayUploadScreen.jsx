import React, { useContext } from 'react';
import { UploadContext } from '../context/UploadContext';
import { Auth, DataStore, Storage } from 'aws-amplify';
import { Reelay } from '../src/models';

import VideoPlayer from '../components/view-reelay/VideoPlayer';
import ReelayPreviewOverlay from '../components/overlay/ReelayPreviewOverlay';

import { Dimensions, Text, View, SafeAreaView, Pressable } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { ProgressBar } from 'react-native-paper';

import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const UploadScreenContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
`
const UploadTop = styled(View)`
    flex: 1;
    flex-direction: row;
    height: 30px;
`
const UploadTopLeft = styled(View)`
    flex: 1;
    flex-direction: row;
    justify-content: flex-start;
    width: ${width / 2}px;
    margin: 10px;
`

// const UploadTopRight = styled(View)`
//     width: ${width / 2}px;
//     margin: 10px;
// `

const UploadVideoContainer = styled(View)`
    height: 75%;
    width: 75%;
    margin: 10px;
    align-self: center;
`

export default ReelayUploadScreen = ({ navigation }) => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.titleObject;
    const videoSource = uploadContext.uploadVideoSource;

    const publishReelay = async () => {
        if (!uploadContext.videoSource) {
            console.log('No video to upload.');
            return;
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
            const videoResponse = await fetch(videoSource);
            const videoData = await videoResponse.blob();

            uploadContext.setUploading(true);
            const uploadStatusS3 = await Storage.put(videoS3Key, videoData, {
                progressCallback(progress) {
                    console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                    uploadContext.setUploadedChunks(progress.loaded);
                    uploadContext.setTotalChunks(progress.total);
                }
            });

            console.log(uploadStatusS3);
            console.log('Successfully saved video to S3: ', videoS3Key);

            uploadContext.setUploading(false);

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
                visibility: 'global',
            });

            // Upload Reelay object to DynamoDB, get ID
            const uploadStatusDataStore = await DataStore.save(reelay);
            uploadContext.setUploadComplete(true);

            console.log('saved new Reelay');
            console.log(uploadStatusDataStore);
            console.log('Upload dialog complete.');


        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            uploadContext.setUploadErrorStatus(true);
        }

    }

    const BackButton = () => {
        const BackButtonContainer = styled(Pressable)`
            height: 30px;
            width: 30px;
            margin: 10px;
        `
        return (
            <BackButtonContainer onPress={() => { navigation.pop() }}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} />
            </BackButtonContainer>
        );
    }

    const PageTitle = () => {
        const PageTitleContainer = styled(View)`
            height: 30px;
            margin: 10px;
            margin-top: 12px;
            margin-left: 0px;
        `
        const PageTitleText = styled(Text)`
            font-size: 20;
            font-family: System;
            color: white;
        `
        return (
            <PageTitleContainer>
                <PageTitleText>{'Preview'}</PageTitleText>
            </PageTitleContainer>
        );
    }

    const UploadStatus = () => {
        const UploadStatusContainer = styled(View)`
            height: 30px;
            margin: 10px;
        `
        const UploadStatusText = styled(Text)`
            font-size: 20;
            font-family: System;
            color: white;
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
                { uploadContext.uploading && <UploadStatusText>{'Uploading...'}</UploadStatusText>}
                { uploadContext.uploadComplete && <UploadStatusText>{'Uploaded'}</UploadStatusText>}
                { uploadContext.uploadErrorStatus && <UploadStatusText>{'Upload Error'}</UploadStatusText>}
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

        // +1 prevents NaN error. hacky.
        let progress = chunksUploaded / (chunksTotal + 1);
        if (chunksUploaded != 0 && chunksUploaded == chunksTotal) {
            progress = 1;
        }
    
        return (
            <UploadProgressBarContainer>
                <ProgressBar progress={progress} color={'white'} />
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
            margin: 5px;
        `
        const OptionText = styled(Text)`
            font-size: 16px;
            font-family: System;
        `
        const OptionSetter = styled(Pressable)`
            height: 100%;
            width: 100%;
        `

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
                    <OptionSetter>
                        <OptionText>{'No'}</OptionText>
                    </OptionSetter>
                </UploadOptionItemContainer>
            </UploadOptionsContainer>
        );
    }

    const DoneButton = () => {

        const DoneButtonMargin = styled(View)`
            height: 30px;
            width: 75%;
            margin: 10px;
        `
        const DoneText = styled(Text)`
            font-size: 18px;
            font-family: System;
        `
        const DoneButtonContainer = styled(Pressable)``

        const exitCreate = ({ navigation }) => {
            uploadContext.setUploading(false);
            uploadContext.setUploadComplete(false);
            uploadContext.setUploadErrorStatus(false);

            uploadContext.setUploadedChunks(0);
            uploadContext.setTotalChunks(0);
            uploadContext.setUploadVideoSource('');
            uploadContext.setTitleObject({});

            navigation.popToTop();
            navigation.navigate('HomeFeedScreen');
        }

        return (
            <DoneButtonMargin>
                <DoneButtonContainer 
                    onPress={() => exitCreate({ navigation })}>
                    <DoneText>{'Done'}/</DoneText>
                </DoneButtonContainer>
            </DoneButtonMargin>
        );
    }

    return (
        <UploadScreenContainer>
            <UploadTop>
                <UploadTopLeft>
                    <BackButton />
                    <PageTitle />
                </UploadTopLeft>
                <UploadStatus />
            </UploadTop>
            <UploadProgressBar />
            <UploadVideoContainer>
                <VideoPlayer 
                    videoURI={videoSource} 
                    poster={null} 
                    isPlay={true}>
                    <ReelayPreviewOverlay />
                </VideoPlayer>
            </UploadVideoContainer>
            { !uploadContext.uploadComplete && <UploadOptions />}
            { uploadContext.uploadComplete && <DoneButton />}
        </UploadScreenContainer>
    );
};