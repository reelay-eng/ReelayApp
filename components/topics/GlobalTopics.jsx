import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { Icon } from 'react-native-elements';
import TopicCard from './TopicCard';
import exampleTopic from './exampleTopic.json';

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
    const fetchedTopics = [exampleTopic, exampleTopic];

    const TopicsRow = () => {
        return (
            <TopicsPreviewContainer horizontal showsHorizontalScrollIndicator={false}>
                { fetchedTopics.map((topic, index) => {
                    const onPress = () => console.log('pressed on topic');
                    return (
                        <TopicCard 
                            key={index} 
                            navigation={navigation} 
                            onPress={onPress} 
                            topic={topic} 
                        />
                    );
                })}
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
        </GlobalTopicsContainer>
    )
}