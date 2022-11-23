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
import { FlatList } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 140;
const POSTER_WIDTH = CARD_WIDTH - 12;

const AbovePosterSpacer = styled(View)`
    margin-top: 10px;
`
const AllGamesButtonPressable = styled(TouchableOpacity)`
    padding: 6px;
`
const CardView = styled(View)`
    background-color: #1E1F21;
    border-radius: 12px;
    margin: 16px;
    padding-top: 24px;
    padding-bottom: 16px;
`
const ForwardPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #2C2D2F;
    border-radius: 44px;
    height: 44px;
    justify-content: center;
    width: 44px;
`
const GameElementHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`
const GameElementView = styled(Pressable)`
    border-radius: 11px;
    margin-top: 10px;
    width: ${CARD_WIDTH}px;
`
const GuessingGamesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-top: 12px;
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
const HeaderText = styled(ReelayText.H4Bold)`
    color: white;
    font-size: ${props => props?.size ?? 20}px;
    line-height: 24px;
`
const HeaderView = styled(View)`
    align-items:  center;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 16px;
    margin-right: 16px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`
const ResetGuessesButtonPressable = styled(TouchableOpacity)`
    align-self: center;
    align-items: center;
    background-color: ${props => props.color ?? 'white'};
    border-radius: 30px;
    height: 30px;
    justify-content: center;
    margin-bottom: 12px;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 80%;
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
const StreakGameMarker = styled(View)`
    align-items: center;
    background-color: ${props => props.color};
    border-radius: 24px;
    height: 24px;
    margin-top: 8px;
    justify-content: center;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 24px;
`
const StreakTrackerGameText = styled(ReelayText.Overline)`
    color: white;
    font-size: 18px;
    line-height: 24px;
`
const StreakTrackerGameView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    width: 36px;
`
const StreakTrackerView = styled(View)`
    align-items: center;
    border-color: rgba(255,255,255,0.25);
    border-top-width: 0.4px;
    height: 80px;
    flex-direction: row;
    justify-content: center;
    margin-top: 12px;
    width: 100%;
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
    height: ${POSTER_WIDTH * 1.5}px;
    justify-content: center;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: ${POSTER_WIDTH}px;
`

export default GuessingGames = ({ navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const guessingGamesObj = useSelector(state => state.homeGuessingGames ?? []);
    const displayGames = guessingGamesObj.content?.slice(0,7);
    const headerText = 'Play the daily game';

    const advanceToGuessingGame = ({ game, index, isPreview = false }) => {
        const navOptions = {
            feedPosition: index,
            initialStackPos: 0,
            isPreview,
        }
		// navigation.push("SingleGuessingGameScreen", navOptions);
		navigation.push("GuessingGameFeedScreen", navOptions);
	};

    const AllGamesButton = () => {
        const advanceToAllGamesScreen = () => navigation.push('AllGamesScreen');
        return (
            <AllGamesButtonPressable onPress={advanceToAllGamesScreen}>
                <FontAwesomeIcon icon={faCalendarDay} color='white' size={24} />
            </AllGamesButtonPressable>
        );
    }

    const GamePreviewElement = ({ index, game }) => {
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
                <UnrevealedPosterView onPress={tapOnPoster}>
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
                <ResetButton />
                <DeleteGameButton />
            </GameElementView>
        )
    }

    const StreakTracker = () => {
        const StreakGame = ({ game }) => {
            const dayLetter = moment(game?.createdAt).format('dddd').charAt(0).toUpperCase();
            const hasWonGame = game?.hasWonGame;
            const hasCompletedGame = game?.hasCompletedGame;
            const hasLostGame = (hasCompletedGame && !hasWonGame);

            const getGameColor = () => {
                if (hasWonGame) return ReelayColors.reelayGreen;
                if (hasLostGame) return ReelayColors.reelayRed;
                return 'gray';
            }

            const getGameIcon = () => {
                if (hasWonGame) return <FontAwesomeIcon icon={faCheck} color='white' size={16} />;
                return <View />;
            }

            return (
                <StreakTrackerGameView>
                    <StreakTrackerGameText>{dayLetter}</StreakTrackerGameText>
                    <StreakGameMarker color={getGameColor()}>
                        { getGameIcon() }
                    </StreakGameMarker>
                </StreakTrackerGameView>
            )
        }
        return (
            <StreakTrackerView>
                { displayGames.map(game => <StreakGame key={game?.id} game={game} /> )}
            </StreakTrackerView>
        )
    }

    const GuessingGamesCard = () => {
        const firstUnplayedGameIndex = displayGames.findIndex(nextGame => !nextGame?.hasCompletedGame);
        const firstUnplayedGame = (firstUnplayedGameIndex !== -1) 
            ? displayGames[firstUnplayedGameIndex]
            : null;
        const renderGameElement = ({ item, index }) => {
            const game = item;
            return <GamePreviewElement key={index} index={index} game={game} />;
        }

        const advanceToFirstUnplayedGame = () => {
            advanceToGuessingGame({ game: firstUnplayedGame, index: firstUnplayedGameIndex, isPreview: false });
        }

        return (
            <CardView>
                <HeaderView>
                    <HeaderText size={18}>{'Guess the title'}</HeaderText>
                    {firstUnplayedGame && (
                        <ForwardPressable onPress={advanceToFirstUnplayedGame}>
                            <FontAwesomeIcon icon={faChevronRight} color='white' size={16} />
                        </ForwardPressable>
                    )}
                </HeaderView>
                <FlatList
                    ListHeaderComponent={<View style={{ width: 16 }} /> }
                    ListFooterComponent={<View style={{ width: 16 }} /> }
                    data={displayGames}
                    renderItem={renderGameElement}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
                <StreakTracker />
            </CardView>
        );
    }

    if (displayGames?.length === 0) {
        return <View />;
    }
    
    return (
        <GuessingGamesView>
            <HeaderView>
                <HeaderText>{'Play the daily game'}</HeaderText>
                <AllGamesButton />
            </HeaderView>
            { displayGames?.length > 0 && <GuessingGamesCard />}
        </GuessingGamesView>
    )
};