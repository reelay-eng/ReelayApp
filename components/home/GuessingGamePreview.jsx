import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useDispatch, useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCheck, faCheckCircle, faChevronRight, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { deleteGuessingGameGuesses, deleteGuessingGamePublished, getGuessingGamesPublished } from '../../api/GuessingGameApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 3 - 6;
const POSTER_WIDTH = CARD_WIDTH - 12;

const AbovePosterSpacer = styled(View)`
    margin-top: 10px;
`
const GameElementHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 12px;
    width: 100%;
`
const GameElementView = styled(Pressable)`
    align-items: center;
    border-radius: 11px;
    margin-top: 10px;
    width: ${CARD_WIDTH}px;
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
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`
const ResetGuessesButtonPressable = styled(TouchableOpacity)`
    align-self: center;
    align-items: center;
    background-color: ${props => props.color ?? 'white'};
    border-radius: 30px;
    height: 36px;
    justify-content: center;
    margin-bottom: 12px;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 90%;
`
const ResetGuessesButtonText = styled(ReelayText.Body1)`
    color: ${props => props.color ?? 'black'};
    font-size: 14px;
`
const RevealedPosterView = styled(View)`
    align-items: center;
    justify-content: center;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
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
    border-color: rgba(255,255,255,0.3);
    border-radius: 12px
    border-width: ${props => props?.border ? 1.4 : 0}px;
    height: ${POSTER_WIDTH * 1.5}px;
    justify-content: center;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: ${POSTER_WIDTH}px;
`

export default GuessingGamePreview = ({ game, index, navigation, showAdmin = false }) => {
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const advanceToGuessingGame = ({ game, index, isPreview = false }) => {
        const navOptions = {
            feedPosition: index,
            initialStackPos: 0,
            isPreview,
        }
		navigation.push("GuessingGameFeedScreen", navOptions);
	};

    const getTimestampText = () => {
        const now = moment();
        const publishedAt = moment(game?.updatedAt);
        const daysAgo = now.diff(publishedAt, 'days');
        if (daysAgo === 0) return 'Today';
        if (daysAgo === 1) return 'Yesterday';
        // if (daysAgo < 7) return publishedAt.format('dddd');
        return publishedAt.format('MMM DD');
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
            page: 0,
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
                <TitlePoster onPress={tapOnPoster} title={correctTitleObj} width={POSTER_WIDTH} /> 
                { hasWonGame && (
                    <RevealedResultView>
                        <FontAwesomeIcon icon={faCheckCircle} color={ReelayColors.reelayGreen} size={54} />
                    </RevealedResultView>
                )}
                { hasLostGame && (
                    <RevealedResultView hasWonGame={hasWonGame}>
                        <FontAwesomeIcon icon={faXmarkCircle} color={ReelayColors.reelayRed} size={54} />
                    </RevealedResultView>
                )}
            </RevealedPosterView>
        );
    }

    const UnrevealedPoster = () => {
        return (
            <UnrevealedPosterView border={true} onPress={tapOnPoster}>
                <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
            </UnrevealedPosterView>
        );    
    }    

    return (
        <GameElementView onPress={tapOnPoster}>
            <GameElementHeaderView>
                <TimestampText>{timestamp}</TimestampText>
            </GameElementHeaderView>
            <AbovePosterSpacer />
            { isUnlocked && <RevealedPoster /> }
            { !isUnlocked && <UnrevealedPoster />}
            <GuessMarkers />
            { showAdmin && <ResetButton /> }
            { showAdmin && <DeleteGameButton /> }
        </GameElementView>
    );
    
};