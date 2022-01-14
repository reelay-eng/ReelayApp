import React, { useContext, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, removeReelay } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';

const ReelayDotMenuContents = ({ reelay, navigation }) => {
    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const { setDotMenuVisible } = useContext(FeedContext);
    const isMyReelay = (cognitoUser.attributes.sub === reelay.creator.sub); 

    const [drawerState, setDrawerState] = useState('options');
    console.log('3 dot drawer rendering: ', drawerState);
    const drawerStates = [
        'options',
        'block-creator-confirm',
        'block-creator-complete',
        'report-content-confirm',
        'remove-reelay-confirm',
    ];

    const ContentContainer = styled(View)`
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

    const Prompt = ({ text }) => {
        const PromptContainer = styled(View)`
            align-items: flex-start;
            margin-left: 20px;
        `
        const PromptText = styled(ReelayText.Body1)`
            color: white;
        `
        return (
            <PromptContainer>
                <PromptText>{text}</PromptText>
            </PromptContainer>
        );
    }

    const ReportReelayOption = () => {
        const onPress = () => {
            // todo
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='flag' size={27} color={'white'} />
                <OptionText selected={false}>{`Report Reelay`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const ReportReelayConfirm = () => {
        onPress = () => {
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
            <ContentContainer>
                <Header />
                <CancelOption />
            </ContentContainer>
        );
    }

    const RemoveReelayOption = () => {
        const onPress = async () => {
            setDrawerState('remove-reelay-confirm');
        }
        
        const optionText = (isMyReelay) ? 'Remove Reelay' : 'Remove Reelay (Admin)'

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={27} color={'white'} />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
        );
    }

    const RemoveReelayConfirm = () => {
        const onPress = async () => {
            const removeResult = await removeReelay(reelay);
            console.log(removeResult);
            showMessageToast('This reelay has been removed');

            logAmplitudeEventProd('removeReelay', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });
        }

        return (
            <ContentContainer>
                <Header />
                <Prompt text={'Are you sure you want to remove this reelay?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={27} color={'white'} />
                    <OptionText>{`Yes, remove`}</OptionText>
                </OptionContainerPressable>
                <CancelOption />
            </ContentContainer>
        );
    }

    const BlockCreatorOption = () => {
        const onPress = async () => {
            setDrawerState('block-creator-confirm');
        }
        
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='remove-circle' size={27} color={'white'} />
                <OptionText>{`Block Creator`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const BlockCreatorConfirm = () => {
        const onPress = async () => {
            const blockCreatorResult = await blockCreator(reelay.creator.sub, cognitoUser.attributes.sub);
            console.log(blockCreatorResult);
            setDrawerState('block-creator-complete');

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
            <ContentContainer>
                <Header />
                <Prompt text={'Are you sure you want to block this creator?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={27} color={'white'} />
                    <OptionText>{`Yes, block this creator`}</OptionText>
                </OptionContainerPressable>
                <CancelOption />
            </ContentContainer>
        );
    }

    const BlockCreatorComplete = () => {
        const blockCompleteMessage = 'You have blocked this user. Our support team will review their posts and comments. Please email support@reelay.app if there\'s more we can help with.';
        return (
            <ContentContainer>
                <Header />
                <Prompt text={blockCompleteMessage} />
                <CancelOption />
            </ContentContainer>
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
                <OptionText>{`View Reported Content (Admin)`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const CancelOption = () => {
        const onPress = () => {
            if (drawerState === 'options') {
                closeDrawer();
            } else {
                setDrawerState('options');
            }
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='arrow-back' size={27} color={'white'} />
                <OptionText>{`Back`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const DotMenuOptions = () => {
        return (
            <ContentContainer>
                <Header />
                { !isMyReelay && <ReportReelayOption /> }
                { !isMyReelay && <BlockCreatorOption /> }
                { (reelayDBUser?.role === 'admin' || isMyReelay) && <RemoveReelayOption /> }
                { (reelayDBUser?.role === 'admin') && <ViewReportedContentFeedOption /> }
                <CancelOption />
            </ContentContainer>
        );
    }

    return (
        <DrawerContainer>
            { drawerState === 'options' && <DotMenuOptions /> }
            { drawerState === 'block-creator-confirm' && <BlockCreatorConfirm /> }
            { drawerState === 'block-creator-complete' && <BlockCreatorComplete /> }
            { drawerState === 'report-content-confirm' && <ReportReelayConfirm /> }
            { drawerState === 'remove-reelay-confirm' && <RemoveReelayConfirm /> }
        </DrawerContainer>
    );
}

export default Reelay3DotDrawer = ({ reelay, navigation }) => {
    const { dotMenuVisible, setDotMenuVisible } = useContext(FeedContext);
    const closeDrawer = () => setDotMenuVisible(false);

    const ModalContainer = styled(View)`
        position: absolute;
    `
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={dotMenuVisible}>
                <Backdrop onPress={closeDrawer}/>
                <ReelayDotMenuContents reelay={reelay} navigation={navigation} />
            </Modal>
        </ModalContainer>
    );

}