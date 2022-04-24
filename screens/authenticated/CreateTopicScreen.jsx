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
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import { createTopic } from '../../api/TopicsApi';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import TopicAddFirstReelayDrawer from '../../components/topics/TopicAddFirstReelayDrawer';

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
const HeaderText = styled(ReelayText.H5Emphasized)`
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
    height: 200px;
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
const TITLE_MAX_LENGTH = 140;
const DESCRIPTION_MAX_LENGTH = 280;

export default function CreateTopicScreen({ navigation, route }) {
    const { reelayDBUser } = useContext(AuthContext);
    const [addFirstReelayDrawerVisible, setAddFirstReelayDrawerVisible] = useState(false);

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
                publishedTopicRef.current = publishResult;
                showMessageToast('Topic created!');
                setAddFirstReelayDrawerVisible(true);
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
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        multiline
                        defaultValue={descriptionTextRef.current}
                        placeholder={"Go on..."}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeDescriptionText}
                        onPressOut={Keyboard.dismiss()}
                        returnKeyLabel="return"
                        returnKeyType="default"
                    />
                </TouchableWithoutFeedback>   
            </SectionContainer> 
        );
    }

    const Header = () => {
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
                        maxLength={TITLE_MAX_LENGTH}
                        multiline
                        numberOfLines={4}
                        defaultValue={titleTextRef.current}
                        placeholder={"What should people reelay?"}
                        placeholderTextColor={'rgba(255,255,255,0.6)'}
                        onChangeText={changeTitleText}
                        onPressOut={Keyboard.dismiss()}
                        returnKeyLabel="return"
                        returnKeyType="default"
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
        <CreateScreenContainer>
            <View>
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
                    publishedTopic={publishedTopicRef.current}
                /> 
            )}
        </CreateScreenContainer>
    );
};