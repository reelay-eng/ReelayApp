import React, { useRef, useState } from 'react';
import { Auth, DataStore, Storage, progressCallback } from 'aws-amplify';
import { User, Artist, Movie, Reelay } from '../../src/models';

import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-elements';

const UploadReelayButton = () => {

    const tmdbTitleObject = useSelector((state) => state.createReelay.titleObject);
    const videoSource = useSelector((state) => state.createReelay.videoSource);

    const uploadDialog = async () => {
        console.log('upload dialog initiated');
        await uploadReelay();
        console.log('upload finished');
    }

    const uploadReelay = async () => {
        if (!videoSource) {
          console.log("No video to upload.")
        } else {
          // Set current user as the creator
          const creator = await Auth.currentAuthenticatedUser();
          console.log(creator.attributes.sub);
          const videoS3Key = 'reelayvid-' + creator.attributes.sub + '-' + Date.now();
    
          // Upload video to S3
          try {
            const response = await fetch(videoSource);
            const blob = await response.blob();
            await Storage.put(videoS3Key, blob, {
              contentType: 'video/mp4',
              progressCallback(progress) {
                console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
              }
            }).then(() => {
              console.log("Successfully saved file to S3: " + videoS3Key);
            });
          } catch (error) {
            console.log('Error uploading file: ', error);
          }
    
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
        }
      }
    

    return (
        <Button type='clear' title='Post' onPress={uploadDialog} />
    );
};

export default UploadReelayButton;