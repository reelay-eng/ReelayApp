import React, { useContext } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Overlay, Text } from 'react-native-elements';
import { AuthStyles, TextStyles } from '../../styles';

import { Auth } from 'aws-amplify';
import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import styled from 'styled-components/native';

export default SettingsOverlay = ({ navigation }) => {

    const authContext = useContext(AuthContext);
    const visibilityContext = useContext(VisibilityContext);

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
        <View style={{ marginTop: 100 }}>
            <Pressable onPress={() => {
                visibilityContext.setOverlayVisible(false);
            }} style={{ 
                marginBottom: 40,
                alignSelf: 'flex-start',
            }}>
                <SettingsText>{'Close'}</SettingsText>
            </Pressable>
            <Pressable onPress={signOut} style={{ 
                marginBottom: 40,
                alignSelf: 'flex-start',
            }}>
                <SettingsText>{'Sign out'}</SettingsText>
            </Pressable>
        </View>
    );
}