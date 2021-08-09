import React, { useContext } from 'react';
import { Pressable, View, SafeAreaView } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import ReelayAvatar from '../utils/ReelayAvatar';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';
import Sentry from 'sentry-expo';

import styled from 'styled-components/native';

export default SettingsOverlay = ({ navigation }) => {

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);

    const AvatarView = styled(View)`
        width: 30px;
        height: 30px;
        margin-top: 10px;
    `
    const AvatarPressable = styled(Pressable)`
        width: 100%;
        height: 100%;
    `
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
                <AvatarView>
                    <AvatarPressable onPress={() => {
                        visibilityContext.setOverlayVisible(false);
                    }}>
                        <Icon type='ionicons' name='settings' color={'white'} size={30} />
                    </AvatarPressable>
                </AvatarView>
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