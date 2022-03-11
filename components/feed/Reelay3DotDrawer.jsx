import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, removeReelay, reportReelay, suspendAccount } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';

const ContentPolicy  = require('../../constants/ContentPolicy.json');

const ReelayDotMenuContents = ({ reelay, navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const { setDotMenuVisible } = useContext(FeedContext);
    const isMyReelay = (reelayDBUser?.sub === reelay.creator.sub); 

    const [drawerState, setDrawerState] = useState('options');
    const [selectedPolicy, setSelectedPolicy] = useState({});
    
    console.log('3 dot drawer rendering: ', drawerState);
    const drawerStates = [
        'options',
        'block-creator-confirm',
        'block-creator-complete',
        'report-content-select-violation',
        'report-content-submit',
        'report-content-complete',
        'remove-reelay-confirm',
        'suspend-account-confirm',
        'suspend-account-complete',
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

    const Header = () => {
        const HeaderContainer = styled(View)`
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 6px;
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

    const RemoveReelayComplete = () => {
        const removeReelayMessage = 'You have removed this reelay for everyone';
        
        return (
            <ContentContainer>
                <Header />
                <Prompt text={removeReelayMessage} />
                <CancelOption />
            </ContentContainer>
        );
    }

    const ReportContentOption = () => {
        const onPress = () => {
            setDrawerState('report-content-select-violation');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='flag' size={27} color={'white'} />
                <OptionText selected={false}>{`Report Content`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const ReportContentSelectViolation = () => {
        return (
            <ScrollView>
                <ContentContainer>
                    <Header />
                    <Prompt text={'Thanks for flagging. What should we review?'} />
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
                <Icon type='ionicon' name='chevron-forward' size={27} color={'white'} />
            </OptionContainerPressable>
        );
    }

    const ReportContentSubmit = () => {
        const { statement, exampleList } = selectedPolicy;
        if (!selectedPolicy.id) {
            // todo
        }

        onPress = async () => {
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
                    <Header />
                    <Prompt text={statement} />
                    { exampleList.map((example, index) => <Prompt key={index} text={`\t*\t${example}`} /> )}
                    <OptionContainerPressable onPress={onPress}>
                        <Icon type='ionicon' name='paper-plane' size={27} color={'white'} />
                        <OptionText selected={false}>{'Submit Report'}</OptionText>
                    </OptionContainerPressable>
                    <CancelOption />
                </ContentContainer>
            </ScrollView>
        );
    }

    const ReportContentComplete = () => {
        const removeReelayMessage = 'You have reported this reelay. Reelay moderators are notified, and will review this content within 24 hours. Please reach out to support@reelay.app for more.';
        
        return (
            <ContentContainer>
                <Header />
                <Prompt text={removeReelayMessage} />
                <CancelOption />
            </ContentContainer>
        );
    }

    const SuspendAccountOption = () => {
        const onPress = () => {
            setDrawerState('suspend-account-confirm');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='hand-right' size={27} color={'white'} />
                <OptionText selected={false}>{`Suspend Account (Admin)`}</OptionText>
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
                <Header />
                <Prompt text={'Are you sure you want to suspend this account? They must be manually reinstated'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={27} color={'white'} />
                    <OptionText>{`Yes, suspend this account`}</OptionText>
                </OptionContainerPressable>
                <CancelOption />
            </ContentContainer>
        );
    }

    const SuspendAccountComplete = () => {
        const suspendAccountMessage = 'You have suspended this account. It must be manually re-instated';
        return (
            <ContentContainer>
                <Header />
                <Prompt text={suspendAccountMessage} />
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
                { !isMyReelay && <ReportContentOption /> }
                { !isMyReelay && <BlockCreatorOption /> }
                { (reelayDBUser?.role === 'admin' || isMyReelay) && <RemoveReelayOption /> }
                { (reelayDBUser?.role === 'admin') && <ViewReportedContentFeedOption /> }
                { (reelayDBUser?.role === 'admin') && !isMyReelay && <SuspendAccountOption /> }
                <CancelOption />
            </ContentContainer>
        );
    }

    return (
        <DrawerContainer>
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
        </DrawerContainer>
    );
}

const Reelay3DotDrawer = ({ reelay, navigation }) => {
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

const areEqual = (prevDrawerProps, nextDrawerProps) => {
    return true;
}

export default memo(Reelay3DotDrawer, (areEqual));