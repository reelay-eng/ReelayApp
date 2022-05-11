import React, { useContext, useRef } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { Icon } from 'react-native-elements';
import TopicCard from './TopicCard';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import Carousel from 'react-native-snap-carousel';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';

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

export default GlobalTopics = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const curTopicIndex = useRef(0);
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
        const onBeforeSnapToItem = async (swipeIndex) => {
            const swipeDirection = swipeIndex < curTopicIndex.current ? 'left' : 'right';
            const nextTopic = fetchedTopics[swipeIndex];
            const prevTopic = fetchedTopics[curTopicIndex.current];

            logAmplitudeEventProd('swipedTopics', {
                nextTopicTitle: nextTopic.title,
                prevReelayTitle: prevTopic.title,
                source: 'global',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            });
        }

        const renderTopic = ({ item, index }) => {
            return (
                <TopicCard 
                    key={index} 
                    navigation={navigation} 
                    topic={item} 
                />
            );
        }

        return (
            <Carousel
                activeAnimationType={'decay'}
                activeSlideAlignment={'center'}
                data={fetchedTopics}
                inactiveSlideScale={0.95}
                itemHeight={220}
                itemWidth={width - 32}
                onBeforeSnapToItem={onBeforeSnapToItem}
                renderItem={renderTopic}
                sliderHeight={240}
                sliderWidth={width}
            />
        );
    }
    
    return (
        <GlobalTopicsContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <Icon type='ionicon' name='logo-ionic' size={24} color='white' />
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