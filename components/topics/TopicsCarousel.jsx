import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import TopicCard from './TopicCard';
import { useDispatch, useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import Carousel from 'react-native-snap-carousel';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { AuthContext } from '../../context/AuthContext';
import { getTopicsByCreator } from '../../api/TopicsApi';

const { width } = Dimensions.get('window');

const CarouselView = styled(View)`
    margin-left: -24px;
`
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
const CreateTopicText = styled(ReelayText.Overline)`
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
    padding-left: 0px;
`
const TopicsContainer = styled(View)`
    width: 100%;
    margin-bottom: 10px;
`
const SeeAllTopicsText = styled(ReelayText.Subtitle2)`
    color: ${ReelayColors.reelayBlue};
    margin-right: 15px;
`
const Spacer = styled(View)`
    width: 15px;
`

export default TopicsCarousel = ({ navigation, source = 'discover', creatorOnProfile = null }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const followingTopics = useSelector(state => state.myHomeContent?.following?.topics);
    const [topicsOnProfile, setTopicsOnProfile] = useState([]);

    const loadTopicsByCreator = async () => {
        if (source === 'profile' && creatorOnProfile?.sub) {
            const topicsByCreator = await getTopicsByCreator({ 
                creatorSub: creatorOnProfile?.sub, 
                reqUserSub: reelayDBUser?.sub, 
                page: 0 
            });
            if (topicsByCreator && topicsByCreator?.length) {
                setTopicsOnProfile(topicsByCreator);
            }
        }
    }

    useEffect(() => {
        loadTopicsByCreator();
    }, []);

    let displayTopics = [];
    let headerText = "Topics";
    switch (source) {
        case 'discover':
            displayTopics = discoverTopics ?? [];
            headerText = 'Topics';
            break;
        case 'following':
            displayTopics = followingTopics ?? [];
            headerText = 'New topics'
            break;
        case 'profile':
            displayTopics = topicsOnProfile ?? [];
            headerText = 'Topics started';
            break;
        default:
            break;
    }

    const advanceToTopicsList = () => navigation.push('TopicsListScreen', { 
        source, 
        creatorOnProfile, 
        topicsOnProfile,
    });

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

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderContainerLeft>
                    <HeaderText>{headerText}</HeaderText>
                </HeaderContainerLeft>
                <HeaderContainerRight onPress={advanceToTopicsList}>
                    <SeeAllTopicsText>{'See all'}</SeeAllTopicsText>
                </HeaderContainerRight>
            </HeaderContainer>
        );
    }

    const TopicsRow = () => {
        const renderTopic = ({ item, index }) => {
            const topic = item;
            const matchTopic = (nextTopic) => (nextTopic.id === topic.id);
            const initTopicIndex = displayTopics.findIndex(matchTopic);
        
            const advanceToFeed = (initReelayIndex = 0) => {
                navigation.push('TopicsFeedScreen', { 
                    initReelayIndex,
                    initTopicIndex, 
                    source,
                    creatorOnProfile, 
                    topicsOnProfile,
                });
                
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
                    horizontal={true}
                    navigation={navigation} 
                    creatorOnProfile={creatorOnProfile}
                    topicsOnProfile={topicsOnProfile}
                    source={source}
                    topic={topic} 
                />
            );
        }

        return (
            <CarouselView>
                <Carousel
                    activeSlideAlignment={'center'}
                    data={displayTopics}
                    inactiveSlideScale={0.95}
                    itemHeight={480}
                    itemWidth={width-48}
                    renderItem={renderTopic}
                    sliderHeight={480}
                    sliderWidth={width+30}
                />
            </CarouselView>
        );
    }

    if (source === 'profile' && topicsOnProfile?.length === 0) {
        return <View />;
    }
    
    return (
        <TopicsContainer>
            <Header />
            { displayTopics.length > 0 && <TopicsRow /> }
            { source !== 'profile' && <CreateTopicButton /> }
        </TopicsContainer>
    )
}