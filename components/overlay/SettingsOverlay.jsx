import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';
import * as Amplitude from 'expo-analytics-amplitude';
// import Downloader from '../utils/Downloader';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Progress from 'react-native-progress';
import { showErrorToast, showMessageToast } from '../utils/toasts';

import { DataStore } from 'aws-amplify';
import { Comment, Reelay, Like } from '../../src/models';
import { fetchResults, fetchResults2 } from '../../api/fetchResults';
import { result } from 'validate.js';

const { height, width } = Dimensions.get('window');

export default SettingsOverlay = ({ navigation, reelay, onDeleteReelay }) => {

    const [confirmHide, setConfirmHide] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStarted, setDownloadStarted] = useState(false);

    const {
        user,
        setCredentials,
        setSession,
        setSignedIn,
        setUser,
    } = useContext(AuthContext);
    const { setOverlayVisible } = useContext(VisibilityContext);
    const canHideReelay = (reelay.creator.username === user.username)
                        || (user.username === 'immigrantfilm');

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
    const signOut = async () => {
        // todo: confirm sign out
        try {
            Amplitude.logEventWithPropertiesAsync('signOut', {
                username: user.username,
            });
            const signOutResult = await Auth.signOut();
            setSignedIn(false);
            setUser({});
            setSession({});
            setCredentials({});
            setOverlayVisible(false);
        } catch (error) {
            console.log(error);
        }
    }

    const hideReelay = async () => {
        console.log('preparing to delete reelay');
        setConfirmHide(true);
    }

    const confirmHideReelay = async () => {
        console.log('confirming delete reelay');
        Amplitude.logEventWithPropertiesAsync('deleteReelay', {
            username: user.username,
            reelayID: reelay.id,
            title: reelay.title,
        });
        onDeleteReelay(reelay);
        setOverlayVisible(false);
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
        } catch (e) {
            console.error(e);
            showErrorToast('Download failed...');
        }
    }

    const migrateReelays = async () => {

        const allReelays = await DataStore.query(Reelay);
        for (let ii = 0; ii < allReelays.length; ii += 1) {
            const reelayObj = allReelays[ii];
            const result = await postReelayToDB(reelayObj);
            console.log(`Reelay ${ii} posted: `, reelayObj.owner, reelayObj.tmdbTitleID);
            console.log(result);
        }

        const allComments = await DataStore.query(Comment);
        for (let ii = 0; ii < allComments.length; ii += 1) {
            const commentObj = allComments[ii];
            const result = await postCommentToDB(commentObj);
            console.log(`Comment ${ii} posted: `, commentObj.owner);
            console.log(result);
        }

        const allLikes = await DataStore.query(Like);
        for (let ii = 0; ii < allLikes.length; ii += 1) {
            const likeObj = allLikes[ii];
            const result = await postLikeToDB(likeObj);
            console.log(`Like ${ii} posted: `, likeObj.owner);
            console.log(result);
        }
    }

    const postCommentToDB = async (commentObj) => {
        console.log('Comment: ', commentObj);
    }

    const postLikeToDB = async (likeObj) => {
        console.log('Like: ', likeObj);
    }

    const postReelayToDB = async (reelayObj) => {

        const data = {
            creatorSub: reelayObj.creatorID,
            creatorName: reelayObj.owner,
            datastoreSub: reelayObj.id,
            isMovie: reelayObj.isMovie,
            isSeries: reelayObj.isSeries,
            postedAt: reelayObj.uploadedAt,
            tmdbTitleID: reelayObj.tmdbTitleID,
            venue: reelayObj.venue,
            videoS3Key: reelayObj.videoS3Key,
            visibility: reelayObj.visibility,
        }

        const routePost = 'https://data.reelay.app/reelays/sub';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }
        const response = await fetchResults2(routePost, options);
        return response;
    }

    const renderBaseOptions = () => {
        return (
            <SettingsContainer>
                <SettingsPressable onPress={() => {
                    setOverlayVisible(false);
                }}>
                    <SettingsText>{'Close'}</SettingsText>
                </SettingsPressable>
                { canHideReelay && 
                    <SettingsPressable onPress={hideReelay}>
                        <SettingsText>{'Delete this Reelay'}</SettingsText>
                    </SettingsPressable>
                }
                { downloadStarted &&
                    <SettingsPressableDisabled>
                        <SettingsText>{'Download this Reelay'}</SettingsText>
                            <Progress.Bar color={'white'} progress={downloadProgress} 
                                style={{ margin: 20 }} width={width * 0.5} />
                    </SettingsPressableDisabled>
                }
                { !downloadStarted &&
                    <SettingsPressable onPress={downloadReelay}>
                        <SettingsText>{'Download this Reelay'}</SettingsText>
                    </SettingsPressable>
                }
                <SettingsPressable onPress={migrateReelays}>
                    <SettingsText>{'Migrate Reelays'}</SettingsText>
                </SettingsPressable>
                <SettingsPressable onPress={signOut}>
                    <SettingsText>{'Sign out'}</SettingsText>
                </SettingsPressable>
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