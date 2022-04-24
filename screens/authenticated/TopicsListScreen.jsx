import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    Dimensions,
    Keyboard, 
    Pressable, 
    SafeAreaView, 
    ScrollView,
    TextInput, 
    TouchableOpacity,
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import TopicCard from '../../components/topics/TopicCard';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';

import { showErrorToast, showMessageToast } from '../../components/utils/toasts';

const { width } = Dimensions.get('window');

const CreateTopicButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin: 16px;
    margin-left: 14px;
    width: ${width - 32}px;
`
const CreateTopicText = styled(ReelayText.Subtitle2)`
    color: white;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderLeftContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-left: 20px;
    margin-top: 4px;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    height: 100%;
    width: 100%;
`
const SearchButtonContainer = styled(TouchableOpacity)`
    margin-right: 20px;
`
const TopicCardContainer = styled(View)`
    margin-bottom: 18px;
`
const TopicScrollContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`

export default TopicsListScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const fetchedTopics = useSelector(state => state.globalTopics);

    const CreateTopicButton = () => {
        const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');
        return (
            <CreateTopicButtonContainer onPress={advanceToCreateTopic}>
                <CreateTopicText>
                    {'Start a new topic'}
                </CreateTopicText>
            </CreateTopicButtonContainer>
        );
    }

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderLeftContainer>
                    <BackButton navigation={navigation} />
                    <HeaderText>{'Topics'}</HeaderText>
                </HeaderLeftContainer>
                <SearchTopicsButton />
            </HeaderContainer>
        );
    }

    const SearchTopicsButton = () => {
        return (
            <SearchButtonContainer>
                <Icon type='ionicon' name='search' color='white' size={24} />
            </SearchButtonContainer>
        )
    }

    const TopicScroll = () => {
        const renderTopic = (topic, index) => {
            const onPress = () => console.log('pressed on topic');
            return (
                <TopicCardContainer key={topic.id} >
                    <TopicCard 
                        navigation={navigation} 
                        onPress={onPress} 
                        topic={topic} 
                    />
                </TopicCardContainer>
            );
        }

        return (
            <TopicScrollContainer 
                showsVerticalScrollIndicator={false}
                onEndReached={() => console.log('end reached')}
            >
                { fetchedTopics.map(renderTopic) }
            </TopicScrollContainer>
        )
    }

    useEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        }
    })

    return (
        <ScreenContainer>
            <Header />
            <TopicScroll />
            <CreateTopicButton />
        </ScreenContainer>
    );
}