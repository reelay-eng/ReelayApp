import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import colors from "../../constants/ReelayColors";
import BackButton from "../../components/utils/BackButton";
import { Icon } from "react-native-elements";
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { Header } from "../../components/global/HeaderWithBackButton";

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
			<Header navigation={navigation} />
			<SettingsContainer>
				<TopSettings>
					<SettingEntry
						navigation={navigation}
						text="Notifications"
						to="NotificationSettingsScreen"
					/>
				</TopSettings>
				<BottomSettings>
					<Logout />
				</BottomSettings>
			</SettingsContainer>
		</ViewContainer>
	);
}

const SettingEntry = ({navigation, text, to}) => {
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
        <Container onPress={() => {navigation.push(to)}}>
            <SettingEntryWrapper>
                <SettingEntryIconTextContainer>
                    <Icon type='ionicon' name='notifications-outline' color={"#FFFFFF"} size={24}/>
                    <SettingEntryText>{text}</SettingEntryText>
                </SettingEntryIconTextContainer>
                <Icon type='ionicon' name='chevron-forward-outline' color={"#FFFFFF"} size={24}/>
            </SettingEntryWrapper>
        </Container>
    )
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