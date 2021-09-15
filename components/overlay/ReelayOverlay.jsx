import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View } from 'react-native';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';
import { showMessageToast } from '../utils/toasts';
import * as Amplitude from 'expo-analytics-amplitude';

const { height, width } = Dimensions.get('window');

export default ReelayOverlay = ({ navigation, reelay, onDeleteReelay }) => {

    const [confirmHide, setConfirmHide] = useState(false);

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);
    const canHideReelay = (reelay.creator.username === authContext.user.username)
                        || (authContext.user.username === 'immigrantfilm');

    const SettingsContainer = styled(View)`
        align-items: flex-start;
        height: 100%;
        justify-content: center;
        width: 100%;
        top: ${ height / 4}px;
    `
    const SettingsPressable = styled(Pressable)`
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
        if (reelay.id % 2 === 0) showMessageToast('Your Reelay is no more');
        if (reelay.id % 2 === 1) showMessageToast('Don\'t you just want to burn it all?');
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

    return (
        <SafeAreaView>
            { canHideReelay && confirmHide && renderConfirmHide() }
            { !confirmHide && renderBaseOptions() }
        </SafeAreaView>
    );
}