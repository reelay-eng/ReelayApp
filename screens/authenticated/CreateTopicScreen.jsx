import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
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
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import ClubBanner from '../../components/clubs/ClubBanner';

import { getClubTopics } from '../../api/ClubsApi';
import { createTopic, getTopics } from '../../api/TopicsApi';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import TopicAddFirstReelayDrawer from '../../components/topics/TopicAddFirstReelayDrawer';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { notifyClubOnTopicAdded } from '../../api/ClubNotifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// color is ReelayColors.reelayGreen at reduced opacity
const ClubTitleContainer = styled(View)`
    align-items: center;
    background-color: rgba(4, 189, 108, 0.65);
    border-radius: 12px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    flex-direction: row;
    margin: 20px;
    margin-left: 0px;
    margin-top: 0px;
    margin-bottom: 0px;
    padding-top: 12px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 10px;
`
const ClubTitleText = styled(ReelayText.H6)`
    color: white;
    flex-direction: row;
    font-size: 14px;
    line-height: 16px;
    margin-left: 4px;
`
const ClubBannerContainer = styled(View)`
    height: ${props => props.topOffset}px;
    bottom: ${props => props.topOffset}px;
`
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
const CreateScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderText = styled(ReelayText.H6Emphasized)`
    color: white;
    margin-left: 20px;
    margin-top: 4px;
`
const TitleInputField = styled(TextInput)`
    border-color: white;
    border-radius: 4px;
    border-width: 1px;
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    margin-top: 6px;
    padding: 12px;
`
const DescriptionInputField = styled(TitleInputField)`
    height: 90px;
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
    const topOffset = useSafeAreaInsets().top;

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

    const ClubHeader = () => {
        return (
            <Fragment>
                <ClubBannerContainer topOffset={topOffset}>
                    <ClubBanner club={club} navigation={navigation} />
                </ClubBannerContainer>
                <View style={{ height: 20 }} />
            </Fragment>
        )
    }

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
                    console.log('new club topics: ', club.topics);
                    dispatch({ type: 'setUpdatedClub', payload: club });
                } else {
                    dispatch({ type: 'setTopics', payload: {
                        discover: [publishResult, ...myHomeContent?.discover?.topics]
                    }});
                }
                showMessageToast('Topic created!');
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
                { !publishing && <TitleText>{'Create topic'}</TitleText> }
            </CreateTopicButtonContainer>
        );
    }

    const DescriptionInput = () => {
        return (
            <SectionContainer>
                <TitleText>{'Description'}</TitleText>
                <TouchableWithoutFeedback onPress={focusDescription}>
                    <DescriptionInputField 
                        ref={descriptionFieldRef}
                        blurOnSubmit={true}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        multiline
                        numberOfLines={3}
                        defaultValue={descriptionTextRef.current}
                        placeholder={"Go on..."}
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
        if (club) return <ClubHeader />
        return (
            <HeaderContainer>
                <BackButton navigation={navigation} />
                <HeaderText>{'Start a new topic'}</HeaderText>
            </HeaderContainer>
        );
    }

    const TitleInput = () => {
        return (
            <SectionContainer>
                <TitleText>{'Prompt'}</TitleText>
                <TouchableWithoutFeedback onPress={focusTitle}>
                    <TitleInputField 
                        ref={titleFieldRef}
                        blurOnSubmit={true}
                        maxLength={TITLE_MAX_LENGTH}
                        multiline
                        numberOfLines={2}
                        defaultValue={titleTextRef.current}
                        placeholder={"What should people reelay?"}
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <CreateScreenContainer>
                <View style={{ display: 'flex' }}>
                    <Header />
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