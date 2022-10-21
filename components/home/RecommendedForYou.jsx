import React, { useContext } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import Carousel from 'react-native-snap-carousel';

const { width } = Dimensions.get('window');
const POSTER_WIDTH = 180;
const POSTER_WIDTH_BORDER_RADIUS = Math.min(POSTER_WIDTH / 10, 12);

const CarouselView = styled(View)`
    margin-left: 16px;
`
const HeaderView = styled(View)`
    margin-left: 15px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
`
const IconView = styled(View)`
    margin: 10px;
`
const RecommendedTitlesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`
const RecElementView = styled(Pressable)`
    margin-top: 10px;
`
const ReelayCount = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const SeeMoreOpacityView = styled(View)`
    background-color: #1a1a1a;
    border-radius: ${POSTER_WIDTH_BORDER_RADIUS}px;
    height: 100%;
    opacity: 0.7;
    position: absolute;
    width: ${POSTER_WIDTH}px;
`
const SeeMoreTextView = styled(View)`
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

export default RecommendedForYou = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const recommendedStacks = useSelector(state => state.myHomeContent?.discover?.recommendedTitles);
    const recommendedStacksNoFollowing = useSelector(state => state.myHomeContent?.discover?.recommendedTitlesNoFollowing);

    const useNoFollowing = (recommendedStacks?.length === 0);
    const feedSource = (useNoFollowing) ? 'recommendedTitlesNoFollowing' : 'recommendedTitles';
    const headerText = (useNoFollowing) ? 'Recommended for you' : 'Recommended for you';
    const headerSubtext = (useNoFollowing) ? 'Here’s what people are raving about' : 'People you follow recommend these titles';

    const displayStacks = (useNoFollowing)
        ? recommendedStacksNoFollowing
        : recommendedStacks;

    const goToReelay = (index, titleObj) => {
		if (displayStacks?.length === 0) return;
		navigation.push("FeedScreen", {
            feedSource: feedSource,
			initialFeedPos: index,
            preloadedStackList: displayStacks,
		});

		logAmplitudeEventProd('openPopularTitlesFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display,
		});
	};

    const RecTitleElement = ({ index, onPress, stack, length }) => {
        const asSeeMore = index === length - 1;
        return (
            <RecElementView onPress={onPress}>
                <TitlePoster title={stack[0]?.title} width={POSTER_WIDTH} />
                { asSeeMore && <SeeMoreOpacityView /> }
                { asSeeMore && (
                    <SeeMoreTextView>
                        <IconView>
                            <Icon type='ionicon' name='caret-forward-circle' size={24} color='white' />
                        </IconView>
                        <SeeMoreText>{'See More'}</SeeMoreText>
                    </SeeMoreTextView>
                )}
                { !asSeeMore && (
                    <TitleInfoLine>
                        <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
                    </TitleInfoLine>
                )}
            </RecElementView>
        )
    }

    const TitlesRow = () => {
        const renderTitleStackElement = ({ item, index }) => {
            const stack = item;
            return (
                <RecTitleElement 
                    key={index}
                    index={index} 
                    onPress={() => goToReelay(index, stack[0].title)} 
                    stack={stack} 
                    length={displayStacks?.length}
                />
            );
        }

        return (
            <CarouselView>
                <Carousel
                    activeSlideAlignment={'start'}
                    data={displayStacks}
                    inactiveSlideScale={1}
                    itemWidth={POSTER_WIDTH * 1.1}
                    renderItem={renderTitleStackElement}
                    sliderHeight={240}
                    sliderWidth={width}
                />
            </CarouselView>
        );
    }

    if (displayStacks?.length === 0) {
        return <View />;
    }
    
    return (
        <RecommendedTitlesView>
            <HeaderView>
                <HeaderText>{headerText}</HeaderText>
                <HeaderSubText>{headerSubtext}</HeaderSubText>
            </HeaderView>
            { displayStacks?.length > 0 && <TitlesRow />}
        </RecommendedTitlesView>
    )
};