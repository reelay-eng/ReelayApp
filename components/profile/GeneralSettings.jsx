import React, { useContext } from 'react';
import { View, Switch, Linking, Pressable } from 'react-native';

// Context
import { AuthContext } from '../../context/AuthContext';

// API
import { updateUserFestivalPreference } from '../../api/ReelayDBApi';

// Styling
import styled from "styled-components/native";
import * as ReelayText from "../../components/global/Text";
import { HeaderWithBackButton } from "../global/Headers";
import ReelayColors from '../../constants/ReelayColors';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch, useSelector } from 'react-redux';

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
    const dispatch = useDispatch();
    const showFestivalsRow = useSelector(state => state.showFestivalsRow);

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
    const toggleShowFestivalsRow = async () => {
        const dbResult = await updateUserFestivalPreference(reelayDBUser?.sub, !showFestivalsRow);
        dispatch({ type: 'setShowFestivalsRow', payload: !showFestivalsRow })

        logAmplitudeEventProd('toggleShowFestivalsRow', {
            username: reelayDBUser?.username,
            showFestivalsRow: !showFestivalsRow
        });
    }

    return (
        <GeneralSettingsContainer>
            <Divider />
            <ShowFestivalSetting enabled={showFestivalsRow} toggle={toggleShowFestivalsRow}/>
        </GeneralSettingsContainer>
    )
}


const ShowFestivalSetting = ({ enabled, toggle }) => {
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