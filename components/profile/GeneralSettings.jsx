import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Switch, Linking, Pressable } from 'react-native';

// Context
import { FeedContext } from "../../context/FeedContext";
import { AuthContext } from '../../context/AuthContext';

// API
import { updateUserFestivalPreference } from '../../api/ReelayDBApi';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../../components/global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default GeneralSettings = ({ navigation }) => {
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
            <HeaderWithBackButton navigation={navigation} text="General Settings"/>
            <GeneralSettingsWrapper reelayDBUser={reelayDBUser}/>
        </ViewContainer>
    )
}

const GeneralSettingsWrapper = ({ reelayDBUser }) => {
    const { settingsShowFilmFestivals } = reelayDBUser;
    const [showFilmFestivals, setShowFilmFestivals] = useState(settingsShowFilmFestivals);

    const GeneralSettingsContainer = styled(View)`
        width: 90%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `
    const Divider = styled(View)`
        border-bottom-width: 1px;
        border-bottom-color: #2e2e2e;
        border-style: solid;
        height: 1px;
        opacity: 0.7;
        width: 98%;
    `
    const toggleShowFilmFestivals = async () => {
        setShowFilmFestivals(!showFilmFestivals);
        const dbResult = await updateUserFestivalPreference(reelayDBUser?.sub, !showFilmFestivals);
        console.log(dbResult);
        reelayDBUser.settingsShowFilmFestivals = !showFilmFestivals;

        logAmplitudeEventProd('toggleShowFilmFestivals', {
            username: reelayDBUser?.username,
            showFilmFestivals: !showFilmFestivals
        });
    }

    return (
        <GeneralSettingsContainer>
            <Divider />
            <ShowFestivalSetting enabled={showFilmFestivals} toggle={toggleShowFilmFestivals}/>
        </GeneralSettingsContainer>
    )
}


const ShowFestivalSetting = ({enabled, toggle}) => {
    return (
        <NotificationSetting
                title="Show Film Festivals" 
                subtext="Feature content from film festivals on your home page"
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