import React, { useContext, useState, memo} from 'react';
import { Modal, View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { blockCreator, suspendAccount } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import styled from 'styled-components/native';

import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import { showMessageToast } from '../utils/toasts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { removeTopic, reportTopic } from '../../api/TopicsApi';
import { useDispatch } from 'react-redux';

const ContentPolicy  = require('../../constants/ContentPolicy.json');

const TopicDrawerContents = ({ closeDrawer, navigation, topic }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [drawerState, setDrawerState] = useState('options');
    const isMyTopic = (topic.creatorSub === reelayDBUser?.sub);

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
            setDrawerState('block-creator-complete');
            const blockCreatorResult = await blockCreator(topic.creatorSub, reelayDBUser?.sub);
            console.log(blockCreatorResult);

            logAmplitudeEventProd('blockCreator', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: topic.creatorName,
                creatorSub: topic.creatorSub,
                topicID: topic.id,
                title: topic.title,
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
            margin-left: 12px;
            margin-right: 20px;
            margin-bottom: 5px;
            border-bottom-color: #2D2D2D;
            border-bottom-width: 1px;
            padding-top: 8px;
            padding-bottom: 8px;
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

    const RemoveTopicOption = () => {
        const onPress = async () => {
            setDrawerState('remove-topic-confirm');
        }
        
        const optionText = (isMyTopic) ? 'Remove Topic' : '(Admin) Remove Topic'

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='trash' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{optionText}</OptionText>
            </OptionContainerPressable>
        );
    }

    const RemoveTopicConfirm = () => {
        const onPress = async () => {
            setDrawerState('remove-topic-complete');
            const removeResult = await removeTopic({ 
                reqUserSub: reelayDBUser?.sub, 
                topicID: topic.id 
            });
            console.log(removeResult);

            // todo: update state to remove topic from global list
            showMessageToast('This topic has been removed');

            logAmplitudeEventProd('removeTopic', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: topic.creatorName,
                creatorSub: topic.creatorSub,
                topicID: topic.id,
                title: topic.title,
            });
        }

        return (
            <ContentContainer>
                <Prompt text={'Are you sure you want to remove this topic?'} />
                <OptionContainerPressable onPress={onPress}>
                    <Icon type='ionicon' name='remove-circle' size={20} color={'white'} />
                    <IconSpacer />
                    <OptionText>{`Yes, remove`}</OptionText>
                </OptionContainerPressable>
            </ContentContainer>
        );
    }

    const RemoveTopicComplete = () => {
        const removeTopicMessage = 'You have removed this topic for everyone';
        
        return (
            <ContentContainer>
                <Prompt text={removeTopicMessage} />
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
        onPress = async () => {
            setDrawerState('report-content-complete');
            const reportTopicResult = await reportTopic(reelayDBUser?.sub, {
                creatorSub: topic.creatorSub, 
                creatorName: topic.creatorName,
                policyViolationCode: selectedPolicy.id, 
                topicID: topic.id,
            });

            console.log('report topic result: ', reportTopicResult);

            logAmplitudeEventProd('reportTopic', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: topic.creatorName,
                creatorSub: topic.creatorSub,
                reelaySub: topic.id,
                title: topic.title,
                violationCode: selectedPolicy.id,
            });
        }

        return (
            <ScrollView>
                <ContentContainer>
                    <OptionText>{statement}</OptionText>
                    { exampleList.map((example, index) => {
                        return (
                            <ListOptionContainer key={index}>
                                <OptionText>{example}</OptionText>
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
        const removeTopicMessage = 'You have reported this topic. Reelay moderators are notified, and will review this content within 24 hours. Please reach out to support@reelay.app for more.';
        return (
            <ContentContainer>
                <Prompt text={removeTopicMessage} />
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
            setDrawerState('suspend-account-complete');
            const suspendAccountResult = await suspendAccount(topic.creatorSub, reelayDBUser?.sub);
            console.log(suspendAccountResult);

            logAmplitudeEventProd('suspendAccount', {
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
                creatorName: topic.creatorName,
                creatorSub: topic.creatorSub,
                topicID: topic.id,
                title: topic.title,
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
            navigation.push('ReportedTopicsFeedScreen');
        }

        return (
            <OptionContainerPressable onPress={onPress}>
                <Icon type='ionicon' name='eye' size={20} color={'white'} />
                <IconSpacer />
                <OptionText>{`(Admin) View Reported Topics`}</OptionText>
            </OptionContainerPressable>
        );
    }

    const DotMenuOptions = () => {
        return (
            <ContentContainer>
                { !isMyTopic && <ReportContentOption /> }
                { !isMyTopic && <BlockCreatorOption /> }
                { (reelayDBUser?.role === 'admin' || isMyTopic) && <RemoveTopicOption /> }
                { (reelayDBUser?.role === 'admin') && !isMyTopic && <SuspendAccountOption /> }
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
                { drawerState === 'remove-topic-confirm' && <RemoveTopicConfirm /> }
                { drawerState === 'remove-topic-complete' && <RemoveTopicComplete /> }
                { drawerState === 'report-content-select-violation' && <ReportContentSelectViolation /> }
                { drawerState === 'report-content-submit' && <ReportContentSubmit /> }
                { drawerState === 'report-content-complete' && <ReportContentComplete /> }
                { drawerState === 'suspend-account-confirm' && <SuspendAccountConfirm /> }
                { drawerState === 'suspend-account-complete' && <SuspendAccountComplete /> }
            </DrawerContainer>
    );}

export default TopicDotMenuDrawer = ({ navigation, topic }) => {
    const dispatch = useDispatch();
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const closeDrawer = () => {
        dispatch({ type: 'setOpenedActivityDotMenu', payload: null });
    };

    return (
        <ModalContainer>
            <Modal animationType='slide' transparent={true} visible={true}>
                <Backdrop onPress={closeDrawer}/>
                <TopicDrawerContents 
                    closeDrawer={closeDrawer}
                    navigation={navigation} 
                    topic={topic} 
                />
            </Modal>
        </ModalContainer>
    );

}
