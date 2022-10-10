import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    TouchableOpacity, 
    View,
} from 'react-native';

import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InviteMyFollowsList from './InviteMyFollowsList';
import { inviteMemberToClub } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';
import { notifyNewMemberOnClubInvite } from '../../api/ClubNotifications';

const { width } = Dimensions.get('window');

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    background-color: black;
    border-color: #1c1c1c;
    border-bottom-color: black;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-width: 2px;
    padding: 16px;
    margin-top: auto;
    max-height: 70%;
    padding-bottom: 80px;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const SendInvitesButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    width: ${width - 32}px;
`
const SendInvitesButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const SendInvitesButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    margin-left: 4px;
`

export default InviteMyFollowsDrawer = ({ club, drawerVisible, setDrawerVisible, onRefresh }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const followsToSend = useRef([]);
    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);
    const [sendingInvites, setSendingInvites] = useState(false);

    const SendInvitesButton = () => {
        const sendInvite = async (followObj) => {
            const inviteMemberResult = await inviteMemberToClub({
                authSession,
                clubID: club.id,
                userSub: followObj.followSub,
                username: followObj.followName,
                role: 'member',
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                clubLinkID: null,
            });

            notifyNewMemberOnClubInvite({
                club,
                invitedByUser: reelayDBUser,
                newMember: {
                    sub: followObj.followSub,
                    username: followObj.followName,
                },
            });

            logAmplitudeEventProd('inviteMemberToClub', {
                invitedByUsername: reelayDBUser?.username,
                invitedByUserSub: reelayDBUser?.sub,
                newMemberUsername: followObj?.followName,
                newMemberUserSub: followObj?.followSub,
                club: club?.name,
                clubID: club?.id,
            });
            
            return inviteMemberResult;
        }

        const sendAllInvites = async () => {
            try {
                if (sendingInvites) return;
                setSendingInvites(true);
                const inviteResults = await Promise.all(followsToSend.current.map(sendInvite));
                setSendingInvites(false);
                const peopleWord = (inviteResults.length > 1) ? 'people' : 'person';
                showMessageToast(`Invited ${inviteResults.length} ${peopleWord} to ${club.name}`);
                onRefresh();
                closeDrawer();
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh roh! Couldn\'t send invites. Try again?');
                setSendingInvites(false);
            }
        } 

        return (
            <SendInvitesButtonOuterContainer bottomOffset={bottomOffset}>
                <SendInvitesButtonContainer onPress={sendAllInvites}>
                    { sendingInvites && <ActivityIndicator /> }
                    { !sendingInvites && (
                        <React.Fragment>
                            <Icon type='ionicon' name='paper-plane' size={16} color='white' />
                            <SendInvitesButtonText>{'Invite to group chat'}</SendInvitesButtonText>                    
                        </React.Fragment>
                    )}
                </SendInvitesButtonContainer>
            </SendInvitesButtonOuterContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <InviteMyFollowsList clubMembers={club.members} followsToSend={followsToSend} />
                    <SendInvitesButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}