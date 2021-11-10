import React, { useState, useContext, useEffect } from 'react';
import { Text, View, Switch, Image, Pressable, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { getNotificationSettings, setNotificationSettings } from '../../api/NotificationsApi';
import { Header } from './ProfileSettings';

export default NotificationSettings = ({navigation}) => {
    const { user } = useContext(AuthContext);

    const ViewContainer = styled(View)`
        width: 100%;
        height: 100%;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
    `

    return (
        <ViewContainer>
            <Header navigation={navigation} text="Notification Settings"/>
            <NotificationsSettingsWrapper user={user}/>
        </ViewContainer>
    )
}

const NotificationsSettingsWrapper = ({user}) => {
    
    const [notifyAll, setNotifyAll] = useState(true);
    const [notifyPrompts, setNotifyPrompts] = useState(true);
    const [notifyReactions, setNotifyReactions] = useState(true);
    const [notifyTrending, setNotifyTrending] = useState(true);

    const NotificationSettingsContainer = styled(View)`
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    const Divider = styled(View)`
        border: solid 1px #2e2e2e;
        height: 1px;
        width: 100%;
    `;

    useEffect(() => {
       const asyncGetNotificationSettings = async () => {
            const { settingsNotifyPrompts, settingsNotifyReactions, settingsNotifyTrending } = await getNotificationSettings({user});
            setNotifyPrompts(settingsNotifyPrompts);
            setNotifyReactions(settingsNotifyReactions);
            setNotifyTrending(settingsNotifyTrending);
            const shouldSetNotifyAll = (settingsNotifyPrompts && settingsNotifyReactions && settingsNotifyTrending);
            setNotifyAll(shouldSetNotifyAll);
       }
       asyncGetNotificationSettings();
    }, [])

    /* 
    Notification Types:
    1. All Notifications
    2. Notify Prompts: nudges by the app to post or check out new reelays
    3. Notify Reactions: likes and comments on my posts, responses in comment threads
    4. Notify Trending: posts by people I follow or engage with, new reelays for movies I've reelayed
    */
    const allTrue = (p1, p2, p3) => {
        return (p1 == true && p1 == p2 && p2 == p3);
    }
    const toggleNotifyAll = () => {
        setNotifyAll(!notifyAll);
        let value = (!notifyAll ? true : false);
        setNotifyPrompts(value);
        setNotifyReactions(value);
        setNotifyTrending(value);

        // logic for DB updates
        setNotificationSettings({user, notifyPrompts: value, notifyReactions: value, notifyTrending: value});
    }
    const toggleNotifyPrompts = () => {
        setNotifyPrompts(!notifyPrompts);
        setNotifyAll(allTrue(!notifyPrompts, notifyReactions, notifyTrending));

        // logic for DB updates
        setNotificationSettings({user, notifyPrompts: !notifyPrompts, notifyReactions, notifyTrending});

    }
    const toggleNotifyReactions = () => {
        setNotifyReactions(!notifyReactions);
        setNotifyAll(allTrue(notifyPrompts, !notifyReactions, notifyTrending));
            // logic for DB updates
        setNotificationSettings({user, notifyPrompts, notifyReactions: !notifyReactions, notifyTrending});
    }
    const toggleNotifyTrending = () => {
        setNotifyTrending(!notifyTrending);
        setNotifyAll(allTrue(notifyPrompts, notifyReactions, !notifyTrending));
        // logic for DB updates
        setNotificationSettings({user, notifyPrompts, notifyReactions, notifyTrending: !notifyTrending});
    }

    return (
        <NotificationSettingsContainer>
            <AllNotificationSetting enabled={notifyAll} toggle={toggleNotifyAll}/>
            <Divider />
            <PromptNotificationSetting enabled={notifyPrompts} toggle={toggleNotifyPrompts}/>
            <ReactionsNotificationSetting enabled={notifyReactions} toggle={toggleNotifyReactions}/>
            <TrendingNotificationSetting enabled={notifyTrending} toggle={toggleNotifyTrending}/>
        </NotificationSettingsContainer>
    )
}

const AllNotificationSetting = ({enabled, toggle}) => {
    return (
        <NotificationSetting
                title="Allow All Notifications" 
                isToggled={enabled}
                toggleFunction={toggle}
        />
    )
}

const PromptNotificationSetting = ({enabled, toggle}) => {
    return (
        <NotificationSetting
                title="Prompts" 
                subtext="Remind me to check out the app"
                isToggled={enabled}
                toggleFunction={toggle}
        />
    )
}

const ReactionsNotificationSetting = ({enabled, toggle}) => {
    return (
        <NotificationSetting
                title="Interactions" 
                subtext="Notify me when people react to my posts"
                isToggled={enabled}
                toggleFunction={toggle}
        />
    )
}

const TrendingNotificationSetting = ({enabled, toggle}) => {
    return (
        <NotificationSetting
                title="Trending" 
                subtext="Notify me when a movie or Reelay is trending"
                isToggled={enabled}
                toggleFunction={toggle}
        />
    )
}

const NotificationSetting = ({title, subtext, isToggled, toggleFunction}) => {
    const NotificationSettingContainer = styled(View)`
        width: 100%;
        height: 10%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-top: 15px;
        padding: 5px;
    `;
    const FirstRow = styled(View)`
        width: 100%;
        height: 70%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 5px;
    `;
    const SecondRow = styled(View)`
        width: 100%;
        height: 30%;
    `;
    const NotificationSettingText = styled(Text)`
        text-align: center;
        color: white;
        font-size: 26px;
        font-weight: 500;
        margin-left: 10px;
        margin-right: 20px;
    `;
    const NotificationSettingSubtext = styled(Text)`
        text-align: left;
        margin-top: -5px;
        margin-left: 15px;
        color: #6E6E6E;
        font-size: 16px;
    `;
    const NotificationSlider = styled(Switch)`
        margin-right: 20px;
        transform: scale(1.2);
    `;
    return (
        <NotificationSettingContainer>
            <FirstRow>
                <NotificationSettingText>{title}</NotificationSettingText>
                <NotificationSlider
                    value={isToggled}
                    onValueChange={toggleFunction}
                    trackColor={{false: "#3e3e3e", true: "#2977EF"}}
                    thumbColor={"#FFFFFF"}
                    ios_backgroundColor="#3e3e3e"
                />
            </FirstRow>
            <SecondRow>
                <NotificationSettingSubtext>{subtext}</NotificationSettingSubtext>
            </SecondRow>
        </NotificationSettingContainer>
    )
}