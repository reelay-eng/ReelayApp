import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, suspendAccount } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteReportedChatMessage, reportChatMessage } from '../../api/ClubsApi';

const ContentPolicy  = require('../../constants/ContentPolicy.json');

const MessageDotMenuContents = ({ message, navigation, socketRef }) => {
    const { reelayDBUser } = useContext(AuthContext);

    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const isMyMessage = (reelayDBUser?.sub === message?.userSub); 

    const [drawerState, setDrawerState] = useState('options');
    const [selectedPolicy, setSelectedPolicy] = useState({});
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
            const blockCreatorResult = await blockCreator(message?.userSub, reelayDBUser?.sub);
            console.log(blockCreatorResult);
            setDrawerState('block-creator-complete');

            logAmplitudeEventProd('blockCreator', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: message?.username,
                creatorSub: message?.userSub,
                clubID: message?.clubID,
                messageID: message?.id,
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

    const DeleteMessageOption = () => {
        const onPress = async () => {
            setDrawerState('delete-message-confirm');
        }
        
        const optionText = (isMyMessage) ? 'Delete Message' : '(Admin) Delete Message'

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
        );
    }

    const DeleteMessageConfirm = () => {
        const onPress = async () => {
            const socket = socketRef?.current;
            if (socket) {
                socket.emit('deleteMessageInChat', {
                    authSession,
                    clubID: message?.clubID,
                    message: message,
                    userSub: reelayDBUser?.sub,
                });
            } else {
                // from reported message screen
                const deleteResult = await deleteReportedChatMessage(reelayDBUser?.sub, message);
                console.log('delete chat message result: ', deleteResult);
            }
            showMessageToast('This message has been deleted');
            setDrawerState('delete-message-complete');

            logAmplitudeEventProd('deleteChatMessage', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                authorName: message?.username,
                authorSub: message?.userSub,
                messageID: message?.id,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to delete this message?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, delete`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const DeleteMessageComplete = () => {
        const deleteMessage = 'You have deleted this message for everyone';
        
        return (
            <ContentContainer>
                <Prompt text={deleteMessage} />
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
            const reportMessageResult = await reportChatMessage(reelayDBUser?.sub, {
                authorSub: message?.userSub, 
                authorName: message?.username,
                policyViolationCode: selectedPolicy.id, 
                clubID: message?.clubID,
                messageID: message?.id,
            });

            console.log('report message result: ', reportMessageResult?.error);
            setDrawerState('report-content-complete');

            logAmplitudeEventProd('reportChatMessage', {
                authorSub: message?.userSub, 
                authorName: message?.username,
                policyViolationCode: selectedPolicy.id, 
                messageID: message?.id,
                messageText: message?.text,
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
        const reportMessage = 'You have reported this message. Reelay moderators are notified, and will review this content within 24 hours. Please reach out to support@reelay.app for more.';
        
        return (
            <ContentContainer>
                <Prompt text={reportMessage} />
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
            const suspendAccountResult = await suspendAccount(message?.userSub, reelayDBUser?.sub);
            console.log(suspendAccountResult);
            setDrawerState('suspend-account-complete');

            logAmplitudeEventProd('suspendAccount', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                authorSub: message?.userSub, 
                authorName: message?.username,
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

    const ViewReportedContentFeedOption = () => {
        const onPress = () => {
            closeDrawer();
            navigation.push('ReportedChatMessagesScreen');
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
                { !isMyMessage && <ReportContentOption /> }
                { !isMyMessage && <BlockCreatorOption /> }
                { (reelayDBUser?.role === 'admin' || isMyMessage) && <DeleteMessageOption /> }
                { (reelayDBUser?.role === 'admin') && !isMyMessage && <SuspendAccountOption /> }
                { (reelayDBUser?.role === 'admin') && <ViewReportedContentFeedOption /> }
            </ContentContainer>
        );
    }

    return (
            <DrawerContainer>
                <Header />
                { drawerState === 'options' && <DotMenuOptions /> }
                { drawerState === 'block-creator-confirm' && <BlockCreatorConfirm /> }
                { drawerState === 'block-creator-complete' && <BlockCreatorComplete /> }
                { drawerState === 'delete-message-confirm' && <DeleteMessageConfirm /> }
                { drawerState === 'delete-message-complete' && <DeleteMessageComplete /> }
                { drawerState === 'report-content-select-violation' && <ReportContentSelectViolation /> }
                { drawerState === 'report-content-submit' && <ReportContentSubmit /> }
                { drawerState === 'report-content-complete' && <ReportContentComplete /> }
                { drawerState === 'suspend-account-confirm' && <SuspendAccountConfirm /> }
                { drawerState === 'suspend-account-complete' && <SuspendAccountComplete /> }
            </DrawerContainer>
    );
}

const ChatMessage3DotDrawer = ({ message, navigation, socketRef }) => {
    const dispatch = useDispatch();
    const closeDrawer = () => {
        dispatch({ type: 'setOpenedActivityDotMenu', payload: null });
    }

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
            <Modal animationType='slide' transparent={true} visible={true}>
                <Backdrop onPress={closeDrawer}/>
                <MessageDotMenuContents message={message} navigation={navigation} socketRef={socketRef} />
            </Modal>
        </ModalContainer>
    );

}

export default ChatMessage3DotDrawer;