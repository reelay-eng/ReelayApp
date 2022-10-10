import React, { useContext, useRef, useState } from 'react';
import { 
    ActivityIndicator,
    Dimensions,
    Keyboard, 
    SafeAreaView, 
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { getClubTopics } from '../../api/ClubsApi';
import { createTopic, getTopics } from '../../api/TopicsApi';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import TopicAddFirstReelayDrawer from '../../components/topics/TopicAddFirstReelayDrawer';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { notifyClubOnTopicAdded } from '../../api/ClubNotifications';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { TopicsBannerIconSVG, TopicsGiantIconSVG, TopicsIconSVG } from '../../components/global/SVGs';

const { width } = Dimensions.get('window');

const CreateTopicButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${(props) => props.disabled 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-radius: 40px;
    justify-content: center;
    height: 40px;
    width: ${width - 56}px;
`
const CreateTopicText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 16px;
`
const CreateScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderContainer = styled(View)`
    margin-bottom: 16px;
`
const TitleInputField = styled(TextInput)`
    background-color: #1a1a1a;
    border-radius: 32px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 18px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 16px;
    padding-left: 20px;
    padding-right: 20px;
`
const DescriptionInputField = styled(TitleInputField)`
`
const PromptText = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    flex: 1;
    font-size: 24px;
    line-height: 32px;
    margin-left: 12px;
`
const PromptView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 40px;
    margin-bottom: 12px;
`
const SectionContainer = styled(View)`
    margin-left: 20px;
    margin-right: 20px;
    margin-top: 16px;
`
const SectionContainerBottom = styled(SectionContainer)`
    align-items: center;
    bottom: 20px;
`
const TitleText = styled(ReelayText.Subtitle2)`
    color: ${(props) => props.disabled ? 'black' : 'white'};
    font-size: 16px;
`
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 70;
const DESCRIPTION_MAX_LENGTH = 140;

export default function CreateTopicScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);
    const [addFirstReelayDrawerVisible, setAddFirstReelayDrawerVisible] = useState(false);

    const club = route?.params?.club ?? null;
    const authSession = useSelector(state => state.authSession);
    const myHomeContent = useSelector(state => state.myHomeContent);

    const refreshClubTopics = async () => {
        if (!club) return;
        try { 
            const topics = await getClubTopics({
                authSession,
                clubID: club.id,
                reqUserSub: reelayDBUser?.sub,
            });
            club.topics = topics;
            dispatch({ type: 'setUpdatedClub', payload: club });
        } catch (error) {
            console.log(error);
            showErrorToast('Ruh roh! Could not load club activity');
        }
    }

    const refreshDiscoverTopics = async () => {
        try {
            const topics = await getTopics({
                authSession,
                page: 0,
                reqUserSub: reelayDBUser?.sub,
                source: 'discover',
            });
            const payload = { discover: topics };
            dispatch({ type: 'setTopics', payload });
        } catch (error) {
            console.log(error);
        }
    }

    const refreshTopics = (club) ? refreshClubTopics : refreshDiscoverTopics;

    const dispatch = useDispatch();
    const descriptionFieldRef = useRef(null);
    const descriptionTextRef = useRef('');
    const publishedTopicRef = useRef(null);
    const titleFieldRef = useRef(null);
    const titleTextRef = useRef('');

    const changeDescriptionText = (text) => descriptionTextRef.current = text;
    const changeTitleText = (text) => titleTextRef.current = text;
    const focusDescription = () => descriptionFieldRef?.current && descriptionFieldRef.current.focus();
    const focusTitle = () => titleFieldRef?.current && titleFieldRef.current.focus();

    const CreateTopicButton = () => {
        const [publishing, setPublishing] = useState(false);
        const onPress = async () => {
            if (publishing) return;
            setPublishing(true);
            const titleText = titleTextRef.current;

            if (titleText.length < TITLE_MIN_LENGTH) {
                showErrorToast('Could not create topic: prompt is too short');
                setPublishing(false);
                return;
            }

            const publishResult = await createTopic({ 
                clubID: club?.id ?? null,
                creatorName: reelayDBUser?.username,
                creatorSub: reelayDBUser?.sub,
                description: descriptionTextRef.current,
                title: titleTextRef.current,
            });
            console.log(publishResult);

            if (!publishResult || publishResult?.error) {
                showErrorToast('Something went wrong! Could not create topic');
                setPublishing(false);
            } else {
                publishResult.reelays = [];
                publishedTopicRef.current = publishResult;

                if (club) {
                    club.topics = [publishResult, ...club.topics];
                    dispatch({ type: 'setUpdatedClub', payload: club });
                    dispatch({ type: 'setNewTopicCreatedInClub', payload: publishResult });
                } else {
                    dispatch({ type: 'setTopics', payload: {
                        discover: [publishResult, ...myHomeContent?.discover?.topics]
                    }});
                }
                showMessageToast('Topic created');
                setAddFirstReelayDrawerVisible(true);

                logAmplitudeEventProd('createdTopic', {
                    title: titleTextRef.current,
                    description: descriptionTextRef.current,
                    creatorName: reelayDBUser?.username,
                    inClub: !!club,
                    club: club?.name ?? null,
                });

                if (club) {
                    notifyClubOnTopicAdded({ club, topic: publishResult, addedByUser: {
                        sub: reelayDBUser?.sub,
                        username: reelayDBUser?.username,
                    }});
                }
            }
            return publishResult;
        };

        return (
            <CreateTopicButtonContainer onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <CreateTopicText>{'Create topic'}</CreateTopicText> }
            </CreateTopicButtonContainer>
        );
    }

    const DescriptionInput = () => {
        return (
            <SectionContainer>
                <TouchableWithoutFeedback onPress={focusDescription}>
                    <DescriptionInputField 
                        ref={descriptionFieldRef}
                        blurOnSubmit={true}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        multiline
                        numberOfLines={3}
                        defaultValue={descriptionTextRef.current}
                        placeholder={"Description (optional)"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeDescriptionText}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionContainer> 
        );
    }

    const Header = () => {
        const headerText = (club) ? club?.name : 'start a new topic';
        return (
            <HeaderContainer>
                <HeaderWithBackButton navigation={navigation} text={headerText} />
            </HeaderContainer>
        );
    }

    const TitleInput = () => {
        return (
            <SectionContainer>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={TITLE_MAX_LENGTH}
                        multiline
                        numberOfLines={2}
                        defaultValue={titleTextRef.current}
                        placeholder={"Title (required)"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onSubmitEditing={Keyboard.dismiss}
                        returnKeyLabel="done"
                        returnKeyType="done"
                    />
                </TouchableWithoutFeedback>   
            </SectionContainer> 
        );
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        }
    });

    const CreatePrompt = () => {
        return (
            <PromptView>
                <TopicsBannerIconSVG />
                <PromptText>{'What should people reelay?'}</PromptText>
            </PromptView> 
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <CreateScreenContainer>
                <View style={{ display: 'flex' }}>
                    <Header />
                    <CreatePrompt />
                    <TitleInput />
                    <DescriptionInput />
                </View>
                <SectionContainerBottom>
                    <CreateTopicButton />
                </SectionContainerBottom>
                { addFirstReelayDrawerVisible && (
                    <TopicAddFirstReelayDrawer 
                        navigation={navigation}
                        drawerVisible={addFirstReelayDrawerVisible}
                        setDrawerVisible={setAddFirstReelayDrawerVisible}
                        refreshTopics={refreshTopics}
                        topic={publishedTopicRef.current}
                    /> 
                )}
            </CreateScreenContainer>
        </TouchableWithoutFeedback>
    );
};