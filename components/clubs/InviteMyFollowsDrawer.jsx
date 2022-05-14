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
import { addMemberToClub } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../utils/toasts';

const { width } = Dimensions.get('window');

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    margin-top: auto;
    max-height: 70%;
    padding-bottom: 80px;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    padding: 12px;
    padding-bottom: 0px;
`
const HeaderText = styled(ReelayText.CaptionEmphasized)`
    color: white;
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

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderText>{'Invite your friends'}</HeaderText>
            </HeaderContainer>
        );
    }

    const SendInvitesButton = () => {
        const addInvitee = async (followObj) => {
            return await addMemberToClub({
                authSession,
                clubID: club.id,
                userSub: followObj.followSub,
                username: followObj.followName,
                role: 'member',
                invitedBySub: reelayDBUser?.sub,
                invitedByUsername: reelayDBUser?.username,
                inviteLinkID: null,
            });
        }

        const addInviteesToClub = async () => {
            try {
                if (sendingInvites) return;
                setSendingInvites(true);
                const inviteResults = await Promise.all(followsToSend.current.map(addInvitee));
                console.log('Invite results: ', inviteResults);
                setSendingInvites(false);
                const peopleWord = (inviteResults.length > 1) ? 'people' : 'person';
                showMessageToast(`Added ${inviteResults.length} ${peopleWord} to ${club.name}`);
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
                <SendInvitesButtonContainer onPress={addInviteesToClub}>
                    { sendingInvites && <ActivityIndicator /> }
                    { !sendingInvites && (
                        <React.Fragment>
                            <Icon type='ionicon' name='paper-plane' size={16} color='white' />
                            <SendInvitesButtonText>{'Invite to club'}</SendInvitesButtonText>                    
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
                    <Header />
                        <InviteMyFollowsList clubMembers={club.members} followsToSend={followsToSend} />
                    <SendInvitesButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}