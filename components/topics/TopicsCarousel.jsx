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
const HeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 15px;
`
const HeaderViewLeft = styled(View)`
    display: flex;
    flex: 1;
    margin-left: 15px;
    margin-right: 15px;
`
const HeaderViewRight = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
    margin-bottom: 16px;
`
const TopicsView = styled(View)`
    width: 100%;
    margin-bottom: 10px;
`
const SeeAllTopicsText = styled(ReelayText.Subtitle2)`
    color: ${ReelayColors.reelayBlue};
    margin-right: 15px;
`
const Spacer = styled(View)`
    height: 16px;
`

export default TopicsCarousel = ({ navigation, source = 'discover', creatorOnProfile = null }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
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

    const Header = () => {
        return (
            <HeaderView>
                <HeaderViewLeft>
                    <HeaderText>{headerText}</HeaderText>
                    <HeaderSubText>{'The latest conversations and debates'}</HeaderSubText>
                </HeaderViewLeft>
                <HeaderViewRight onPress={advanceToTopicsList}>
                    <SeeAllTopicsText>{'See all'}</SeeAllTopicsText>
                </HeaderViewRight>
            </HeaderView>
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
                    itemHeight={452}
                    itemWidth={width-48}
                    renderItem={renderTopic}
                    sliderHeight={452}
                    sliderWidth={width+30}
                />
            </CarouselView>
        );
    }

    if (source === 'profile' && topicsOnProfile?.length === 0) {
        return <View />;
    }
    
    return (
        <TopicsView>
            <Header />
            { displayTopics.length > 0 && <TopicsRow /> }
            { source !== 'profile' && <Spacer /> }
        </TopicsView>
    )
}