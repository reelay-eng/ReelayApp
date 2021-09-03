import React, { useContext, useState } from 'react';
import { Pressable, View, SafeAreaView } from 'react-native';
import { Icon, Text } from 'react-native-elements';
// import { DataStore } from 'aws-amplify';
// import { Reelay } from '../../src/models';
import Constants from 'expo-constants';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';
import { showMessageToast } from '../utils/toasts';

import * as Amplitude from 'expo-analytics-amplitude';

export default ReelayOverlay = ({ navigation, reelay, onDeleteReelay }) => {

    const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

    const [confirmHide, setConfirmHide] = useState(false);

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);
    const canHideReelay = (reelay.creator.username === authContext.user.username)
                        || (authContext.user.username === 'immigrantfilm');

    const SettingsContainer = styled(SafeAreaView)`
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: center;
    `
    const SettingsPressable = styled(Pressable)`
        align-self: center;
        justify-content: center;
        margin: 30px;
    `

    const SettingsText = styled(Text)`
        font-size: 20px;
        font-family: System;
        color: white;
    `

    const signOut = async () => {
        // todo: confirm sign out
        try {
            Amplitude.logEventWithPropertiesAsync('signOut', {
                username: authContext.user.username,
            });
            const signOutResult = await Auth.signOut();
            authContext.setSignedIn(false);
            authContext.setUser({});
            authContext.setSession({});
            authContext.setCredentials({});
            visibilityContext.setOverlayVisible(false);
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
            username: authContext.user.username,
            reelayID: reelay.id,
            title: reelay.title,
        });
        onDeleteReelay(reelay);
        visibilityContext.setOverlayVisible(false);
        if (authContext.user.username === 'immigrantfilm') {
            if (reelay.titleID % 4 === 0) showMessageToast('Nice kill, Sergio');
            if (reelay.titleID % 4 === 1) showMessageToast('HEADSHOT. Bloody, but good work');
            if (reelay.titleID % 4 === 2) showMessageToast('Don\'t you just want to burn it all?');
            if (reelay.titleID % 4 === 3) showMessageToast('This Reelay is no more');
        } else {
            showMessageToast('Your Reelay is no more');
        }
    }

    const renderBaseOptions = () => {
        return (
            <SettingsContainer>
                <SettingsPressable onPress={() => {
                    visibilityContext.setOverlayVisible(false);
                }}>
                    <SettingsText>{'Close'}</SettingsText>
                </SettingsPressable>
                { canHideReelay && 
                    <SettingsPressable onPress={hideReelay}>
                        <SettingsText>{'Delete Reelay'}</SettingsText>
                    </SettingsPressable>
                }
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

    const renderDeleted = () => {
        return (
            <SettingsContainer>
                <SettingsText>{'Your Reelay has been deleted.'}</SettingsText>
            </SettingsContainer>
        );
    }

    return (
        <SettingsContainer>
            { canHideReelay && confirmHide && renderConfirmHide() }
            { !confirmHide && renderBaseOptions() }
        </SettingsContainer>
    );
}