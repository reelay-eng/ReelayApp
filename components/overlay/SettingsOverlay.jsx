import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Progress from 'react-native-progress';

import { removeReelay } from '../../api/ReelayDBApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';

const { height, width } = Dimensions.get('window');

export default SettingsOverlay = ({ navigation, reelay, onDeleteReelay }) => {

    const [confirmHide, setConfirmHide] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStarted, setDownloadStarted] = useState(false);

    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const { setOverlayVisible, setTabBarVisible } = useContext(FeedContext);
    const canHideReelay = (reelay?.creator?.username === reelayDBUser?.username)
                        || (reelayDBUser?.role === 'admin');

    const SettingsContainer = styled(View)`
        align-items: center;
        height: 100%;
        justify-content: center;
        width: 100%;
        top: ${ height / 4}px;
    `
    const SettingsPressable = styled(Pressable)`
        align-items: center;
        border: 1px;
        border-color: white;
        border-radius: 12px;
        margin: 30px;
        padding: 16px;
        width: 70%;
    `
    const SettingsPressableDisabled = styled(Pressable)`
        align-items: center;
        margin-top: 30px;
        padding: 16px;
        width: 70%;
    `
    const SettingsText = styled(Text)`
        align-self: center;
        font-size: 20px;
        font-family: System;
        color: white;
    `

    const hideReelay = async () => {
        console.log('preparing to delete reelay');
        setConfirmHide(true);
    }

    const confirmHideReelay = async () => {
        console.log('confirming delete reelay');
        logAmplitudeEventProd('deleteReelay', {
            username: cognitoUser.username,
            reelayID: reelay.id,
            title: reelay.title,
        });
        onDeleteReelay(reelay);
        setOverlayVisible(false);
        setTabBarVisible(true);
        if (reelay.id % 2 === 0) showMessageToast('Your Reelay is no more');
        if (reelay.id % 2 === 1) showMessageToast('Don\'t you just want to burn it all?');
    }

    const downloadReelay = async () => {
        setDownloadStarted(true);
        const downloadResumable = FileSystem.createDownloadResumable(
            reelay.content.videoURI,
            `${FileSystem.documentDirectory}${reelay.id}.mp4`,
            {}, onProgressUpdate
        );
          
        try {
            showMessageToast('Downloading...');
            await MediaLibrary.requestPermissionsAsync();
            const { uri } = await downloadResumable.downloadAsync();
            console.log('Finished downloading to ', uri);

            const download = await MediaLibrary.createAssetAsync(uri);
            console.log(download);
            showMessageToast('Download complete. Check your media library.');
        } catch (error) {
            console.error(error);
            logAmplitudeEventProd('downloadReelayFailed', {
                username: cognitoUser.username,
                reelayID: reelay.id,
                title: reelay.title,
                error: error.message,
            });
            showErrorToast('Download failed...');
        }
    }

    const renderBaseOptions = () => {
        return (
            <SettingsContainer>
                <SettingsPressable onPress={() => {
                    setOverlayVisible(false);
                    setTabBarVisible(true);
                }}>
                    <SettingsText>{'Close'}</SettingsText>
                </SettingsPressable>
                { canHideReelay && 
                    <SettingsPressable onPress={async () => {
                        const resultRemove = await removeReelay(reelay);
                        console.log(resultRemove);
                        if (resultRemove.error) {
                            showErrorToast('Could not delete. Please reach out to the Reelay team!');
                            logAmplitudeEventProd('deleteReelayError', {
                                username: cognitoUser.username,
                                reelayID: reelay.id,
                                title: reelay.title,
                                error: resultRemove.error,
                            });
                        } else {
                            showMessageToast('Your reelay is removed');
                        }
                    }}>
                        <SettingsText>{'Remove this reelay'}</SettingsText>
                    </SettingsPressable>
                }
                { downloadStarted &&
                    <SettingsPressableDisabled>
                        <SettingsText>{'Download this reelay'}</SettingsText>
                            <Progress.Bar color={'white'} progress={downloadProgress} 
                                style={{ margin: 20 }} width={width * 0.5} />
                    </SettingsPressableDisabled>
                }
                { !downloadStarted &&
                    <SettingsPressable onPress={downloadReelay}>
                        <SettingsText>{'Download this reelay'}</SettingsText>
                    </SettingsPressable>
                }
            </SettingsContainer>
        );
    }

    const renderConfirmHide = () => {
        return (
            <SettingsContainer>
                <SettingsText>{'Are you sure you want to delete this reelay?'}</SettingsText>
                <SettingsPressable onPress={confirmHideReelay}>
                    <SettingsText>{'Confirm deletion'}</SettingsText>
                </SettingsPressable>
                <SettingsPressable onPress={() => { setConfirmHide(false) }}>
                    <SettingsText>{'Cancel'}</SettingsText>
                </SettingsPressable>
            </SettingsContainer>
        );
    }

    const onProgressUpdate = (update) => {
        const progress = update.totalBytesWritten / update.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
    } 

    return (
        <SafeAreaView>
            { canHideReelay && confirmHide && renderConfirmHide() }
            { !confirmHide && renderBaseOptions() }
        </SafeAreaView>
    );
}