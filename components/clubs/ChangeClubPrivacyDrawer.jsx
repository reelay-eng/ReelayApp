import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import ClubPicture from '../global/ClubPicture';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ChangeClubPrivacyView = styled(View)`
    align-items: center;
    justify-content: space-around;
    margin: 10px;
`
const BottomContainer = styled(View)`
    align-items: center;
    margin-bottom: ${props => props.bottomOffset}px;
    width: 100%;
`
const ConfirmButton = styled(Pressable)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 60px;
    height: 48px;
    flex-direction: row;
    justify-content: center;
    width: 90%;
`
const ConfirmText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    text-align: center;
`
const DrawerContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    margin-top: auto;
    width: 100%;
`
const ExplainOverlineText = styled(ReelayText.Overline)`
    color: white;
    margin-top: 12px;
    margin-bottom: 4px;
`
const ExplainHeaderText = styled(ReelayText.H6)`
    color: white;
    margin-top: 12px;
`
const ExplainBodyText = styled(ReelayText.Body2)`
    color: white;
    padding: 10px;
    padding-bottom: 0px;
    text-align: center;
`
const DismissButton = styled(Pressable)`
    align-items: center;
    background-color: transparent;
    border-color: white;
    border-radius: 60px;
    border-width: 1px;
    height: 48px;
    justify-content: center;
    margin-top: 10px;
    width: 90%;
`
const DismissText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    text-align: center;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const TopContainer = styled(View)`
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 20px;
    padding-top: 4px;
`
const HeaderLine = styled(View)`
    justify-content: center;
    border-bottom-color: #2d2d2d;
    border-bottom-width: 3px;
    height: 10px;
    margin-bottom: 16px;
    width: 30%;
`

export default ChangeClubPrivacyDrawer = ({ 
    navigation, 
    clubID,
    drawerVisible, 
    setDrawerVisible, 
    isPrivate,
    confirmChangePrivacy, 
}) => {
    const headingText = (isPrivate)
        ? 'Switching group to public'
        : 'Switching group to private';
    const bodyText = (isPrivate)
        ? 'By changing the group to public, anyone can join'
        : 'By changing the group to private, only invited members can join';

    const bottomOffset = useSafeAreaInsets().bottom;
    const closeDrawer = () => setDrawerVisible(false);

    const ChangeClubPrivacy = () => {    
        return (
            <ChangeClubPrivacyView>
                <TopContainer>
                    <HeaderLine />
                    <ClubPicture border club={{ id: clubID }} size={64} />
                    <ExplainHeaderText>{headingText}</ExplainHeaderText>
                    <ExplainOverlineText>{'Are you sure?'}</ExplainOverlineText>
                    <ExplainBodyText>{bodyText}</ExplainBodyText>
                </TopContainer>
                <BottomContainer bottomOffset={bottomOffset}>
                    <ConfirmButton onPress={confirmChangePrivacy}>
                        <ConfirmText>{`Switch to ${isPrivate ? 'public' : 'private'}`}</ConfirmText>
                    </ConfirmButton>
                    <DismissButton onPress={closeDrawer}>
                        <DismissText>{'Dismiss'}</DismissText>
                    </DismissButton>
                </BottomContainer>
            </ChangeClubPrivacyView>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType="slide" transparent={true} visible={drawerVisible}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <ChangeClubPrivacy 
                        navigation={navigation} 
                        setDrawerVisible={setDrawerVisible} 
                        isPrivate={isPrivate}
                    />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}