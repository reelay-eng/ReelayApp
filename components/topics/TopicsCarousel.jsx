import React, { useContext, useRef } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { Icon } from 'react-native-elements';
import TopicCard from './TopicCard';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import Carousel from 'react-native-snap-carousel';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBreadSlice, faComments, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
const TopicsContainer = styled(View)`
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

export default TopicsCarousel = ({ navigation, source = 'discoverNew' }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const curTopicIndex = useRef(0);

    const followingNewTopics = useSelector(state => state.myFollowingContent?.newTopics);
    const discoverNewTopics = useSelector(state => state.myDiscoverContent?.newTopics);
    const discoverPopularTopics = useSelector(state => state.myDiscoverContent?.popularTopics);

    let displayTopics = [];
    let headerText = 'Topics';
    switch (source) {
        case 'discoverNew':
            displayTopics = discoverNewTopics;
            headerText = 'New topics';
            break;
        case 'discoverPopular':
            displayTopics = discoverPopularTopics;
            headerText = 'Popular topics';
            break;
        case 'followingNew':
            displayTopics = followingNewTopics;
            headerText = 'New topics'
        default:
            break;
    }

    // console.log('discoverNewTopics: ', discoverNewTopics);
    // console.log('discoverPopularTopics: ', discoverPopularTopics);

    const hasReelays = (topic) => topic?.reelays?.length > 0;
    const displayTopicsWithReelays = displayTopics.filter(hasReelays);

    const advanceToTopicsList = () => navigation.push('TopicsListScreen', { source });

    const CreateTopicButton = () => {
        const advanceToCreateTopic = () => {
            if (showMeSignupIfGuest()) return;
            navigation.push('CreateTopicScreen');
        }

        const showMeSignupIfGuest = () => {
            if (reelayDBUser?.username === 'be_our_guest') {
                dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
                return true;
            }
            return false;
        }    
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
            const nextTopic = displayTopics[swipeIndex];
            const prevTopic = displayTopics[curTopicIndex.current];

            logAmplitudeEventProd('swipedTopics', {
                nextTopicTitle: nextTopic.title,
                prevReelayTitle: prevTopic.title,
                source: 'global',
                swipeDirection: swipeDirection,
                username: reelayDBUser?.username,
            });
        }

        const renderTopic = ({ item, index }) => {
            const topic = item;
            const matchTopic = (nextTopic) => (nextTopic.id === topic.id);
            const initTopicIndex = displayTopicsWithReelays.findIndex(matchTopic);
        
            const advanceToFeed = () => {
                if (!topic.reelays?.length) return;
                navigation.push('TopicsFeedScreen', { initTopicIndex, source });
                
                logAmplitudeEventProd('openedTopic', {
                    clubID: null,
                    title: topic.title,
                    username: reelayDBUser?.username,
                });
            }
            return (
                <TopicCard 
                    key={index} 
                    advanceToFeed={advanceToFeed}
                    clubID={null}
                    navigation={navigation} 
                    topic={topic} 
                />
            );
        }

        return (
            <Carousel
                activeAnimationType={'decay'}
                activeSlideAlignment={'center'}
                data={displayTopics}
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
        <TopicsContainer>
            <HeaderContainer>
                <HeaderContainerLeft>
                    <FontAwesomeIcon icon={ faComments } color='white' size={20} />
                    <HeaderText>{headerText}</HeaderText>
                </HeaderContainerLeft>
                <HeaderContainerRight onPress={advanceToTopicsList}>
                    <SeeAllTopicsText>{'See all'}</SeeAllTopicsText>
                </HeaderContainerRight>
            </HeaderContainer>
            { displayTopics.length > 0 && <TopicsRow /> }
            { source !== 'discoverPopular' && <CreateTopicButton /> }
        </TopicsContainer>
    )
}