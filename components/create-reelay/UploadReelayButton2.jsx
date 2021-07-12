import React, { useContext } from 'react';
import { Auth } from 'aws-amplify';
import { Button } from 'react-native-elements';

import { AppContext } from '../../context/AppContext';

export default UploadReelayButton2 = ({ navigation, route }) => {

    const appContext = useContext(AppContext);
    const { titleObject, videoSource } = route.params;

    const uploadReelayAction = async () => {
        uploadReelay().then(() => {
            navigation.navigate('HomeFeedScreen');
        })
    }

    const uploadReelay = async () => {
        if (!videoSource) {
            console.log('No video to upload.')
        } else {
            console.log('Upload dialog initiated.');
            // Set current user as the creator
            const creator = await Auth.currentAuthenticatedUser();
            console.log(creator.attributes.sub);

            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            // If S3 doesn't know it's an mp4, the Elemental MediaConvert workflow doesn't trigger on Put
            const videoS3Key = 'reelayvid-' + creator.attributes.sub + '-' + Date.now() + '.mp4';

            try {
                // Upload video to S3
                fetch(videoSource).then((response) => response.blob()).then((blob) => 
                    Storage.put(videoS3Key, blob, {
                        progressCallback(progress) {
                            console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
                            appContext.setUploadStatus({
                                chunksUploaded: progress.loaded,
                                chunksTotal: progress.total,
                                status: 'UPLOADING',                          
                            });
                        } 
                    }).then(() => 
                        console.log("Successfully saved file to S3: " + videoS3Key)
                    )
                );
    
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
                DataStore.save(reelay).then((savedReelay) => {
                    console.log('saved new Reelay');
                    appContext.setUploadStatus({
                        chunksUploaded: 0,
                        chunksTotal: 0,
                        status: 'NO_UPLOAD',                          
                    });
                    console.log(savedReelay);
                    console.log('Upload dialog complete.');
                });
            } catch (error) {
                // todo: better error catching
                console.log('Error uploading file: ', error);
                appContext.setUploadStatus({
                    chunksUploaded: 0,
                    chunksTotal: 0,
                    status: 'UPLOAD_FAILED',                          
                });
            }
        }
    }

    return (
        <Button type='clear' title='Post' onPress={uploadReelayAction} />
    );

}