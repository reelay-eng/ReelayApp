import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { removeTitleFromClub } from '../../api/ClubsApi';
import { useSelector } from 'react-redux';


const TitleDrawerContents = ({ clubTitle, onRefresh, setDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [drawerState, setDrawerState] = useState('options');
    const authSession = useSelector(state => state.authSession);

    const addedByMe = (clubTitle.addedByUserSub === reelayDBUser?.sub);
    const isAdmin = (reelayDBUser?.role === 'admin');
    const canDelete = (clubTitle.reelays.length === 0) && (addedByMe || isAdmin);
    const bottomOffset = useSafeAreaInsets().bottom + 15;
    
    const ContentContainer = styled(View)`
        padding-left: 24px;
        padding-right: 24px;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: #1a1a1a;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding-bottom: ${bottomOffset}px;
        width: 100%;
    `
    const IconSpacer = styled(View)`
        width: 8px;
    `
    const OptionContainerPressable = styled(TouchableOpacity)`
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        margin-top: 20px;
        color: #2977EF;
    `
    const OptionText = styled(ReelayText.Body2)`
        color: white;
    `
    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const Header = () => {
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 20px;
            margin-bottom: 5px;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
            height: 16px;
        `		

        return (
            <HeaderContainer>
                <CloseButtonContainer onPress={closeDrawer} />
            </HeaderContainer>
        );
    }

    const Prompt = ({ text }) => {
        const PromptContainer = styled(View)`
            align-items: flex-start;
        `
        const PromptText = styled(ReelayText.Subtitle1Emphasized)`
            color: white;
            padding-top: 8px;
        `
        return (
            <PromptContainer>
                <PromptText>{text}</PromptText>
            </PromptContainer>
        );
    }

    const RemoveTitleOption = () => {
        const onPress = async () => {
            setDrawerState('remove-title-confirm');
        }
        
        const optionText = (addedByMe) ? 'Remove Title' : '(Admin) Remove Title'

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
        );
    }

    const RemoveTitleConfirm = () => {
        const onPress = async () => {
            setDrawerState('remove-title-complete');
            const removeResult = await removeTitleFromClub({
                authSession,
                clubID: clubTitle.clubID,
                tmdbTitleID: clubTitle.tmdbTitleID,
                titleType: clubTitle.titleType,
                reqUserSub: reelayDBUser?.sub,
            })
            console.log(removeResult);
            onRefresh();

            showMessageToast('This title has been removed');
            logAmplitudeEventProd('removeTitle', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                addedByUsername: clubTitle.addedByUsername,
                addedByUserSub: clubTitle.addedByUserSub,
                title: clubTitle.title.display,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to remove this title?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, remove`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const RemoveTitleComplete = () => {
        const removeTitleMessage = 'You have removed this title for everyone';
        
        return (
            <ContentContainer>
                <Prompt text={removeTitleMessage} />
            </ContentContainer>
        );
    }

    const DotMenuOptions = () => {
        return (
            <ContentContainer>
                { (canDelete) && <RemoveTitleOption /> }
            </ContentContainer>
        );
    }

    return (
            <DrawerContainer>
                <Header />
                { drawerState === 'options' && <DotMenuOptions /> }
                { drawerState === 'remove-title-confirm' && <RemoveTitleConfirm /> }
                { drawerState === 'remove-title-complete' && <RemoveTitleComplete /> }
            </DrawerContainer>
    );}

export default ClubTitleDotMenuDrawer = ({ 
    navigation, 
    clubTitle, 
    drawerVisible, 
    setDrawerVisible, 
    onRefresh,
}) => {
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const closeDrawer = () => setDrawerVisible(false);
    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={drawerVisible}>
                <Backdrop onPress={closeDrawer}/>
                <TitleDrawerContents 
                    clubTitle={clubTitle} 
                    onRefresh={onRefresh}
                    setDrawerVisible={setDrawerVisible} 
                />
            </Modal>
        </ModalContainer>
    );

}
