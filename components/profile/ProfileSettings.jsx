import React, { useContext, useEffect } from 'react';
import { View, Linking, SafeAreaView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { Icon } from "react-native-elements";
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { HeaderWithBackButton } from "../global/Headers";
import { getReelay, prepareReelay, registerPushTokenForUser } from '../../api/ReelayDBApi';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

export const ProfileSettings = ({navigation}) => {
    const ViewContainer = styled(SafeAreaView)`
        color: white;
        height: 100%;
        width: 100%;
    `
    const SettingsContainer = styled(SafeAreaView)`
        align-items: center;
        display: flex;
        justify-content: space-between;
        width: 100%;
    `;
    const { reelayDBUser } = useContext(AuthContext);
    const isAdmin = (reelayDBUser?.role === 'admin');
    const dispatch = useDispatch();
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const loadWelcomeVideoScreen = async () => {
        const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
        const welcomeReelay = await getReelay(welcomeReelaySub, 'dev');
        const preparedReelay = await prepareReelay(welcomeReelay);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }

    return (
		<ViewContainer>
			<HeaderWithBackButton navigation={navigation} text='settings & info' />
			<SettingsContainer>
                <SettingEntry
                    text="Account Information"
                    iconName="person"
                    onPress={() => {
                        navigation.push("AccountInfoScreen");
                    }}
                />
                <SettingEntry
                    text="Notifications"
                    iconName="notifications-outline"
                    onPress={() => {
                        navigation.push("NotificationSettingsScreen");
                    }}
                />
                <SettingEntry
                    text="Privacy Policy"
                    iconName="clipboard-outline"
                    onPress={() => {
                        Linking.openURL("https://www.reelay.app/privacy-policy");
                    }}
                />
                <SettingEntry
                    text="Report an issue"
                    iconName="flag-outline"
                    onPress={() => {
                        navigation.push('ReportIssueScreen', { viewedContentType: 'profileSettings' });
                    }}
                />
                { isAdmin && (
                    <SettingEntry
                        text="(Admin) See reported issues"
                        iconName="flag-outline"
                        onPress={() => {
                            navigation.push('AdminReportedIssuesScreen');
                        }}
                    />                    
                )}
                <SettingEntry
                    text="Terms and Conditions"
                    iconName="document-text-outline"
                    onPress={() => {
                        Linking.openURL("https://www.reelay.app/terms-of-use");
                    }}
                />
                <SettingEntry
                    text="TMDB Credit"
                    iconName="server-outline"
                    onPress={() => {
                        navigation.push("TMDBCreditScreen");
                    }}
                />
                <SettingEntry
                    text="Watch Tutorial"
                    iconName="glasses"
                    onPress={loadWelcomeVideoScreen}
                />
			</SettingsContainer>
            <Logout />
		</ViewContainer>
	);
}

const SettingEntry = ({text, iconName, onPress}) => {
    const Container = styled(TouchableOpacity)`
        display: flex;
        flex-direction: row;
        justify-content: center;
        height: 60px;
        width: 100%;
    `
    const SettingEntryWrapper = styled(View)`
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 90%;
    `
    const SettingEntryIconTextContainer = styled(View)`
        align-items: flex-start;
        display: flex;
        flex-direction: row;
    `
    const SettingEntryText = styled(ReelayText.Body1)`
        color: #FFFFFF;
        margin-left: 12px;
        margin-top: 3px;
    `
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
        reelayDBUser, 
        reelayDBUserID,
        setReelayDBUserID,
    } = useContext(AuthContext);
    const signUpFromGuest = useSelector(state => state.signUpFromGuest);
    const dispatch = useDispatch();

    const signOut = async () => {
        // todo: confirm sign out
        try {
            logAmplitudeEventProd('signOut', {
                username: reelayDBUser?.username,
                email: reelayDBUser?.email,
            });
    
            if (signUpFromGuest) {
                dispatch({ type: 'setSignUpFromGuest', payload: false });
            }
            dispatch({ type: 'setSignedIn', payload: false });
            setReelayDBUserID(null);
            const signOutResult = await Auth.signOut();
            dispatch({ type: 'clearAuthSession', payload: {} });
            registerPushTokenForUser(reelayDBUserID, null); 
            // todo: deregister cognito user
            console.log(signOutResult);
        } catch (error) {
            console.log(error);
        }
    }

    const LogoutContainer = styled(SafeAreaView)`
        align-items: center;
        bottom: 0px;
        display: flex;
		justify-content: center;
        position: absolute;
        width: 100%;
	`
    const LogoutButtonContainer = styled(TouchableOpacity)`
        bottom: 0px;
        height: 40px;
        width: 90%;
    `

    return (
		<LogoutContainer>
			<LogoutButtonContainer>
				<BWButton onPress={signOut} text={"Log Out"} />
			</LogoutButtonContainer>
		</LogoutContainer>
	);
}