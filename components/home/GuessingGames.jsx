import React, { Fragment, useContext, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import Carousel from 'react-native-snap-carousel';
import { GamesIconSmallSVG, GamesIconSVG } from '../global/SVGs';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import ReelayColors from '../../constants/ReelayColors';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 192;

const AbovePosterSpacer = styled(View)`
    margin-top: 10px;
`
const BottomButtonRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    width: 100%;
`
const BottomButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.color ?? 'white'};
`
const BottomHideRevealPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 20px;
    background-color: #d4d4d4;
    justify-content: center;
    height: 30px;
    width: ${props => props.wide ? 160 : 72}px;
`
const BottomReplayPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 20px;
    background-color: ${props => props.wide 
        ? ReelayColors.reelayBlue
        : ReelayColors.reelayGreen
    };
    justify-content: center;
    height: 30px;
    width: ${props => props.wide ? 160 : 72}px;
`
const CarouselView = styled(View)`
    margin-left: 16px;
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
    margin: 8px;
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
const RevealText = styled(ReelayText.Body1)`
    color: white;
    padding: 8px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
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
    height: 240px;
    justify-content: center;
    width: 160px;
`

export default GuessingGames = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const displayGames = useSelector(state => state.myHomeContent?.discover?.guessingGames ?? []);

    const headerText = 'Guessing Game';
    const headerSubtext = 'Play the official reelay game!'

    const advanceToGuessingGame = ({ game, isPreview = false, isUnlocked = false }) => {
		if (displayGames?.length === 0) return;
		navigation.push("SingleGuessingGameScreen", {
            initialStackPos: 0,
            guessingGame: game,
            isPreview,
            isUnlocked,
		});
	};

    const GamePreviewElement = ({ index, game }) => {
        const daysAgo = moment().diff(moment(game?.updatedAt), 'days');
        const correctTitleObj = game?.correctTitleObj;
        const hasCompletedGame = game?.hasCompletedGame;
        const hasWonGame = game?.hasWonGame;
        const hasLostGame = (hasCompletedGame && !hasWonGame);

        const isGameCreator = (game?.creatorSub === reelayDBUser?.sub);
        const canRevealPoster = (correctTitleObj && (hasCompletedGame || isGameCreator));

        const [isUnlocked, setIsUnlocked] = useState(false);
        const playGame = () => advanceToGuessingGame({ game, isPreview: false, isUnlocked: false });
        // const replayGame = () => {
        //     if (canRevealPoster) setIsUnlocked(false);
        //     advanceToGuessingGame({ game, isPreview: true, isUnlocked: false });
        // }

        const tapHideReveal = () => {
            if (canRevealPoster) setIsUnlocked(!isUnlocked);
        }

        const tapOnPoster = () => {
            advanceToGuessingGame({ game, isPreview: false, isUnlocked });
        }

        let timestamp = `${daysAgo} days ago`;
        if (daysAgo < 1) timestamp = 'Today';
        if (daysAgo === 1) timestamp = 'Yesterday'; 

        const GuessMarkers = () => {
            const myGuesses = game?.myGuesses ?? [];
            const clueOrder = game?.details?.clueOrder ?? [];
            const guessesLeft = (clueOrder?.length - myGuesses?.length);
    
            console.log('my guesses: ', myGuesses);
            console.log('my game: ', game);
    
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
    
        const UnrevealedPoster = ({ onPress }) => {
            if (canRevealPoster && !isGameCreator) {
                const getIcon = () => {
                    if (hasWonGame) return faCheckCircle;
                    if (hasCompletedGame) return faXmarkCircle;
                    return faEye;
                }
    
                const getText = () => {
                    if (hasWonGame) return 'You won!';
                    if (hasCompletedGame) return 'You lost :(';
                    return '';
                }
    
                return (
                    <UnrevealedPosterView onPress={onPress}>
                        <FontAwesomeIcon icon={getIcon()} color='white' size={64} />
                        <RevealText>{getText()}</RevealText>
                        <GuessMarkers />
                    </UnrevealedPosterView>
                );    
            } else {
                return (
                    <UnrevealedPosterView onPress={onPress}>
                        <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
                    </UnrevealedPosterView>
                );    
            }
        }    

        return (
            <GameElementView onPress={tapOnPoster}>
                <GameElementHeaderView>
                    <GamesIconSmallSVG />
                    <TimestampText>{timestamp}</TimestampText>
                </GameElementHeaderView>
                <GameDescriptionView>
                    <GameDescriptionText>{game?.title}</GameDescriptionText>
                </GameDescriptionView>
                <AbovePosterSpacer />
                { isUnlocked && <TitlePoster onPress={tapOnPoster} title={correctTitleObj} width={160} /> }
                { !isUnlocked && <UnrevealedPoster 
                    canRevealPoster={canRevealPoster} 
                    game={game}
                    hasCompletedGame={hasCompletedGame} 
                    hasWonGame={hasWonGame} 
                    isGameCreator={isGameCreator}
                    onPress={tapOnPoster} 
                />}
                { canRevealPoster && (
                    <BottomButtonRowView>
                        <BottomHideRevealPressable onPress={tapHideReveal} wide={true}>
                            <BottomButtonText color='black'>{(isUnlocked) ? 'Hide' : 'Show'}</BottomButtonText>
                        </BottomHideRevealPressable>
                        {/* <BottomReplayPressable onPress={replayGame}>
                            <BottomButtonText color='white'>{'Replay'}</BottomButtonText>
                        </BottomReplayPressable>                     */}
                    </BottomButtonRowView>
                )}
                { !canRevealPoster && (
                    <BottomButtonRowView>
                        <BottomReplayPressable onPress={playGame} wide={true}>
                            <BottomButtonText color='white'>{'Play now'}</BottomButtonText>
                        </BottomReplayPressable>                    
                    </BottomButtonRowView>
                )}
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
                    itemWidth={CARD_WIDTH}
                    renderItem={renderGameElement}
                    sliderHeight={240}
                    sliderWidth={width}
                />
            </CarouselView>
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