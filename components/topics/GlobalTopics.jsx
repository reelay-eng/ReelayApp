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
    background-color: ${ReelayColors.reelayBlue};
    border-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 36px;
    margin: 16px;
    margin-left: 15px;
    width: ${width - 32}px;
`
const CreateTopicText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 12px;
    line-height: 16px;
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
    margin-top: 15px;
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
const TopicsPreviewContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`

export default GlobalTopics = ({ navigation }) => {
    const fetchedTopics = useSelector(state => state.globalTopics);
    console.log('fetched topics: ', fetchedTopics);

    const CreateTopicButton = () => {
        const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');
        return (
            <CreateTopicButtonContainer onPress={advanceToCreateTopic}>
                <CreateTopicText>
                    {'Create a topic'}
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
            </HeaderContainer>
            { fetchedTopics.length > 0 && <TopicsRow /> }
            <CreateTopicButton />
        </GlobalTopicsContainer>
    )
}