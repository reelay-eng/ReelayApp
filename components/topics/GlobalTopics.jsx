import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { Icon } from 'react-native-elements';
import TopicCard from './TopicCard';
import exampleTopic from './exampleTopic.json';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');

const CreateTopicButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: black;
    border-color: white;
    border-radius: 20px;
    border-width: 1px;
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
`
const HeaderContainerLeft = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-left: 15px;
`
const HeaderContainerRight = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding: 15px;
`
const GlobalTopicsContainer = styled(View)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`
const SeeAllTopicsText = styled(ReelayText.Subtitle2)`
    color: ${ReelayColors.reelayBlue};
    margin-right: 15px;
`
const TopicsPreviewContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`

export default GlobalTopics = ({ navigation }) => {
    const fetchedTopics = useSelector(state => state.globalTopics);
    const advanceToTopicsList = () => navigation.push('TopicsListScreen');

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

    const TopicsRow = () => {
        const renderTopic = (topic, index) => {
            const onPress = () => console.log('pressed on topic');
            return (
                <TopicCard 
                    key={index} 
                    globalTopicIndex={index}
                    navigation={navigation} 
                    onPress={onPress} 
                    topic={topic} 
                />
            );
        }

        return (
            <TopicsPreviewContainer 
                horizontal 
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
            >
                { fetchedTopics.map(renderTopic) }
            </TopicsPreviewContainer>
        );
    }
    
    return (
        <GlobalTopicsContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <Icon type='ionicon' name='bulb' size={24} color='white' />
                    <HeaderText>{'Topics'}</HeaderText>
                </HeaderContainerLeft>
                <HeaderContainerRight onPress={advanceToTopicsList}>
                    <SeeAllTopicsText>{'See all'}</SeeAllTopicsText>
                </HeaderContainerRight>
            </HeaderContainer>
            { fetchedTopics.length > 0 && <TopicsRow /> }
            <CreateTopicButton />
        </GlobalTopicsContainer>
    )
}