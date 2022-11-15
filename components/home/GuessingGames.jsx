import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useDispatch, useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import Carousel from 'react-native-snap-carousel';
import { GamesIconSmallSVG } from '../global/SVGs';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect } from '@react-navigation/native';
import { deleteGuessingGameGuesses, deleteGuessingGamePublished, getGuessingGamesPublished } from '../../api/GuessingGameApi';

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
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const HeaderView = styled(View)`
    margin-left: 15px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`
const ResetGuessesButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.color ?? 'white'};
    border-radius: 30px;
    height: 36px;
    justify-content: center;
    margin-bottom: 12px;
    width: 90%;
`
const ResetGuessesButtonText = styled(ReelayText.Body1)`
    color: ${props => props.color ?? 'black'};
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
    z-index: 100;
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
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const guessingGamesObj = useSelector(state => state.homeGuessingGames ?? []);
    const displayGames = guessingGamesObj.content;
    
    const headerText = 'Guess the Title';
    const headerSubtext = 'Play the daily game'

    const advanceToGuessingGame = ({ game, index, isPreview = false }) => {
        const navOptions = {
            feedPosition: index,
            initialStackPos: 0,
            isPreview,
        }
		// navigation.push("SingleGuessingGameScreen", navOptions);
		navigation.push("GuessingGameFeedScreen", navOptions);
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

        const refreshGuessingGames = async () => {
            const nextMyGuessingGames = await getGuessingGamesPublished({
                authSession,
                reqUserSub: reelayDBUser?.sub,
            });
            dispatch({ type: 'setHomeGuessingGames', payload: {
                content: nextMyGuessingGames,
                nextPage: 1,
            }});
        }

        const tapOnPoster = () => {
            advanceToGuessingGame({ game, index, isPreview: false });
        }

        const DeleteGameButton = () => {
            const [deleting, setDeleting] = useState(false); 
            const [confirming, setConfirming] = useState(false);
            const canDeleteGame = (isGameCreator || reelayDBUser?.role === 'admin');
    
            const deleteGame = async () => {
                const deleteResult = await deleteGuessingGamePublished({
                    authSession,
                    reqUserSub: reelayDBUser?.sub,
                    topicID: game?.id,
                });
                console.log(deleteResult);
                return deleteResult;
            }
        
            const onPressDelete = async () => {
                if (!confirming) {
                    setConfirming(true);
                    return;
                }
                if (deleting) return;
                setConfirming(false);
                setDeleting(true);
                await deleteGame();
                await refreshGuessingGames();
                setDeleting(false);
            }
    
            if (!canDeleteGame) return <View />
    
            return (
                <ResetGuessesButtonPressable color={ReelayColors.reelayRed} onPress={onPressDelete}>
                    { deleting && <ActivityIndicator /> }
                    { confirming && <ResetGuessesButtonText color={'white'}>{'Confirm delete'}</ResetGuessesButtonText> }
                    { (!confirming && !deleting) && <ResetGuessesButtonText color={'white'}>{'Delete game'}</ResetGuessesButtonText> }
                </ResetGuessesButtonPressable>
            );
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

        const ResetButton = () => {
            const [resetting, setResetting] = useState(false); 
            const myGuesses = game?.myGuesses ?? [];
            const canResetGuesses = (reelayDBUser?.role === 'admin' && myGuesses.length > 0);

            const resetGuesses = async () => {
                if (myGuesses?.length === 0) return;
                const inviteCode = myGuesses[0].inviteCode;
                const deleteResult = await deleteGuessingGameGuesses({
                    authSession,
                    reqUserSub: reelayDBUser?.sub,
                    inviteCode: inviteCode,
                    topicID: game?.id,
                });
            }

            const onPressReset = async () => {
                if (resetting) return;
                setResetting(true);
                await resetGuesses();
                await refreshGuessingGames();
                setResetting(false);
            }

            if (!canResetGuesses) return <View />

            return (
                <ResetGuessesButtonPressable onPress={onPressReset}>
                    { resetting && <ActivityIndicator /> }
                    { !resetting && <ResetGuessesButtonText>{'Reset guesses'}</ResetGuessesButtonText> }
                </ResetGuessesButtonPressable>
            );
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
                <ResetButton />
                <DeleteGameButton />
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

    if (displayGames?.length === 0) {
        return <View />;
    }
    
    return (
        <GuessingGamesView>
            <HeaderView>
                <HeaderText>{headerText}</HeaderText>
                <HeaderSubText>{headerSubtext}</HeaderSubText>
            </HeaderView>
            { displayGames?.length > 0 && <GuessingGamesRow />}
        </GuessingGamesView>
    )
};