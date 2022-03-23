import React, { Fragment, useContext } from 'react';
import { Image, Linking, Modal, Pressable, SafeAreaView, View } from 'react-native';
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
        height: 60%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { reelayDBUser } = useContext(AuthContext);
    const closeDrawer= () => {
        logAmplitudeEventProd('closedDonationDrawer', {
            donationTitle: donateObj?.donationTitle,
            creatorName: reelay?.creator?.username,
            reelaySub: reelay?.sub,
            title: reelay?.title?.display,
            username: reelayDBUser?.username,
        });    
        setDonateDrawerVisible(false);
    }

    logAmplitudeEventProd('openedDonationDrawer', {
        donationTitle: donateObj?.donationTitle,
        creatorName: reelay?.creator?.username,
        reelaySub: reelay?.sub,
        title: reelay?.title?.display,
        username: reelayDBUser?.username,
});

    return (
        <ModalContainer>
            <Modal animationType="slide" transparent={true} visible={donateDrawerVisible}>
                <Backdrop onPress={closeDrawer} />
                <DrawerContainer>
                    <DonatePrompt donateObj={donateObj} reelay={reelay} 
                        setDonateDrawerVisible={setDonateDrawerVisible} />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}

const DonatePrompt = ({ donateObj, reelay, setDonateDrawerVisible }) => {
    const { donationTitle, imageURL, linkURL } = donateObj;
    const { reelayDBUser } = useContext(AuthContext);
    const closeDrawer = () => {
        logAmplitudeEventProd('closedDonationDrawer', {
            donationTitle: donationTitle,
            creatorName: reelay?.creator?.username,
            reelaySub: reelay?.sub,
            title: reelay?.title?.display,
            username: reelayDBUser?.username,
        });    
        setDonateDrawerVisible(false);
    }

    const BottomContainer = styled(View)`
        align-items: center;
        width: 100%;
    `
    const DonateTitleText = styled(ReelayText.H5)`
        color: white;
        margin-bottom: 10px;
        border-bottom-width: 2px;
        border-bottom-color: white;
        border-radius: 4px;
        padding: 10px;
        text-align: center;
    `
    const ExplainText = styled(ReelayText.Body2Emphasized)`
        color: white;
        margin-bottom: 20px;
        text-align: left;
        width: 90%;
    `
    const DonatePromptContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: center;
        margin: 10px;
        height: 100%;
    `
    const DonationImage = styled(Image)`
        border-radius: 8px;
        height: 140px;
        margin: 20px;
        width: 140px;
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

    const openDonateLink = () => {
        logAmplitudeEventProd('openedDonationLink', {
            donationTitle: donateObj?.donationTitle,
            creatorName: reelay?.creator?.username,
            reelaySub: reelay?.sub,
            title: reelay?.title?.display,
            username: reelayDBUser?.username,
        });
        Linking.openURL(linkURL);    
    }

    return (
        <Fragment>
            <DonatePromptContainer>
                <DonationImage source={{ uri: imageURL }} />
                <TopContainer>
                    <DonateTitleText>{donationTitle}</DonateTitleText>
                    <ExplainText>
                        {'We\'ve set up a donation link for this title. Tap the link below to learn more and give.'}
                    </ExplainText>
                </TopContainer>
                <BottomContainer>
                    <LinkToDonateRaw text={linkURL} url={linkURL} linkStyle={{ color: 'white' }} />
                    <LinkToDonateButton onPress={openDonateLink}>
                        <LinkToDonateText>{'Donate Now'}</LinkToDonateText>
                    </LinkToDonateButton>
                    <KeepBrowsingButton onPress={closeDrawer}>
                        <KeepBrowsingText>{'Close'}</KeepBrowsingText>
                    </KeepBrowsingButton>
                </BottomContainer>
            </DonatePromptContainer>
        </Fragment>
    );
}