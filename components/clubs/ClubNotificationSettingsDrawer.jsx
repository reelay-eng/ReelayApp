import React, { useContext, useRef, useState } from 'react';
import { 
    Dimensions,
    Keyboard, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView, 
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthContext } from '../../context/AuthContext';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const AllSettingsView = styled(View)`
    padding-top: 16px;
    padding-bottom: ${props => props.bottomOffset + 16}px;
`
const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    margin-top: auto;
    width: 100%;
`
const ModalContainer = styled(Pressable)`
    position: absolute;
`
const SettingsRow = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    padding-bottom: 0px;
    width: 100%;
`
const SettingsSubtext = styled(ReelayText.Body2)`
    color: rgba(255,255,255,0.7);
    display: flex;
    width: ${width - 100}px;
`
const SettingsText = styled(ReelayText.Body2Emphasized)`
    display: flex;
    color: white;
`
const SettingsTextView = styled(View)`
`

export default ClubNotificationSettingsDrawer = ({ club, navigation, closeDrawer }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const bottomOffset = useSafeAreaInsets().bottom;

    const [allowNotifyMessages, setAllowNotifyMessages] = useState(true);
    const [allowNotifyPosts, setAllowNotifyPosts] = useState(true);

    const switchAllowNotifyMessages = async () => {
        const shouldAllow = !allowNotifyMessages;
        setAllowNotifyMessages(shouldAllow);
        // const patchResult = await editClub({
        //     authSession,
        //     clubID: club.id,
        //     membersCanInvite: shouldAllow,
        //     reqUserSub: reelayDBUser?.sub,
        // });
        // console.log(patchResult);
    }

    const switchAllowNotifyPosts = async () => {
        const shouldAllow = !allowNotifyPosts;
        setAllowNotifyPosts(shouldAllow);
        // const patchResult = await editClub({
        //     authSession,
        //     clubID: club.id,
        //     membersCanInvite: shouldAllow,
        //     reqUserSub: reelayDBUser?.sub,
        // });
        // console.log(patchResult);
    }

    const AllowNotifyMessagesSetting = () => {
        return (
            <SettingsRow onPress={switchAllowNotifyMessages}>
                <SettingsTextView>
                    <SettingsText>{'Allow message notifications'}</SettingsText>
                    <SettingsSubtext>{'Get notified when conversations happen in this chat'}</SettingsSubtext>
                </SettingsTextView>
                <Switch 
                    value={allowNotifyMessages}
                    onValueChange={switchAllowNotifyMessages}
                    trackColor={{ 
                        false: "#39393D", 
                        true: ReelayColors.reelayGreen,
                    }}
                    thumbColor={"#FFFFFF"}
                    ios_backgroundColor="#39393D"    
                />
            </SettingsRow>
        );
}

    const AllowNotifyPostsSetting = () => {
        return (
            <SettingsRow onPress={switchAllowNotifyPosts}>
                <SettingsTextView>
                    <SettingsText>{'Allow posts notifications'}</SettingsText>
                    <SettingsSubtext>{'Get notified when reelays are posted in this chat'}</SettingsSubtext>
                </SettingsTextView>
                <Switch 
                    value={allowNotifyPosts}
                    onValueChange={switchAllowNotifyPosts}
                    trackColor={{ 
                        false: "#39393D", 
                        true: ReelayColors.reelayGreen,
                    }}
                    thumbColor={"#FFFFFF"}
                    ios_backgroundColor="#39393D"    
                />
            </SettingsRow>
        );
    }

    const NotificationSettings = () => {
        return (
            <AllSettingsView bottomOffset={bottomOffset}>
                <AllowNotifyMessagesSetting />
                <AllowNotifyPostsSetting />
            </AllSettingsView>
        );
    }

    return (
		<ModalContainer>
			<ScrollView keyboardShouldPersistTaps={"handled"}>
				<Modal animationType="slide" transparent={true} visible={true}>
					<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
						<Backdrop onPress={closeDrawer} />
						<DrawerContainer>
							<NotificationSettings />
						</DrawerContainer>
					</KeyboardAvoidingView>
				</Modal>
			</ScrollView>
		</ModalContainer>
    );
}