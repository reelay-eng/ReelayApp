import React, { useContext } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';

const POSTER_WIDTH = 95;
const POSTER_WIDTH_BORDER_RADIUS = Math.min(POSTER_WIDTH / 10, 12);

const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
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
const IconContainer = styled(View)`
    margin: 10px;
`
const PopularTitlesContainer = styled(View)`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 18px;
`
const PopularTitlesElementContainer = styled(Pressable)`
    margin-top: 10px;
    margin-right: 10px;
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
const TitleRowContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`

export default PopularTitles = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const popularTitleStacks = useSelector(state => state.myHomeContent?.discover?.popularTitles);

    const goToReelay = (index, titleObj) => {
		if (popularTitleStacks?.length === 0) return;
		navigation.push("FeedScreen", {
            feedSource: 'popularTitlesDiscover',
			initialFeedPos: index,
            preloadedStackList: popularTitleStacks,
		});

		logAmplitudeEventProd('openPopularTitlesFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display,
		});
	};

    const PopularTitleElement = ({ index, onPress, stack, length }) => {
        return (
            <PopularTitlesElementContainer onPress={onPress}>
                <TitlePoster title={stack[0]?.title} width={POSTER_WIDTH} />
                <TitleInfoLine>
                    <ReelayCount>{`${stack.length} ${(stack.length > 1) ? 'reelays' : 'reelay'}`}</ReelayCount>
                </TitleInfoLine>
            </PopularTitlesElementContainer>
        )
    }

    const TitlesRow = () => {
        const renderTitleStackElement = (item, index) => {
            const stack = item;
            return (
                <PopularTitleElement 
                    key={index}
                    index={index} 
                    onPress={() => goToReelay(index, stack[0].title)} 
                    stack={stack} 
                    length={popularTitleStacks?.length}
                />
            );
        }

        return (
            <TitleRowContainer horizontal showsHorizontalScrollIndicator={false}>
                { popularTitleStacks.map(renderTitleStackElement)}
            </TitleRowContainer>
        )
    }

    if (popularTitleStacks?.length < 2) {
        return <View />;
    }
    
    return (
        <PopularTitlesContainer>
            <HeaderContainer>
                {/* <HeaderText>{'Popular titles'}</HeaderText> */}
                <HeaderSubText>{'People are talking most about these titles'}</HeaderSubText>
            </HeaderContainer>
            { popularTitleStacks?.length > 0 && <TitlesRow />}
        </PopularTitlesContainer>
    )
};