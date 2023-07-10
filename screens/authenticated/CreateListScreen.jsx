import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { TopicsBannerIconSVG } from '../../components/global/SVGs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createList, getLists } from '../../api/ListsApi';

const { width } = Dimensions.get('window');

const CreateTopicButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${(props) => props.disabled 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-radius: 48px;
    justify-content: center;
    height: 48px;
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
    bottom: ${props => props.bottomOffset + 50}px;
`
const TITLE_MIN_LENGTH = 6;
const TITLE_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 140;

export default CreateListScreen = ({ navigation, route }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [addFirstReelayDrawerVisible, setAddFirstReelayDrawerVisible] = useState(false);

    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const club = route?.params?.club ?? null;
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


    const getListss = async() =>{
        const GetListData = await getLists({reqUserSub:reelayDBUser?.sub});
        dispatch({ type: 'setListData', payload: GetListData });
    }

    const CreateTopicButton = () => {
        const [publishing, setPublishing] = useState(false);
        const onPress = async () => {
            if (publishing) return;
            setPublishing(true);
            const titleText = titleTextRef.current;

            if (titleText.length < TITLE_MIN_LENGTH) {
                showErrorToast('Could not create list: prompt is too short');
                setPublishing(false);
                return;
            }

            const postBody = {    
                listName : titleTextRef.current,
                creatorSub: reelayDBUser?.sub,
                creatorName: reelayDBUser?.username,
                shareSub : reelayDBUser?.sub,
                // shareName : "",
                description: descriptionTextRef.current,
            }

            navigation.navigate("SearchTitleScreen",{ListData:postBody, fromListAdd:true})
            setPublishing(false);

            // const publishResult = await createList(postBody);
            // console.log('publishResult',publishResult);

            // if (!publishResult || publishResult?.error) {
            //     showErrorToast('Something went wrong! Could not create topic');
            //     setPublishing(false);
            // } else {
            //     publishResult.reelays = [];
            //     publishedTopicRef.current = publishResult;
            //     await getListss();
            //     navigation.goBack();
            //     showMessageToast('List created');

            //     logAmplitudeEventProd('createdLists', {
            //         title: titleTextRef.current,
            //         description: descriptionTextRef.current,
            //         creatorName: reelayDBUser?.username,
            //     });

            // }
            return publishResult;
        };

        return (
            <CreateTopicButtonContainer onPress={onPress}>
                { publishing && <ActivityIndicator/> }
                { !publishing && <CreateTopicText>{'Create list'}</CreateTopicText> }
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
        const headerText = (club) ? club?.name : 'create a new list';
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
                        placeholder={"List Title (required)"}
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
                <SectionContainerBottom bottomOffset={bottomOffset}>
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