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
const POSTER_WIDTH = width * 0.8;
const POSTER_WIDTH_BORDER_RADIUS = Math.min(POSTER_WIDTH / 10, 12);

const CarouselContainer = styled(View)`
    margin-left: -10px;
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
const IconContainer = styled(View)`
    margin: 10px;
`
const PopularTitlesContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`
const PopularTitlesElementContainer = styled(Pressable)`
    margin-top: 10px;
`
const ReelayCount = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const SeeMoreOpacityContainer = styled(View)`
    background-color: #1a1a1a;
    border-radius: ${POSTER_WIDTH_BORDER_RADIUS}px;
    height: 100%;
    opacity: 0.7;
    position: absolute;
    width: ${POSTER_WIDTH}px;
`
const SeeMoreTextContainer = styled(View)`
    align-items: center;
    justify-content: center;
    height: 100%;
    position: absolute;
    width: 100%;
`
const SeeMoreText = styled(ReelayText.Body1)`
    color: white;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`

export default PopularTitles = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const headerText = 'Popular titles';
    const popularTitleStacks = useSelector(state => state.myHomeContent?.discover?.popularTitles);

    const goToReelay = (index, titleObj) => {
		if (popularTitleStacks?.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'popularTitlesDiscover',
            preloadedStackList: popularTitleStacks,
		});

		logAmplitudeEventProd('openPopularTitlesFeedd', {
			username: reelayDBUser?.username,
            title: titleObj?.display,
		});
	};

    const PopularTitleElement = ({ index, onPress, stack, length }) => {
        const asSeeMore = index === length - 1;
        return (
            <PopularTitlesElementContainer onPress={onPress}>
                <TitlePoster title={stack[0]?.title} width={POSTER_WIDTH} />
                { asSeeMore && <SeeMoreOpacityContainer /> }
                { asSeeMore && (
                    <SeeMoreTextContainer>
                        <IconContainer>
                            <Icon type='ionicon' name='caret-forward-circle' size={24} color='white' />
                        </IconContainer>
                        <SeeMoreText>{'See More'}</SeeMoreText>
                    </SeeMoreTextContainer>
                )}
                { !asSeeMore && (
                    <TitleInfoLine>
                        <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
                    </TitleInfoLine>
                )}
            </PopularTitlesElementContainer>
        )
    }

    const TitlesRow = () => {
        const renderTitleStackElement = ({ item, index }) => {
            const stack = item;
            return (
                <PopularTitleElement 
                    key={index}
                    index={index} 
                    onPress={() => goToReelay(index, stack[0].title)} 
                    stack={stack} 
                    length={popularTitleStacks?.length}/>
            );
        }

        return (
            <CarouselContainer>
                <Carousel
                    activeSlideAlignment={'center'}
                    data={popularTitleStacks}
                    inactiveSlideScale={1}
                    itemWidth={width * 0.85}
                    renderItem={renderTitleStackElement}
                    sliderHeight={240}
                    sliderWidth={width}
                />
            </CarouselContainer>
        );
    }

    if (popularTitleStacks?.length < 2) {
        return <View />;
    }
    
    return (
        <PopularTitlesContainer>
            <HeaderContainer>
                <FontAwesomeIcon icon={faFireFlameCurved} color='white' size={24} />
                <HeaderText>{headerText}</HeaderText>
            </HeaderContainer>
            { popularTitleStacks?.length > 0 && <TitlesRow />}
        </PopularTitlesContainer>
    )
};