import React, { useContext } from 'react';
import { Dimensions, Keyboard, Pressable, Share, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import Constants from 'expo-constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { ShareOutSVG } from '../global/SVGs';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { createDeeplinkPathToClub } from '../../api/ClubsApi';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { showErrorToast } from '../utils/toasts';
import { logAmplitudeEventProd } from '../utils/EventLogger';

const { width } = Dimensions.get('window');

const INVITE_BASE_URL = Constants.manifest.extra.reelayWebInviteUrl;

const PromptGradient = styled(LinearGradient)`
    border-radius: 24px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const PromptText = styled(ReelayText.Body1)`
    color: white;
    padding-left: 20px;
    padding-right: 20px;
`
const PromptOuterView = styled(Pressable)`
    align-items: center;
    display: flex;
    flex: 1;
    justify-content: center;
`
const PromptView = styled(Pressable)`
    align-items: center;
    justify-content: center;
    width: ${width - 104}px;
`
const ShareOutPressable = styled(TouchableOpacity)`
    padding: 6px;
`
const Spacer = styled(View)`
    height: 24px;
`

export default InviteToChatExternalPrompt = ({ club, navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);

    const copyClubLinkToClipboard = async () => {
        try {
            const clubLinkObj = await createDeeplinkPathToClub({
                authSession,
                clubID: club.id,
                invitedByUserSub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
            });

            if (clubLinkObj?.inviteCode && !clubLinkObj?.error) {
                const content = {
                    url: INVITE_BASE_URL + clubLinkObj.inviteCode,
                    title: `${reelayDBUser?.username} invited you to a chat group on Reelay`,
                };
                const options = {};
                const sharedAction = await Share.share(content, options);    
                logAmplitudeEventProd('openedShareDrawer', {
                    username: reelayDBUser?.username,
                    title: club?.name,
                    source: 'shareOutButton',
                });        
            }
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Couldn\'t copy the club link. Try again?');
        }                
    }

    const ShareClubButton = () => {
        return (
            <ShareOutPressable onPress={copyClubLinkToClipboard}>
                <ShareOutSVG />
            </ShareOutPressable>
        );
    }

    return (
        <PromptOuterView onPress={Keyboard.dismiss}>
            <PromptView onPress={Keyboard.dismiss}>
                <PromptGradient colors={[ '#2977EF', '#4C268B' ]} />
                <Spacer />
                <FontAwesomeIcon icon={faUsers} size={60} color='white' /> 
                <Spacer />
                <PromptText>{'Want to share this group chat with a friend outside of Reelay?'}</PromptText>
                <Spacer />
                <ShareClubButton />
                <Spacer />
            </PromptView>
        </PromptOuterView>
    );
}