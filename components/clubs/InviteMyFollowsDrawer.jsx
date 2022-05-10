import React, { useContext, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import styled from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InviteMyFollowsList from './InviteMyFollowsList';

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

export default InviteMyFollowsDrawer = ({ clubMembers, drawerVisible, setDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const followsToSend = useRef([]);
    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderText>{'Invite your friends'}</HeaderText>
            </HeaderContainer>
        );
    }

    const SendInvitesButton = () => {
        return (
            <SendInvitesButtonOuterContainer bottomOffset={bottomOffset}>
                <SendInvitesButtonContainer onPress={() => {}}>
                    <Icon type='ionicon' name='paper-plane' size={16} color='white' />
                    <SendInvitesButtonText>{'Send invites'}</SendInvitesButtonText>
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
                        <InviteMyFollowsList clubMembers={clubMembers} followsToSend={followsToSend} />
                    <SendInvitesButton />
                </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
}