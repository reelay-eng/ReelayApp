import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, removeAnnouncement, removeReelay, reportReelay, suspendAccount } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';
import DownloadButton from '../create-reelay/DownloadButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';

const ContentPolicy  = require('../../constants/ContentPolicy.json');

const ReelayDotMenuContents = ({ reelay, navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);

    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const latestAnnouncement = useSelector(state => state.latestAnnouncement);
    const isMyReelay = (reelayDBUser?.sub === reelay.creator.sub); 
    const isLatestAnnouncement = (reelay?.sub === latestAnnouncement?.reelaySub);

    const [drawerState, setDrawerState] = useState('options');
    const [selectedPolicy, setSelectedPolicy] = useState({});
    const bottomOffset = useSafeAreaInsets().bottom + 15;
    
    const ContentContainer = styled(View)`
        padding-left: 24px;
        padding-right: 24px;
        width: 100%;
    `
    const DownloadContainer = styled(View)`
        align-items: flex-end;
        justify-content: flex-end;
        position: absolute;
        bottom: -20px;
        right: 36px;
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
    const ListOptionContainer = styled(View)`
        flex-direction: row;
        margin: 6px;
        margin-right: 0px;
    `
    const OptionContainerPressable = styled(Pressable)`
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
        dispatch({ type: 'setDotMenuVisible', payload: false });
    };

    const BlockCreatorOption = () => {
        const onPress = async () => {
            setDrawerState('block-creator-confirm');
        }
        
        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{`Block Creator`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const BlockCreatorConfirm = () => {
        const onPress = async () => {
            const blockCreatorResult = await blockCreator(reelay.creator.sub, reelayDBUser?.sub);
            console.log(blockCreatorResult);
            setDrawerState('block-creator-complete');

            logAmplitudeEventProd('blockCreator', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to block this creator?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, block this creator`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const BlockCreatorComplete = () => {
        const blockCompleteMessage = 'You have blocked this user. Our support team will review their posts and comments. Please email support@reelay.app if there\'s more we can help with.';
        return (
            <ContentContainer>
                <Prompt text={blockCompleteMessage} />
            </ContentContainer>
        );
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            justify-content: center;
            height: 8px;
            margin-left: 12px;
            margin-right: 20px;
            margin-bottom: 12px;
        `
        return <HeaderContainer />;
    }

    const PinAnnouncementOption = () => {
        const advanceToPinScreen = async () => {
            closeDrawer();
            navigation.push('PinAnnouncementScreen', { reelay });
        }

        const onPress = () => (isLatestAnnouncement) 
            ? setDrawerState('unpin-confirm') 
            : advanceToPinScreen();

        const optionText = (isLatestAnnouncement)
            ? '(Admin) Unpin from announcements'
            : '(Admin) Pin as announcement';
        
        return (
            <OptionContainerPressable onPress={onPress}>
                <FontAwesomeIcon icon={faThumbtack} color='white' size={20}/>
                <IconSpacer />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
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

    const RemoveReelayOption = () => {
        const onPress = async () => {
            setDrawerState('remove-reelay-confirm');
        }
        
        const optionText = (isMyReelay) ? 'Delete Reelay' : '(Admin) Delete Reelay'

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
        );
    }

    const RemoveReelayConfirm = () => {
        const onPress = async () => {
            const removeResult = await removeReelay(reelay);
            console.log(removeResult);
            showMessageToast('This reelay has been deleted');
            setDrawerState('remove-reelay-complete');

            logAmplitudeEventProd('removeReelay', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to delete this reelay?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, remove`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const RemoveReelayComplete = () => {
        const removeReelayMessage = 'You have removed this reelay for everyone';
        
        return (
            <ContentContainer>
                <Prompt text={removeReelayMessage} />
            </ContentContainer>
        );
    }

    const ReportContentOption = () => {
        const onPress = () => {
            setDrawerState('report-content-select-violation');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='flag' size={20} color={'white'} />
                <IconSpacer />
                <OptionText selected={false}>{`Report Content`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const ReportContentSelectViolation = () => {
        return (
            <ScrollView>
                <ContentContainer>
                    <Prompt text={'What should we review?'} />
                    { ContentPolicy.policies.map((policy) => {
                        return <ContentPolicyOption key={policy.id} policy={policy} />;
                    })}
                </ContentContainer>
            </ScrollView>
        );
    }

    const ContentPolicyOption = ({ policy }) => {
        const { id, displayName, statement, exampleList } = policy;

        const onPress = () => {
            // todo
            setSelectedPolicy(policy);
            setDrawerState('report-content-submit');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <OptionText selected={false}>{displayName}</OptionText>
                <Icon type='ionicon' name='chevron-forward' size={20} color={'white'} />
            </OptionContainerPressable>
        );
    }

    const ReportContentSubmit = () => {
        const { statement, exampleList } = selectedPolicy;
        const onPress = async () => {
            const reportReelayResult = await reportReelay(reelayDBUser?.sub, {
                creatorSub: reelay.creator.sub, 
                creatorName: reelay.creator.username,
                policyViolationCode: selectedPolicy.id, 
                reelaySub: reelay.sub,
            });

            console.log('report reelay result: ', reportReelayResult);
            setDrawerState('report-content-complete');

            logAmplitudeEventProd('reportReelay', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
                violationCode: selectedPolicy.id,
            });
        }

        return (
            <ScrollView>
                <ContentContainer>
                    <OptionText>{statement}</OptionText>
                    { exampleList.map((example, index) => {
                        return (
                            <ListOptionContainer>
                                <OptionText key={index}>{example}</OptionText>
                            </ListOptionContainer>
                        );
                     })}
                    <OptionContainerPressable onPress={onPress}>
                        <Icon type='ionicon' name='paper-plane' size={20} color={'white'} />
                        <IconSpacer />
                        <OptionText selected={false}>{'Submit Report'}</OptionText>
                    </OptionContainerPressable>
                </ContentContainer>
            </ScrollView>
        );
    }

    const ReportContentComplete = () => {
        const removeReelayMessage = 'You have reported this reelay. Reelay moderators are notified, and will review this content within 24 hours. Please reach out to support@reelay.app for more.';
        
        return (
            <ContentContainer>
                <Prompt text={removeReelayMessage} />
            </ContentContainer>
        );
    }

    const SuspendAccountOption = () => {
        const onPress = () => {
            setDrawerState('suspend-account-confirm');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='hand-right' size={20} color={'white'} />
                <IconSpacer />
                <OptionText selected={false}>{`(Admin) Suspend Account`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const SuspendAccountConfirm = () => {
        const onPress = async () => {
            const suspendAccountResult = await suspendAccount(reelay.creator.sub, reelayDBUser?.sub);
            console.log(suspendAccountResult);
            setDrawerState('suspend-account-complete');

            logAmplitudeEventProd('suspendAccount', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                reelaySub: reelay.sub,
                title: reelay.title.display,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to suspend this account? They must be manually reinstated'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, suspend this account`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const SuspendAccountComplete = () => {
        const suspendAccountMessage = 'You have suspended this account. It must be manually re-instated';
        return (
            <ContentContainer>
                <Prompt text={suspendAccountMessage} />
            </ContentContainer>
        );
    }

    const UnpinAnnouncementConfirm = () => {
        const onPress = async () => {
            const unpinResult = await removeAnnouncement({
                announcementID: latestAnnouncement?.id,
                authSession,
                reqUserSub: reelayDBUser?.sub,
            });
            console.log(unpinResult);
            setDrawerState('unpin-complete');
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to unpin this announcement?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, unpin`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const UnpinAnnouncementComplete = () => {
        const unpinReelayMessage = 'You have unpinned this reelay.';
        return (
            <ContentContainer>
                <Prompt text={unpinReelayMessage} />
            </ContentContainer>
        );
    }

    const ViewReportedContentFeedOption = () => {
        const onPress = () => {
            closeDrawer();
            navigation.push('ReportedReelaysFeedScreen');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='eye' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{`(Admin) View Reported Content`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const DotMenuOptions = () => {
        return (
            <ContentContainer>
                { !isMyReelay && <ReportContentOption /> }
                { !isMyReelay && <BlockCreatorOption /> }
                { (reelayDBUser?.role === 'admin') && <PinAnnouncementOption /> }
                { (reelayDBUser?.role === 'admin' || isMyReelay) && <RemoveReelayOption /> }
                { (reelayDBUser?.role === 'admin') && !isMyReelay && <SuspendAccountOption /> }
                { (reelayDBUser?.role === 'admin') && <ViewReportedContentFeedOption /> }
                <DownloadOption />
            </ContentContainer>
        );
    }

    const DownloadOption = () => {
        return (
            <DownloadContainer>
                <DownloadButton 
                    height={48}
                    width={48}
                    titleObj={reelay.title} 
                    videoURI={reelay.content.videoURI} 
                    uploadedReelay={reelay}
                />
            </DownloadContainer>
        );
    }

    return (
            <DrawerContainer>
                <Header />
                { drawerState === 'options' && <DotMenuOptions /> }
                { drawerState === 'block-creator-confirm' && <BlockCreatorConfirm /> }
                { drawerState === 'block-creator-complete' && <BlockCreatorComplete /> }
                { drawerState === 'remove-reelay-confirm' && <RemoveReelayConfirm /> }
                { drawerState === 'remove-reelay-complete' && <RemoveReelayComplete /> }
                { drawerState === 'report-content-select-violation' && <ReportContentSelectViolation /> }
                { drawerState === 'report-content-submit' && <ReportContentSubmit /> }
                { drawerState === 'report-content-complete' && <ReportContentComplete /> }
                { drawerState === 'suspend-account-confirm' && <SuspendAccountConfirm /> }
                { drawerState === 'suspend-account-complete' && <SuspendAccountComplete /> }
                { drawerState === 'unpin-confirm' && <UnpinAnnouncementConfirm /> }
                { drawerState === 'unpin-complete' && <UnpinAnnouncementComplete /> }
            </DrawerContainer>
    );
}

const Reelay3DotDrawer = ({ reelay, navigation }) => {
    const dotMenuVisible = useSelector(state => state.dotMenuVisible);
    const dispatch = useDispatch();
    const closeDrawer = () => dispatch({ type: 'setDotMenuVisible', payload: false });

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

const areEqual = (prevDrawerProps, nextDrawerProps) => {
    return true;
}

export default memo(Reelay3DotDrawer, (areEqual));