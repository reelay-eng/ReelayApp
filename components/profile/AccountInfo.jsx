import React, { useContext } from 'react';
import { View, Pressable, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Auth } from 'aws-amplify';
import { logAmplitudeEventProd } from '../utils/EventLogger';

import { Icon } from "react-native-elements";
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { HeaderWithBackButton } from "../global/Headers";
import { registerPushTokenForUser } from '../../api/ReelayDBApi';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { deregisterSocialAuthSession } from '../../api/ReelayUserApi';

export const AccountInfo = ({navigation}) => {
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
    const TopSettings = styled(View)`
        align-items: center;
        width: 100%;
    `
    const BottomSettings = styled(SafeAreaView)`
        align-items: center;
        bottom: 0px;
        position: absolute;
		width: 100%;
	`
    const dispatch = useDispatch();
    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    return (
		<ViewContainer>
			<HeaderWithBackButton navigation={navigation} text='Account' />
			<SettingsContainer>
				<TopSettings>
                    <AccountSettingEntry
						text="Edit Account"
						onPress={() => {
							navigation.push("EditAccountScreen");
						}}
					/>
                    <AccountSettingEntry
						text="Delete Account"
						onPress={() => {
							navigation.push("DeleteAccountScreen");
						}}
					/>
				</TopSettings>
				<BottomSettings>
				</BottomSettings>
			</SettingsContainer>
            <Logout />
		</ViewContainer>
	);
}

const AccountSettingEntry = ({text, onPress}) => {
    const Container = styled(Pressable)`
        display: flex;
        flex-direction: row;
        justify-content: center;
        height: 50px;
        width: 100%;
    `
    const AccountSettingEntryWrapper = styled(View)`
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 90%;
    `
    const AccountSettingEntryIconTextContainer = styled(View)`
        align-items: flex-start;
        display: flex;
        flex-direction: row;
    `
    const AccountSettingEntryText = styled(ReelayText.Body1)`
        color: #FFFFFF;
        margin-left: 12px;
        margin-top: 3px;
    `
    return (
		<Container onPress={onPress}>
			<AccountSettingEntryWrapper>
				<AccountSettingEntryIconTextContainer>
					<AccountSettingEntryText>{text}</AccountSettingEntryText>
				</AccountSettingEntryIconTextContainer>
				<Icon type="ionicon" name="chevron-forward-outline" color={"#FFFFFF"} size={24} />
			</AccountSettingEntryWrapper>
		</Container>
	);
}

const Logout = () => {
    const { 
        reelayDBUser, 
        reelayDBUserID,
        setReelayDBUserID,
    } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
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

            if (authSession?.method === 'cognito') {
                const signOutResult = await Auth.signOut();
                console.log(signOutResult);
            } else {
                const signOutResult = await deregisterSocialAuthSession({
                    authSession,
                    reelayDBUserID,
                });
                console.log(signOutResult);
            }

            await registerPushTokenForUser(reelayDBUserID, null); 
            dispatch({ type: 'clearAuthSession', payload: {} });
            setReelayDBUserID(null);
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
    const LogoutButtonContainer = styled(Pressable)`
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