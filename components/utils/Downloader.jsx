// from: https://docs.expo.dev/versions/latest/sdk/filesystem/

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import styled from 'styled-components/native';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { showErrorToast, showMessageToast } from './toasts';



const UploadProgressBar = ({ downloading, progress, indeterminate = false }) => {
    const UploadProgressBarContainer = styled(View)`
        align-self: center;
        height: 10px;
        margin: 15px;
        justify-content: center;
        width: 75%;
    `
    return (
        <UploadProgressBarContainer>
            { (downloading) && 
                <Progress.Bar color={'white'} indeterminate={indeterminate} progress={progress} width={width * 0.75} />
            }
        </UploadProgressBarContainer>
    );
}

export default Downloader = ({ reelay }) => {

    const SettingsPressable = styled(Pressable)`
        flex-direction: row;
        margin: 30px;
    `
    const SettingsText = styled(Text)`
        font-size: 20px;
        font-family: System;
        color: white;
    `
    const [downloadProgress, setDownloadProgress] = useState(0);

    const onProgressUpdate = (update) => {
        const progress = update.totalBytesWritten / update.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
    }

    // console.log(FileSystem.documentDirectory);

    // const downloadResumable = FileSystem.createDownloadResumable(
    //     reelay.content.videoURI,
    //     `${FileSystem.documentDirectory}${reelay.id}.mp4`,
    //     {},
    //     onProgressUpdate
    // );

    const onDownloadStart = async () => {
        try {
            await MediaLibrary.requestPermissionsAsync();
            console.log(reelay.content.videoURI);
            const download = await MediaLibrary.saveToLibraryAsync(reelay.content.videoURI);
            console.log(download);
            showMessageToast('Download complete');
        } catch (e) {
            console.error(e);
            showErrorToast('Download failed...');
        }
    }

    // const onDownloadPause = async () => {
    //     try {
    //         await downloadResumable.pauseAsync();
    //         console.log('Paused download operation, saving for future retrieval');
    //         AsyncStorage.setItem('pausedDownload', JSON.stringify(downloadResumable.savable()));
    //     } catch (e) {
    //         console.error(e);
    //     }    
    // }

    // const onDownloadResume = async () => {
    //     try {
    //         const { uri } = await downloadResumable.resumeAsync();
    //         console.log('Finished downloading to ', uri);
    //     } catch (e) {
    //         console.error(e);
    //     }    
    // }

    // const onDownloadResumeAfterRestart = async () => {
    //     //To resume a download across app restarts, assuming the the DownloadResumable.savable() object was stored:
    //     const downloadSnapshotJson = await AsyncStorage.getItem('pausedDownload');
    //     const downloadSnapshot = JSON.parse(downloadSnapshotJson);
    //     const downloadResumable = new FileSystem.DownloadResumable(
    //         downloadSnapshot.url,
    //         downloadSnapshot.fileUri,
    //         downloadSnapshot.options,
    //         callback,
    //         downloadSnapshot.resumeData
    //     );

    //     try {
    //         const { uri } = await downloadResumable.resumeAsync();
    //         console.log('Finished downloading to ', uri);
    //     } catch (e) {
    //         console.error(e);
    //     }    
    // }

    return (
        <View>
            <SettingsPressable onPress={onDownloadStart}>
                <SettingsText>{'Download this Reelay'}</SettingsText>
                <UploadProgressBar progress={downloadProgress} />
            </SettingsPressable>
        </View>
    );
}