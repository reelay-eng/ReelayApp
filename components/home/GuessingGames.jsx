import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import Carousel from 'react-native-snap-carousel';
import { GamesIconSmallSVG } from '../global/SVGs';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 192;

const AbovePosterSpacer = styled(View)`
    margin-top: 10px;
`
const CarouselView = styled(View)`
    margin-left: 16px;
`
const GameDescriptionText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 14px;
    line-height: 18px;
`
const GameDescriptionView = styled(View)`
    height: 48px;
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
    margin-right: 12px;
    width: ${CARD_WIDTH}px;
`
const GuessingGamesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`
const GuessMarkerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    height: 30px;
    width: 100%;
`
const GuessMarkerView = styled(View)`
    background-color: ${props => props.color};
    border-color: rgba(255,255,255,0.5);
    border-radius: 12px;
    border-width: ${props => props.viewable ? 1 : 0}px;
    height: 12px;
    margin: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: 12px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
`
const HeaderView = styled(View)`
    margin-left: 15px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`
const RevealedPosterView = styled(View)`
    align-items: center;
    justify-content: center;
`
const RevealedResultView = styled(View)`
    align-items: center;
    background-color: rgba(255,255,255,0.9);
    border-radius: 36px;
    justify-content: center;
    position: absolute;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
`
const UnrevealedPosterQuestionMark = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 64px;
    line-height: 64px;
`
const UnrevealedPosterView = styled(Pressable)`
    align-items: center;
    background-color: #080808;
    border-radius: 12px
    border-color: #3d3d3d;
    border-width: 2px;
    height: 252px;
    justify-content: center;
    width: 168px;
`

export default GuessingGames = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const guessingGamesObj = useSelector(state => state.homeGuessingGames ?? []);
    const displayGames = guessingGamesObj.content;
    const [focusCounter, setFocusCounter] = useState(0);
    
    console.log('focus counter: ', focusCounter);
    const headerText = 'Guessing Game';
    const headerSubtext = 'Play the official reelay game!'

    const advanceToGuessingGame = ({ game, index, isPreview = false, isUnlocked = false }) => {
        const navOptions = {
            initialFeedPos: index,
            initialStackPos: 0,
            guessingGame: game,
            isPreview,
            isUnlocked,
        }
		navigation.push("SingleGuessingGameScreen", navOptions);
	};

    const GamePreviewElement = ({ index, game }) => {
        const getTimestampText = () => {
            const now = moment();
            const publishedAt = moment(game?.updatedAt);
            const daysAgo = now.diff(publishedAt, 'days');
            if (daysAgo === 0) return 'Today';
            if (daysAgo === 1) return 'Yesterday';
            if (daysAgo < 7) return publishedAt.format('dddd');
            return publishedAt.format('MMMM Do');
        }

        const correctTitleObj = game?.correctTitleObj;
        const hasCompletedGame = game?.hasCompletedGame;
        const hasWonGame = game?.hasWonGame;
        const hasLostGame = (hasCompletedGame && !hasWonGame);
        const isGameCreator = (game?.creatorSub === reelayDBUser?.sub);
        const isUnlocked = (correctTitleObj && (hasCompletedGame || isGameCreator));
        const timestamp = getTimestampText();

        const tapOnPoster = () => {
            advanceToGuessingGame({ game, index, isPreview: false, isUnlocked });
        }

        const GuessMarkers = () => {
            const myGuesses = game?.myGuesses ?? [];
            const clueOrder = game?.details?.clueOrder ?? [];
            const guessesLeft = (clueOrder?.length - myGuesses?.length);
        
            const getMarkerColor = (guess) => {
                if (guess?.isCorrect) return ReelayColors?.reelayGreen;
                return ReelayColors.reelayRed;
            } 
    
            const renderGuessMarker = (guess, index) => {
                const isCorrect = guess?.isCorrect;
                const color = getMarkerColor(guess);
                return (
                    <GuessMarkerView key={index} 
                        color={color}
                        isCorrect={isCorrect} 
                        isGuessed={true} 
                        viewable={false} 
                    />
                );
            };
    
            return (
                <GuessMarkerRowView>
                    { myGuesses.map(renderGuessMarker) }
                    { (guessesLeft > 0 && !hasCompletedGame) && (
                        <GuessMarkerView 
                            key={'unanswered'} 
                            color={'gray'} 
                            isCorrect={false} 
                            isGuessed={false} 
                            viewable={false} 
                        />
                    )}
                </GuessMarkerRowView>
            )
        }

        const RevealedPoster = () => {
            
            return (
                <RevealedPosterView>
                    <TitlePoster onPress={tapOnPoster} title={correctTitleObj} width={168} /> 
                    { hasWonGame && (
                        <RevealedResultView>
                            <FontAwesomeIcon icon={faCheckCircle} color={ReelayColors.reelayGreen} size={72} />
                        </RevealedResultView>
                    )}
                    { hasLostGame && (
                        <RevealedResultView hasWonGame={hasWonGame}>
                            <FontAwesomeIcon icon={faXmarkCircle} color={ReelayColors.reelayRed} size={72} />
                        </RevealedResultView>
                    )}
                </RevealedPosterView>
            );
        }
    
        const UnrevealedPoster = () => {
            return (
                <UnrevealedPosterView onPress={tapOnPoster}>
                    <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
                </UnrevealedPosterView>
            );    
        }    

        return (
            <GameElementView onPress={tapOnPoster}>
                <GameElementHeaderView>
                    <GamesIconSmallSVG />
                    <TimestampText>{timestamp}</TimestampText>
                </GameElementHeaderView>
                <GameDescriptionView>
                    <GameDescriptionText numberOfLines={2}>{game?.title}</GameDescriptionText>
                </GameDescriptionView>
                <AbovePosterSpacer />
                { isUnlocked && <RevealedPoster /> }
                { !isUnlocked && <UnrevealedPoster />}
                <GuessMarkers />
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
                    itemWidth={CARD_WIDTH + 12}
                    renderItem={renderGameElement}
                    sliderHeight={252}
                    sliderWidth={width}
                />
            </CarouselView>
        );
    }

    // useFocusEffect(() => {
    //     setFocusCounter(focusCounter + 1);
    // })

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