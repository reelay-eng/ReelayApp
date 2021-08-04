import React, { useContext } from 'react';
import { Pressable, View, SafeAreaView } from 'react-native';
import { Text } from 'react-native-elements';
import ReelayAvatar from '../utils/ReelayAvatar';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';
import Sentry from 'sentry-expo';

import styled from 'styled-components/native';

export default SettingsOverlay = ({ navigation }) => {

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);

    const SettingsHeader = styled(View)`
        justify-content: flex-start;
        flex-direction: row;
        z-index: 2;
        width: 100%;
        margin-bottom: 40px;
    `

    const SettingsContainer = styled(SafeAreaView)`
        height: 100%;
        width: 100%;
    `
    const SettingsPressable = styled(Pressable)`
        margin-bottom: 40px;
        align-self: flex-start;
    `

    const SettingsText = styled(Text)`
        font-size: 18px;
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

    return (
        <SettingsContainer>
            <SettingsHeader>
                <ReelayAvatar onPress={() => {
                    visibilityContext.setOverlayVisible(false);
                }} />
            </SettingsHeader>
            <SettingsPressable onPress={() => {
                visibilityContext.setOverlayVisible(false);
            }}>
                <SettingsText>{'Close'}</SettingsText>
            </SettingsPressable>
            <SettingsPressable onPress={signOut}>
                <SettingsText>{'Sign out'}</SettingsText>
            </SettingsPressable>
        </SettingsContainer>
    );
}