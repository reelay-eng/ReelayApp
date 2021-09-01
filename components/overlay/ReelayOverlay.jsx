import React, { useContext, useState } from 'react';
import { Pressable, View, SafeAreaView } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import ReelayAvatar from '../utils/ReelayAvatar';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';
import Sentry from 'sentry-expo';

import styled from 'styled-components/native';

export default ReelayOverlay = ({ navigation, reelay }) => {

    const [confirmHide, setConfirmHide] = useState(false);

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);
    const canHideReelay = (reelay.creator.username === authContext.user.username)
                        || (reelay.creator.username === 'immigrantfilm');

    const AvatarView = styled(View)`
        height: 30px;
        margin-top: 10px;
        width: 30px;
    `
    const AvatarPressable = styled(Pressable)`
        width: 100%;
        height: 100%;
    `
    const SettingsHeader = styled(View)`
        align-items: center;
        flex-direction: row;
        justify-content: center;
        margin-bottom: 40px;
        width: 100%;
        z-index: 2;
    `
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
                        <SettingsText>{'Hide Reelay'}</SettingsText>
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
                <SettingsPressable onPress={() => {}}>
                    <SettingsText>{'Confirm Delete'}</SettingsText>
                </SettingsPressable>
                <SettingsPressable onPress={() => { setConfirmHide(false) }}>
                    <SettingsText>{'Cancel'}</SettingsText>
                </SettingsPressable>
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