import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';

export default Reelay3DotDrawer = ({ reelay, navigation }) => {
    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const { dotMenuVisible, setDotMenuVisible } = useContext(FeedContext);

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DotMenuOptionsContainer = styled(View)`
        width: 100%;
        padding: 30px;
    `
    const DrawerContainer = styled(View)`
        background-color: ${ReelayColors.reelayBlack};
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        border-width: 1px;
        height: auto;
        margin-top: auto;
        max-height: 70%;
        padding-bottom: 40px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const OptionContainerPressable = styled(Pressable)`
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        margin-top: 20px;
        color: #2977EF;
    `
    const OptionText = styled(ReelayText.Body1)`
        margin-left: 20px;
        margin-right: 20px;
        color: white;
    `
    const closeDrawer = () => {
        setDotMenuVisible(false)
    };

    const Header = () => {
        const HeaderContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
        `;
        const CloseButtonContainer = styled(Pressable)`
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
        `
        return (
            <HeaderContainer>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={"white"} type="ionicon" name="close" size={27} />
                </CloseButtonContainer>
            </HeaderContainer>
        );
    };

    const ReportReelayOption = () => {
        const onPress = () => {
            // todo
            logAmplitudeEventProd('reportReelay', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });    
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='flag' size={27} color={'white'} />
                <OptionText selected={false}>{`Report Reelay`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const FilterReportedReelaysOption = () => {
        const onPress = () => {
            // todo
            logAmplitudeEventProd('filterReportedReelays', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });    
        }
        
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='filter' size={27} color={'white'} />
                <OptionText selected={false}>{`Filter Reported Reelays`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const BlockCreatorOption = () => {
        const onPress = () => {
            // todo
            logAmplitudeEventProd('blockCreator', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });    
        }
        
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='remove-circle' size={27} color={'white'} />
                <OptionText selected={false}>{`Block Creator`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const ViewReportedContentFeedOption = () => {
        const onPress = () => {
            closeDrawer();
            navigation.push('ReportedContentFeedScreen');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='eye' size={27} color={'white'} />
                <OptionText selected={false}>{`Review Reported Content (Admin Only)`}</OptionText>
            </OptionContainerPressable>
        );

    }

    const CancelOption = () => {
        return (
            <OptionContainerPressable onPress={closeDrawer}>
                <Icon type='ionicon' name='arrow-back' size={27} color={'white'} />
                <OptionText selected={false}>{`Back`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const DotMenuOptions = () => {
        return (
            <DotMenuOptionsContainer>
                <Header />
                <ReportReelayOption />
                <FilterReportedReelaysOption />
                <BlockCreatorOption />
                { (reelayDBUser?.role === 'admin') && <ViewReportedContentFeedOption /> }
                <CancelOption />
            </DotMenuOptionsContainer>
        );
    }

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={dotMenuVisible}>
                <Backdrop onPress={closeDrawer}/>
                <DrawerContainer>
                    <DotMenuOptions />
                </DrawerContainer>
            </Modal>
        </ModalContainer>
    );
}