import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { TextStyles } from '../../styles';
import { ProgressBar } from 'react-native-paper';

import { useDispatch, useSelector } from 'react-redux';
import { Auth, DataStore, Storage, progressCallback } from 'aws-amplify';
import { Reelay } from '../../src/models';
import { ReelayUploadStatus, setUploadStatus } from '../../components/create-reelay/CreateReelaySlice';

const UploadProgressBar = ({ navigation }) => {

    const titleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);
    const uploadStatus = useSelector((state) => state.createReelay.upload.uploadStatus);
    const chunksUploaded = useSelector((state) => state.createReelay.upload.chunksUploaded);
    const chunksTotal = useSelector((state) => state.createReelay.upload.chunksTotal);

    const progress = chunksUploaded / chunksTotal;
    const visible = uploadStatus == (ReelayUploadStatus.UPLOAD_STAGED || ReelayUploadStatus.UPLOAD_IN_PROGRESS);

    const dispatch = useDispatch();

    useEffect(() => {
        if (videoSource && uploadStatus == ReelayUploadStatus.UPLOAD_STAGED) {
            uploadReelay();
        }
    }, [navigation]);

    const uploadReelay = async () => {
        if (!videoSource) {
          console.log('No video to upload.')
        } else {
            console.log('Upload dialog initiated.');
            // Set current user as the creator
            const creator = await Auth.currentAuthenticatedUser();
            console.log(creator.attributes.sub);
            const videoS3Key = 'reelayvid-' + creator.attributes.sub + '-' + Date.now();

            try {
                // Upload video to S3
                const response = await fetch(videoSource);
                const blob = await response.blob();
                await Storage.put(videoS3Key, blob, {
                    contentType: 'video/mp4',
                    progressCallback(progress) {
                        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                        dispatch(setUploadStatus({
                            chunksUploaded: progress.loaded,
                            chunksTotal: progress.total,
                            uploadStatus: ReelayUploadStatus.UPLOAD_IN_PROGRESS,
                        }));
                    }
                }).then(() => {
                    console.log("Successfully saved file to S3: " + videoS3Key);
                });

                // Create Reelay object
                const reelay = new Reelay({
                    owner: creator.attributes.sub,
                    creatorID: creator.attributes.sub,
                    isMovie: true,
                    isSeries: false,
                    movieID: tmdbTitleObject.id.toString(),
                    seriesSeason: -1,
                    seasonEpisode: -1,
                    uploadedAt: new Date().toISOString(),
                    tmdbTitleID: tmdbTitleObject.id.toString(),
                    videoS3Key: videoS3Key,
                    visibility: 'global',
                });

                // Upload Reelay object to DynamoDB, get ID
                const savedReelay = await DataStore.save(reelay);
                console.log('saved new Reelay');

                dispatch(setUploadStatus({
                    chunksUploaded: 0,
                    chunksTotal: 0,
                    uploadStatus: ReelayUploadStatus.UPLOAD_COMPLETE,
                }));
                console.log('Upload dialog complete.');
                return savedReelay;

            } catch (error) {
                // todo: better error catching
                console.log('Error uploading file: ', error);
                dispatch(setUploadStatus({
                    chunksUploaded: 0,
                    chunksTotal: 0,
                    uploadStatus: ReelayUploadStatus.UPLOAD_FAILED,
                }));
                return null;
            }
        }
    }


    return (
        <View style={{width: 150, alignItems: 'center' }}>
            <ProgressBar progress={progress} color={'white'} />
            <Text style={TextStyles.whiteText}>{'Uploading...'}</Text>
        </View>
    );
}

export default UploadProgressBar;