import React, { useState, useContext, useEffect } from 'react';
import { Text, View, Switch, Image, Pressable, SafeAreaView } from 'react-native';
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
        height: 100%;
        display: flex;
        align-items: center;
    `;

    return (
        <ViewContainer>
            <Header navigation={navigation}/>
            <SettingsContainer> 
                <SettingEntry navigation={navigation} text="Notifications" to="NotificationSettingsScreen" />
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