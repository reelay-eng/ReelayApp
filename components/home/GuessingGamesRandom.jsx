import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, TouchableOpacity, View, Image, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd, firebaseCrashlyticsError, firebaseCrashlyticsLog } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import ReelayColors from '../../constants/ReelayColors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCheck, faChevronRight, faLock } from '@fortawesome/free-solid-svg-icons';
import { FlatList } from 'react-native-gesture-handler';
import GuessingGamePreview from './GuessingGamePreview';
import { showMessageToast } from '../utils/toasts';
const GAME_IMAGE_SOURCE = require('../../assets/images/daily_q.png');

const { width } = Dimensions.get('window');
const CARD_WIDTH = 140;
const POSTER_WIDTH = CARD_WIDTH - 12;

const AllGamesButtonPressable = styled(TouchableOpacity)`
    padding: 6px;
    margin-right:10px;
`
const CardPressable = styled(Pressable)`
    background-color: #1E1F21;
    border-radius: 12px;
    margin: 10px;
`
const ForwardPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #2C2D2F;
    border-radius: 44px;
    height: 44px;
    justify-content: center;
    width: 44px;
`
const GuessingGamesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-top: 12px;
    margin-bottom: 2px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: ${props => props?.size ?? 20}px;
    line-height: 24px;
    margin-left:10px;
`
const HeaderView = styled(View)`
    align-items:  center;
    flex-direction: row;
    justify-content: space-between;
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
const StreamGameLockView = styled(View)`
    align-items: center;
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
const GameImage = styled(Image)`
height: 200px;
width: 100%;
border-radius:12px;
`

export default GuessingGamesRandom = ({ navigation, advertise = false }) => {
    try {
        firebaseCrashlyticsLog('Guessing games');
        const authSession = useSelector(state => state.authSession);
        const dispatch = useDispatch();
        const { reelayDBUser } = useContext(AuthContext);
        const guessingGamesObj = useSelector(state => state.homeGuessingGames ?? []);
        const displayGames = guessingGamesObj.content?.slice(0, 7);
        const isAdmin = (reelayDBUser?.role === 'admin');
        const isGuestUser = (reelayDBUser?.username === 'be_our_guest');

        const advanceToAllGamesScreen = () => navigation.push('AllGamesScreen');
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
            return (
                <AllGamesButtonPressable onPress={advanceToAllGamesScreen}>
                    <FontAwesomeIcon icon={faCalendarDay} color='white' size={24} />
                </AllGamesButtonPressable>
            );
        }

        const StreakTracker = () => {

            const getGamesThisWeek = () => {
                try {
                    const startOfMonday = moment().startOf('week');
                    const mondayGameIndex = displayGames.findIndex((nextGame) => {
                        const nextGameCreatedAt = moment(nextGame?.createdAt);
                        const mondayDateDiff = nextGameCreatedAt.diff(startOfMonday, 'days');
                        return Math.abs(mondayDateDiff) < 1;
                    });

                    if (mondayGameIndex === -1) return [];
                    return displayGames.slice(0, mondayGameIndex).reverse()
                } catch (error) {
                    console.log('Get games this week error: ', error);
                    return [];
                }
            }

            const getLockedDayLetters = (gamesThisWeek) => {
                try {
                    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].slice(gamesThisWeek?.length);
                } catch (error) {
                    return [];
                }
            }

            const gamesThisWeek = getGamesThisWeek();
            const lockedDayLetters = getLockedDayLetters(gamesThisWeek);

            const StreakGamePublished = ({ game }) => {
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
                            {getGameIcon()}
                        </StreakGameMarker>
                    </StreakTrackerGameView>
                )
            }

            const StreakGameUnpublished = ({ dayLetter }) => {
                return (
                    <StreakTrackerGameView>
                        <StreakTrackerGameText>{dayLetter}</StreakTrackerGameText>
                        <StreamGameLockView>
                            <FontAwesomeIcon icon={faLock} color='white' size={20} />
                        </StreamGameLockView>
                    </StreakTrackerGameView>
                )
            }

            return (
                <StreakTrackerView>
                    {/* { gamesThisWeek.map(game => <StreakGamePublished key={game?.id} game={game} /> )} */}
                    {lockedDayLetters.map((dayLetter, index) => <StreakGameUnpublished key={`${dayLetter}-${index}`} dayLetter={dayLetter} />)}
                </StreakTrackerView>
            )
        }

        const GuessingGamesCard = () => {
            const firstUnplayedGameIndex = displayGames.findIndex(nextGame => !nextGame?.hasCompletedGame);
            console.log("firstUnplayedGameIndex",firstUnplayedGameIndex)
            const firstUnplayedGame = (firstUnplayedGameIndex !== -1)
                ? displayGames[firstUnplayedGameIndex]
                : null;
            const renderGameElement = ({ item, index }) => {
                const game = item;
                return (
                    <GuessingGamePreview
                        key={index}
                        index={index}
                        game={game}
                        navigation={navigation}
                        showAdmin={false}
                        showGuessMarkers={false}
                    />
                );
            }
            const generateRandom=(min, max, exclude)=> {
                let random;
                while (!random) {
                  const x = Math.floor(Math.random() * (max - min + 1)) + min;
                  if (exclude.indexOf(x) === -1) random = x;
                }
                return random;
              }

              const showMeSignupIfGuest = () => {
                if (reelayDBUser?.username === 'be_our_guest') {
                    dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
                    return true;
                }
                return false;
            }
            
            // var test = generateRandom(5, 20)

            const advanceToFirstUnplayedGame = () => {
                if(isGuestUser){
                    showMeSignupIfGuest()
                    return false
                }
                const firstUnplayedGameIndex = guessingGamesObj?.content?.reduce((ids, thing,index) => {
                    if (thing.hasCompletedGame) {
                      ids.push(index);
                    }
                    return ids;
                  }, []);

                const games = guessingGamesObj?.content;
                const currentDate =  new Date().toISOString();
                const filterGame = games.filter((element) => moment(element?.myGuesses[0]?.createdAt,'DD-MM-YYYY').isSame(moment(currentDate,'DD-MM-YYYY')));
                const position = games.findIndex((element) => element == filterGame[0])
                console.log("firstUnplayedGameIndex2",filterGame)
                // if(moment(lastData?.myGuesses[4]?.createdAt??0,'DD-MM-YYYY').isSame(moment(currentDate,'DD-MM-YYYY'))){
                //     showMessageToast("","You have Already played, come back tomorrow for new challenge!")
                //     advanceToGuessingGame({ game: firstUnplayedGame, index: firstUnplayedGameIndex2, isPreview: false });
                // }
                advanceToGuessingGame({ game: firstUnplayedGame, index: filterGame.length !== 0 ? position : generateRandom(0, guessingGamesObj?.content?.length??0,firstUnplayedGameIndex), isPreview: false });
            }

            return (
                <CardPressable onPress={advanceToFirstUnplayedGame}>
                    <HeaderView>
                    <GameImage onPress={advanceToFirstUnplayedGame} source={GAME_IMAGE_SOURCE} />
                        {/* <HeaderText size={18}>{'Guess the title'}</HeaderText> */}
                        {/* {firstUnplayedGame && (
                            <ForwardPressable onPress={advanceToFirstUnplayedGame}>
                                <FontAwesomeIcon icon={faChevronRight} color='white' size={16} />
                            </ForwardPressable>
                        )} */}
                    </HeaderView>
                    {/* <FlatList
                        ListHeaderComponent={<View style={{ width: 16 }} />}
                        ListFooterComponent={<View style={{ width: 16 }} />}
                        data={displayGames}
                        renderItem={renderGameElement}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    /> */}
                    {/* <StreakTracker /> */}
                </CardPressable>
            );
        }

        if (displayGames?.length === 0) {
            return <View />;
        }

        return (
            <GuessingGamesView>
                {!advertise &&
                <HeaderView>
                    <HeaderText>{'Play the daily game'}</HeaderText>
                    {isAdmin && <AllGamesButton />}
                </HeaderView>}
                {displayGames?.length > 0 && <GuessingGamesCard />}
            </GuessingGamesView>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};