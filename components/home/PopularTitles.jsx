import React, { memo, useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import SeeMore from '../global/SeeMore';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFireFlameCurved } from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-native-snap-carousel';

const { width } = Dimensions.get('window');

const PopularTitlesContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`
const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 15px;
    margin-top: 15px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`

export default PopularTitles = ({ navigation, tab='discover' }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const popularTitleStacksDiscover = useSelector(state => state.myDiscoverContent?.popularTitles);
    const popularTitleStacksFollowing = useSelector(state => state.myFollowingContent?.popularTitles);

    // console.log('pop titles discover: ', popularTitleStacksDiscover);
    // console.log('pop titles following: ', popularTitleStacksFollowing);

    const popularTitleStacks = (tab === 'following') ? popularTitleStacksFollowing : popularTitleStacksDiscover;

    const goToReelay = (index, titleObj) => {
		if (popularTitleStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: (tab === 'following') ? 'popularTitlesFollowing' : 'popularTitlesDiscover',
            preloadedStackList: popularTitleStacks,
		});

		logAmplitudeEventProd('openPopularTitlesFeedd', {
			username: reelayDBUser?.username,
            title: titleObj?.display,
            tab,
		});
	};

    const TitlesRow = () => {

        const onBeforeSnapToItem = async (swipeIndex) => {
            // const swipeDirection = swipeIndex < curTopicIndex.current ? 'left' : 'right';
            // const nextTopic = globalTopics[swipeIndex];
            // const prevTopic = globalTopics[curTopicIndex.current];

            // logAmplitudeEventProd('swipedTopics', {
            //     nextTopicTitle: nextTopic.title,
            //     prevReelayTitle: prevTopic.title,
            //     source: 'global',
            //     swipeDirection: swipeDirection,
            //     username: reelayDBUser?.username,
            // });
        }
        const renderTitleStackElement = ({ item, index }) => {
            const stack = item;
            return (
                <InTheatersElement 
                    key={index}
                    index={index} 
                    onPress={() => goToReelay(index, stack[0].title)} 
                    stack={stack} 
                    length={popularTitleStacks?.length}/>
            );
        }

        return (
            <Carousel
                activeAnimationType={'decay'}
                activeSlideAlignment={'center'}
                data={popularTitleStacks}
                inactiveSlideScale={1}
                itemWidth={width * 0.9}
                onBeforeSnapToItem={onBeforeSnapToItem}
                renderItem={renderTitleStackElement}
                sliderHeight={240}
                sliderWidth={width}
            />
        );
    }

    if (popularTitleStacks.length < 2) {
        return <View />;
    }
    
    return (
        <PopularTitlesContainer>
            <HeaderContainer>
                <FontAwesomeIcon icon={faFireFlameCurved} color='white' size={24} />
                <HeaderText>{'Popular titles'}</HeaderText>
            </HeaderContainer>
            { popularTitleStacks.length > 0 && <TitlesRow />}
        </PopularTitlesContainer>
    )
};

const PopularTitlesElementContainer = styled(Pressable)`
    margin-top: 10px;
`
const ReelayCount = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`

const InTheatersElement = ({ index, onPress, stack, length }) => {
    const posterWidth = width * 0.8;
    if (index === length-1) {
        return (
        <PopularTitlesElementContainer>
            <SeeMore 
                display='poster'
                height={posterWidth / 1.5} 
                onPress={onPress} 
                reelay={stack[0]} 
                width={posterWidth - 3} 
            />
        </PopularTitlesElementContainer>
        )
    }

    return (
        <PopularTitlesElementContainer onPress={onPress}>
            <TitlePoster title={stack[0]?.title} width={posterWidth} />
            <TitleInfoLine>
                <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
            </TitleInfoLine>
        </PopularTitlesElementContainer>
    )
}