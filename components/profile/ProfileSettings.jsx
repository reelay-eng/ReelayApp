import React, {useState} from 'react';
import { Text, View, Switch, Image, Pressable, SafeAreaView } from 'react-native';
import BackButton from "../../components/utils/BackButton";
import styled from 'styled-components/native';

export default ProfileSettings = ({navigation}) => {
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
    `;

    return (
        <ViewContainer>
            <Header navigation={navigation}/>

            <SettingsContainer>
                {/* <ThemeSettings /> */}
                <NotificationSettings />
            </SettingsContainer>
        </ViewContainer>
    )
}

const NotificationSettings = () => {
    const NotificationSettingsContainer = styled(View)`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

    /* 
    Notification Types:
    1. All Notifications
    2. Environment Notifications (Reminder that a movie just came out, etc)
    3. Interaction Notifications (Follow, like, comment, etc)
    */

    return (
        <NotificationSettingsContainer>
            <AllNotificationSetting />
            <EnvironmentNotificationSetting />
        </NotificationSettingsContainer>
    )
}

const AllNotificationSetting = () => {
    const [allNotificationsToggled, setAllNotificationsToggled] = useState(false);
    function toggleAllNotifications() {
        setAllNotificationsToggled(!allNotificationsToggled);
        // if (allNotificationsToggled) {
        //     //logic
        // }
    }

    return (
        <NotificationSetting
                title="Allow All Notifications?" 
                isToggled={allNotificationsToggled}
                toggleFunction={toggleAllNotifications}
        />
    )
}

const EnvironmentNotificationSetting = () => {
    const [environmentNotificationsToggled, setEnvironmentNotificationsToggled] = useState(false);
    function toggleEnvironmentNotifications() {
        setEnvironmentNotificationsToggled(!environmentNotificationsToggled);
        // if (environmentNotificationsToggled) {
        //     //logic
        // }
    }

    return (
        <NotificationSetting
                title="Environment Notifications?" 
                isToggled={environmentNotificationsToggled}
                toggleFunction={toggleEnvironmentNotifications}
        />
    )
}

const NotificationSetting = ({title, isToggled, toggleFunction}) => {
    const NotificationSettingContainer = styled(View)`
        width: 100%;
        height: 5%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 15px;
        padding: 5px;
    `;
    const NotificationSettingText = styled(Text)`
        text-align: center;
        color: white;
        font-size: 28px;
        margin-left: 10px;
        margin-right: 20px;
    `;
    const NotificationSlider = styled(Switch)`
        margin-right: 20px;
    `;
    return (
        <NotificationSettingContainer>
            <NotificationSettingText>{title}</NotificationSettingText>
            <NotificationSlider
                value={isToggled}
                onValueChange={toggleFunction}
                trackColor={{false: "#767577", true: "#81b0ff"}}
                thumbColor={isToggled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
            />
        </NotificationSettingContainer>
    )
}

const Header = ({navigation}) => {
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
                <HeaderText>Settings</HeaderText>
            </HeaderContainer>
        </>
    )
}