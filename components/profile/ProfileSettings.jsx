import React, { useState, useContext, useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
import * as Amplitude from 'expo-analytics-amplitude';
import colors from "../../constants/ReelayColors";
import BackButton from "../../components/utils/BackButton";
import { Icon } from "react-native-elements";
import styled from 'styled-components/native';

export const ProfileSettings = ({navigation}) => {
    const ViewContainer = styled(View)`
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
    `
    const SettingsContainer = styled(View)`
        width: 100%;
        height: 80%;
        display: flex;
        align-items: center;
    `;

    return (
        <ViewContainer>
            <Header navigation={navigation}/>
            <SettingsContainer> 
                <SettingEntry navigation={navigation} text="Notifications" to="NotificationSettingsScreen" />
                <Logout />
            </SettingsContainer>
        </ViewContainer>
    )
}

const SettingEntry = ({navigation, text, to}) => {
    const Container = styled(Pressable)`
        width: 100%;
        height: 60px;
        border: solid 1px rgba(255, 255, 255, 0.1);
        border-left-width: 0px;
        border-right-width: 0px;
        background-color: #0D0D0D;
        display: flex;
        flex-direction: row;
        justify-content: center;
    `
    const SettingEntryWrapper = styled(View)`
        display: flex;
        width: 90%;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    `;
    const SettingEntryIconTextContainer = styled(View)`
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    `;
    const SettingEntryText = styled(Text)`
        font-size: 24px;
        font-weight: 300;
        color: #FFFFFF;
        margin-left: 20px;
    `;
    return (
        <Container onPress={() => {navigation.push(to)}}>
            <SettingEntryWrapper>
                <SettingEntryIconTextContainer>
                    <Icon type='ionicon' name='notifications' color={"#585858"} size={25}/>
                    <SettingEntryText>{text}</SettingEntryText>
                </SettingEntryIconTextContainer>
                <Icon type='ionicon' name='chevron-forward-outline' color={"#585858"} size={25}/>
            </SettingEntryWrapper>
        </Container>
    )
}

const Logout = () => {
    const {
        user,
        setCredentials,
        setSession,
        setSignedIn,
        setUser,
    } = useContext(AuthContext);

    const signOut = async () => {
        // todo: confirm sign out
        try {
            Amplitude.logEventWithPropertiesAsync('signOut', {
                username: user.username,
            });
    
            const signOutResult = await Auth.signOut();
            setSignedIn(false);
            console.log(signOutResult);
            setUser({});
            setSession({});
            setCredentials({});
        } catch (error) {
            console.log(error);
        }
    }

    const LogoutButton = styled(Pressable)`
        margin-top: 20px;
        border: ${colors.reelayRed};
        border-radius: 10px;
        background-color: ${colors.reelayBlack};
        width: 200px;
        height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;
    const LogoutText = styled(Text)`
        font-size: 24px;
        color: ${colors.reelayRed};
    `;

    return (
        <LogoutButton onPress={signOut}>
            <LogoutText>Sign Out</LogoutText>
        </LogoutButton>
    )
}

export const Header = ({navigation, text="Settings"}) => {
    const BackButtonContainer = styled(View)`
        align-self: flex-start;
        position: absolute;
        margin-left: 10px;
        z-index: 2;
    `;
    const HeaderContainer = styled(View)`
        width: 100%;
        height: 15%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    `;
    const HeaderText = styled(Text)`
        text-align: center;
        color: white;
        font-size: 28px;
        font-weight: bold;
    `
    return (
        <>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>

            <HeaderContainer>
                <HeaderText>{text}</HeaderText>
            </HeaderContainer>
        </>
    )
}