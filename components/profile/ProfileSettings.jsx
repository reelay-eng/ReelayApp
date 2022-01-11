import React, { useContext } from 'react';
import { Text, View, Pressable, Linking } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import colors from "../../constants/ReelayColors";
import BackButton from "../../components/utils/BackButton";
import { Icon } from "react-native-elements";
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { HeaderWithBackButton } from "../global/Headers";

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
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    `;
    const TopSettings = styled(View)`
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    `
    const BottomSettings = styled(View)`
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	`;

    return (
		<ViewContainer>
			<HeaderWithBackButton navigation={navigation} />
			<SettingsContainer>
				<TopSettings>
					<SettingEntry
						text="Notifications"
						iconName="notifications-outline"
						onPress={() => {
							navigation.push("NotificationSettingsScreen");
						}}
					/>
					<SettingEntry
						text="Terms and Conditions"
						iconName="document-text-outline"
						onPress={() => {
							Linking.openURL("https://www.reelay.app/terms-of-use");
						}}
					/>
					<SettingEntry
						text="Privacy Policy"
						iconName="clipboard-outline"
						onPress={() => {
							Linking.openURL("https://www.reelay.app/privacy-policy");
						}}
					/>
				</TopSettings>
				<BottomSettings>
					<Logout />
				</BottomSettings>
			</SettingsContainer>
		</ViewContainer>
	);
}

const SettingEntry = ({text, iconName, onPress}) => {
    const Container = styled(Pressable)`
        width: 100%;
        height: 60px;
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
    const SettingEntryText = styled(ReelayText.Body1)`
        color: #FFFFFF;
        margin-left: 12px;
        margin-top: 3px;
    `;
    return (
		<Container onPress={onPress}>
			<SettingEntryWrapper>
				<SettingEntryIconTextContainer>
					<Icon type="ionicon" name={iconName} color={"#FFFFFF"} size={24} />
					<SettingEntryText>{text}</SettingEntryText>
				</SettingEntryIconTextContainer>
				<Icon type="ionicon" name="chevron-forward-outline" color={"#FFFFFF"} size={24} />
			</SettingEntryWrapper>
		</Container>
	);
}

const Logout = () => {
    const {
        cognitoUser,
        setCredentials,
        setSession,
        setSignedIn,
        setCognitoUser,
    } = useContext(AuthContext);

    const signOut = async () => {
        // todo: confirm sign out
        try {
            logAmplitudeEventProd('signOut', {
                username: cognitoUser.username,
            });
    
            const signOutResult = await Auth.signOut();
            setSignedIn(false);
            console.log(signOutResult);
            // setCognitoUser({});
            // setSession({});
            // setCredentials({});
        } catch (error) {
            console.log(error);
        }
    }

    const Container = styled(View)`
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	`;

    const LogoutButtonContainer = styled(Pressable)`
        width: 90%;
        height: 40px;
    `;

    return (
		<Container>
			<LogoutButtonContainer>
				<BWButton onPress={signOut} text={"Log Out"} />
			</LogoutButtonContainer>
		</Container>
	);
}