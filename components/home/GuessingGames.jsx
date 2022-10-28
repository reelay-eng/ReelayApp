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
import { GamesIconSVG } from '../global/SVGs';
import moment from 'moment';

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
const GuessingGamesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`
const GameDescriptionText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 18px;
`
const GameDescriptionView = styled(View)`
    padding: 8px;
    padding-top: 0px;
`
const GameElementHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    width: 100%;
`
const GameElementView = styled(Pressable)`
    align-items: center;
    background-color: rgba(255,255,255,0.15);
    border-radius: 11px;
    margin-top: 10px;
    width: 188px;
`
const UnrevealedPosterQuestionMark = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 64px;
    line-height: 64px;
`
const UnrevealedPosterView = styled(View)`
    align-items: center;
    background-color: #080808;
    border-radius: 12px
    height: 240px;
    justify-content: center;
    width: 160px;
    margin-top: 10px;
    margin-bottom: 16px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`

export default GuessingGames = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const displayGames = useSelector(state => state.myHomeContent?.discover?.guessingGames ?? []);

    const headerText = 'Guessing Game';
    const headerSubtext = 'Play the official reelay game!'

    const advanceToGuessingGame = (game) => {
		if (displayGames?.length === 0) return;
		navigation.push("SingleGuessingGameScreen", {
            initialStackPos: 0,
            guessingGame: game,
            isPreview: false,
            isUnlocked: false,
		});
	};

    const GamePreviewElement = ({ index, game }) => {
        const onPress = () => advanceToGuessingGame(game);
        const daysAgo = moment().diff(moment(game?.updatedAt), 'days');

        const correctTitleObj = game?.correctTitleObj;
        const hasPlayedGame = game?.hasPlayedGame;
        const showTitlePoster = (correctTitleObj && hasPlayedGame);

        let timestamp = `${daysAgo} days ago`;
        if (daysAgo < 1) timestamp = 'Today';
        if (daysAgo === 1) timestamp = 'Yesterday'; 

        return (
            <GameElementView onPress={onPress}>
                <GameElementHeaderView>
                    <GamesIconSVG />
                    <TimestampText>{timestamp}</TimestampText>
                </GameElementHeaderView>
                <GameDescriptionView>
                    <GameDescriptionText>{game?.title}</GameDescriptionText>
                </GameDescriptionView>
                { showTitlePoster && <TitlePoster title={correctTitleObj} width={120} /> }
                { !showTitlePoster && <UnrevealedPoster /> }
            </GameElementView>
        )
    }

    const GuessingGamesRow = () => {
        const renderGameElement = ({ item, index }) => {
            const game = item;
            return <GamePreviewElement key={index} index={index} game={game} />;
        }

        return (
            <CarouselView>
                <Carousel
                    activeSlideAlignment={'start'}
                    data={displayGames}
                    inactiveSlideScale={1}
                    itemWidth={POSTER_WIDTH * 1.1}
                    renderItem={renderGameElement}
                    sliderHeight={240}
                    sliderWidth={width}
                />
            </CarouselView>
        );
    }

    const UnrevealedPoster = () => {
        return (
            <UnrevealedPosterView>
                <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
            </UnrevealedPosterView>
        );
    }

    if (displayGames?.length === 0) {
        return <View />;
    }
    
    return (
        <GuessingGamesView>
            <HeaderView>
                {/* <HeaderText>{headerText}</HeaderText> */}
                <HeaderSubText>{headerSubtext}</HeaderSubText>
            </HeaderView>
            { displayGames?.length > 0 && <GuessingGamesRow />}
        </GuessingGamesView>
    )
};