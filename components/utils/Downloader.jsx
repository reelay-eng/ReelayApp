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

    const DownloaderContainer = styled(View)`
        border: 1px;
        border-color: white;
        border-radius: 12px;
        margin: 30px;
        padding: 12px;
        width: 70%;
    `
    const SettingsPressable = styled(Pressable)`
        width: 100%;
    `
    const SettingsText = styled(Text)`
        align-self: center;
        font-size: 20px;
        font-family: System;
        color: white;
    `
    const [downloadProgress, setDownloadProgress] = useState(0);

    const onProgressUpdate = (update) => {
        const progress = update.totalBytesWritten / update.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
    }      

    const onDownloadStart = async () => {

        const downloadResumable = FileSystem.createDownloadResumable(
            reelay.content.videoURI,
            `${FileSystem.documentDirectory}${reelay.id}.mp4`,
            {}, onProgressUpdate
        );
          
        try {
            showErrorToast('Downloading...');
            await MediaLibrary.requestPermissionsAsync();
            const { uri } = await downloadResumable.downloadAsync();
            console.log('Finished downloading to ', uri);

            const download = await MediaLibrary.createAssetAsync(uri);
            console.log(download);
            showErrorToast('Download complete');
        } catch (e) {
            console.error(e);
            showErrorToast('Download failed...');
        }
    }


    return (
        <DownloaderContainer>
            <SettingsPressable onPress={onDownloadStart}>
                <SettingsText>{'Download this Reelay'}</SettingsText>
                <UploadProgressBar progress={downloadProgress} />
            </SettingsPressable>
        </DownloaderContainer>
    );
}