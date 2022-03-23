import React, { Fragment, useContext, useEffect } from 'react';
import { Image, Linking, Modal, Pressable, SafeAreaView, View } from 'react-native';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { AuthContext } from '../../context/AuthContext';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import Autolink from 'react-native-autolink';

export default DonateDrawer = ({ 
    donateObj, 
    donateDrawerVisible, 
    reelay,
    setDonateDrawerVisible 
}) => {
    const DrawerContainer = styled(View)`
        background-color: #1a1a1a;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        margin-top: auto;
        width: 100%;
        height: 60%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    return (
        <ModalContainer>
            <Modal animationType="slide" transparent={true} visible={donateDrawerVisible}>
                <DrawerContainer>
                    <DonatePrompt donateObj={donateObj} setDonateDrawerVisible={setDonateDrawerVisible} />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}

const DonatePrompt = ({ donateObj, setDonateDrawerVisible }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { linkURL } = donateObj;
    const closeDrawer = () => setDonateDrawerVisible(false);

    const BottomContainer = styled(View)`
        align-items: center;
        width: 100%;
    `
    const DonateTitleText = styled(ReelayText.H5)`
        color: white;
        font-size: 20px;
        margin-bottom: 10px;
        text-align: center;
    `
    const DogWithGlassesImage = styled(Image)`
        height: 80px;
        width: 80px;
    `
    const DogWithGlassesContainer = styled(View)`
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        width: 100%;
    `
    const ExplainText = styled(ReelayText.Body2Emphasized)`
        color: white;
        margin-bottom: 20px;
        text-align: center;
        width: 75%;
    `
    const HeaderText = styled(ReelayText.H5)`
        color: white;
        margin-bottom: 10px;
        text-align: center;
    `
    const DonatePromptContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: center;
        margin: 10px;
        height: 100%;
    `
    const KeepBrowsingButton = styled(Pressable)`
        align-items: center;
        background-color: white;
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        margin-top: 10px;
        width: 90%;
    `
    const KeepBrowsingText = styled(ReelayText.CaptionEmphasized)`
        color: black;
        text-align: center;
    `
    const LinkToDonateButton = styled(Pressable)`
        align-items: center;
        background-color: ${ReelayColors.reelayGreen};
        border-radius: 60px;
        height: 48px;
        justify-content: center;
        width: 90%;
    `
    const LinkToDonateText = styled(ReelayText.CaptionEmphasized)`
        color: black;
        text-align: center;
    `
    const LinkToDonateRaw = styled(Autolink)`
        color: white;
        margin-bottom: 20px;
        text-align: center;
        width: 75%;
    `
    const TopContainer = styled(View)`
        align-items: center;
        justify-content: center;
        width: 100%;
    `

    return (
        <DonatePromptContainer>
            <TopContainer>
                <HeaderText>{'Donate to a cause'}</HeaderText>
                <DonateTitleText>{'Ukraine\'s defenders'}</DonateTitleText>
                <ExplainText>
                    {'A cause is set up for this title. You can tap the link below to donate.'}
                </ExplainText>
                <LinkToDonateRaw text={linkURL} url={linkURL} linkStyle={{ color: 'white' }}>
                    { linkURL }
                </LinkToDonateRaw>
            </TopContainer>
            <BottomContainer>
                <LinkToDonateButton onPress={() => {
                    Linking.openURL(linkURL);
                }}>
                    <LinkToDonateText>{'Donate Now'}</LinkToDonateText>
                </LinkToDonateButton>
                <KeepBrowsingButton onPress={closeDrawer}>
                    <KeepBrowsingText>{'Close'}</KeepBrowsingText>
                </KeepBrowsingButton>
            </BottomContainer>
        </DonatePromptContainer>
    );
}