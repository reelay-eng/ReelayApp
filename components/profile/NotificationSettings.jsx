import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Switch, Linking, Pressable } from 'react-native';

// Context
import { AuthContext } from '../../context/AuthContext';

// API
import { getMyNotificationSettings, setMyNotificationSettings } from '../../api/NotificationsApi';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../../components/global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default NotificationSettings = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);

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
            <HeaderWithBackButton navigation={navigation} text="Notification Settings"/>
            <NotificationsSettingsWrapper reelayDBUser={reelayDBUser}/>
        </ViewContainer>
    )
}

const NotificationsSettingsWrapper = ({ reelayDBUser }) => {
    
    const [notifyAll, setNotifyAll] = useState(true);
    const [notifyPrompts, setNotifyPrompts] = useState(true);
    const [notifyReactions, setNotifyReactions] = useState(true);
    const [notifyTrending, setNotifyTrending] = useState(true);
    const componentMounted = useRef(true);

    const NotificationSettingsContainer = styled(View)`
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    const Divider = styled(View)`
        border-bottom-width: 1px;
        border-bottom-color: #2e2e2e;
        border-style: solid;
        height: 1px;
        opacity: 0.7;
        width: 98%;
    `;

    useEffect(() => {
       const asyncGetNotificationSettings = async () => {
            const { 
                settingsNotifyPrompts, 
                settingsNotifyReactions, 
                settingsNotifyTrending 
            } = await getMyNotificationSettings(reelayDBUser);
            
           if (componentMounted.current) {  // no react state updates on unmounted components since this is async setter
                setNotifyPrompts(settingsNotifyPrompts);
				setNotifyReactions(settingsNotifyReactions);
				setNotifyTrending(settingsNotifyTrending);
				const shouldSetNotifyAll =
					settingsNotifyPrompts && settingsNotifyReactions && settingsNotifyTrending;
				setNotifyAll(shouldSetNotifyAll);
            }
       }
        asyncGetNotificationSettings();
        return () => {
           componentMounted.current = false;
       }
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
        //setNotifyTrending(value);

        // logic for DB updates
        // setMyNotificationSettings({user, notifyPrompts: value, notifyReactions: value, notifyTrending: value});
        setMyNotificationSettings({ 
            user: reelayDBUser, 
            notifyPrompts: true, 
            notifyReactions: value, 
            notifyTrending: true
        });
        logAmplitudeEventProd('notificationSettingsAll', {
            notifyReactions: value,
            });

    }
    const toggleNotifyPrompts = () => {
        setNotifyPrompts(!notifyPrompts);
        setNotifyAll(allTrue(!notifyPrompts, notifyReactions, notifyTrending));

        // logic for DB updates
        setMyNotificationSettings({ 
            user: reelayDBUser, 
            notifyPrompts: !notifyPrompts, 
            notifyReactions, 
            notifyTrending
        });

    }
    const toggleNotifyReactions = () => {
        setNotifyReactions(!notifyReactions);
        setNotifyAll(allTrue(notifyPrompts, !notifyReactions, notifyTrending)); // for all implemented

        // logic for DB updates
        setMyNotificationSettings({ 
            user: reelayDBUser, 
            notifyPrompts, 
            notifyReactions: !notifyReactions, 
            notifyTrending
        });
    }
    const toggleNotifyTrending = () => {
        setNotifyTrending(!notifyTrending);
        setNotifyAll(allTrue(notifyPrompts, notifyReactions, !notifyTrending));
        // logic for DB updates
        setMyNotificationSettings({ 
            user: reelayDBUser, 
            notifyPrompts, 
            notifyReactions, 
            notifyTrending: !notifyTrending
        });
    }

    return (
        <NotificationSettingsContainer>
            <AllNotificationSetting enabled={notifyAll} toggle={toggleNotifyAll}/>
            <Divider />
            <ReactionsNotificationSetting enabled={notifyReactions} toggle={toggleNotifyReactions}/>
            <PromptNotificationSetting enabled={notifyPrompts} toggle={toggleNotifyPrompts}/>
            {/* <TrendingNotificationSetting enabled={notifyTrending} toggle={toggleNotifyTrending}/> */}
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
                subtext="Notify me when people react to my posts and send me recs"
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
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        padding: 5px;
    `;
    const FirstColumn = styled(Pressable)`
        width: 80%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: flex-start;
        padding: 5px;
    `;
    const SecondColumn = styled(View)`
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    const NotificationSettingText = styled(ReelayText.Body1)`
        text-align: center;
        color: white;
        margin-right: 20px;
        margin-top: 0px;
    `;
    const NotificationSettingSubtext = styled(ReelayText.Caption)`
        text-align: left;
        margin-top: 6px;
        color: #FFFFFF
        opacity: 0.5;
    `;
    const NotificationSlider = styled(Switch)``;
    return (
		<NotificationSettingContainer>
            <FirstColumn onPress={() => Linking.openSettings()}>
				<NotificationSettingText>{title}</NotificationSettingText>
				{subtext && <NotificationSettingSubtext>{subtext}</NotificationSettingSubtext>}
			</FirstColumn>
			<SecondColumn>
				<NotificationSlider
					value={isToggled}
					onValueChange={toggleFunction}
					trackColor={{ false: "#39393D", true: ReelayColors.reelayBlue }}
					thumbColor={"#FFFFFF"}
					ios_backgroundColor="#39393D"
				/>
			</SecondColumn>
		</NotificationSettingContainer>
	);
}