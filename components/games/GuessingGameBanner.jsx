import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, TouchableOpacity, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck, faCheckCircle, faForward, faForwardStep, faQuestion, faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import { GamesIconSVG } from "../global/SVGs";

import { BlurView } from 'expo-blur'
import SearchField from "../create-reelay/SearchField";
import { searchTitles } from "../../api/ReelayDBApi";
import ReelayColors from "../../constants/ReelayColors";
import { getGameDetails, postGuessingGameGuess } from "../../api/GuessingGameApi";
import { useDispatch, useSelector } from "react-redux";
import * as Haptics from 'expo-haptics';
import moment from "moment";
import { EmptyTitleObject } from "../../api/TMDbApi";

const getRandomString = (radix=36) => {
    return Math.random().toString(radix).slice(2,7);
}

const { width } = Dimensions.get('window');

const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const BannerTopSpacer = styled(View)`
    height: ${props => props.allowExpand ? 22 : 12}px;
`
const GamesIconView = styled(View)`
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10px;
`
const GuessIconView = styled(View)`
    align-items: center;
    background-color: ${props => props.skipped ? 'transparent' : 'rgba(255,255,255,0.9)'};
    border-radius: 100px;
    justify-content: center;
    flex-direction: row;
    margin: 10px;
`
const GuessMarkerView = styled(View)`
    align-items: center;
    background-color: ${props => props.color};
    border-color: rgba(255,255,255,0.5);
    border-radius: 4px;
    height: ${props => props.unanswered ? 18 : 24}px;
    justify-content: center;
    margin: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: ${props => props.unanswered ? 18 : 24}px;
`
const GuessMarkerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
`
const PressableContainer = styled(Pressable)`
    flex-direction: row;
    margin: 5px;
    margin-left: 20px;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const SearchRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: ${width - 90}px;
`
const SearchView = styled(View)`
    margin-bottom: -10px;
    width: 100%;
`
const SkipPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(212,212,212,0.9);
    border-radius: 6px;
    height: 43px;
    justify-content: center;
    flex-direction: row;
    margin-bottom: 10px;
    position: absolute;
    right: 16px;
    top: 16px;
    width: 52px;
    shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
`
const SkipText = styled(ReelayText.CaptionEmphasized)`
    color: black;
    font-size: 14px;
`
const Spacer = styled(View)`
    height: 16px;
`
const TitleBannerRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 6px;
`
const TitleInfoView = styled(View)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 5px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    margin-left: 12px;
    margin-right: 20px;
`
const TitlePosterContainer = styled(View)`
    justify-content: center;
    margin: 8px;
    margin-top: 12px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TitleTextContainer = styled(View)`
    justify-content: center;
    display: flex;
`
const TopicBannerRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
`
const TopicBannerBackground = styled(View)`
    align-items: center;
    border-radius: 8px;
    top: 20px;
    width: ${width - 20}px;
    zIndex: 3;
    overflow: hidden;
`
const TopicTitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white;
    text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TopicTitleView = styled(View)`
    justify-content: center;
    display: flex;
    flex: 1;
    height: 100%;
    padding-right: 10px;
`
const UnderlineContainer = styled(View)`
    margin-top: 5px;
    margin-right: 8px;
    width: 100%;
`
const UnrevealedPosterQuestionMark = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 24px;
    line-height: 24px;
`
const UnrevealedPosterView = styled(View)`
    align-items: center;
    background-color: #080808;
    border-radius: 4px
    border-color: #3d3d3d;
    border-width: 2px;
    height: 52px;
    justify-content: center;
    width: 36px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const YearVenueContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`

const SearchResults = ({ onGuessTitle, searchResults }) => {
    const displayResults = searchResults.slice(0,4);

    const GuessOption = ({ titleObj }) => {
        const title = titleObj?.display;
        const actors = titleObj?.displayActors?.map(actor => actor.name)
                .filter((actor) => actor !== undefined)
                .join(", ") 
            ?? [];
    
    
        const releaseYear = (titleObj?.releaseDate && titleObj?.releaseDate.length >= 4) 
            ? titleObj.releaseDate.slice(0,4) : '';
        const runtimeString = getRuntimeString(titleObj?.runtime);
    
        return (
            <PressableContainer key={titleObj?.id} onPress={() => onGuessTitle(titleObj)}>
                <ImageContainer>
                    { titleObj?.posterSource && (
                        <TitlePoster title={titleObj} width={60} />
                    )}
                    { !titleObj.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
                </ImageContainer>
                <TitleLineContainer>
                    <TitleText>{title}</TitleText>
                    <YearText>{`${releaseYear}    ${runtimeString}`}</YearText>
                    <ActorText>{actors}</ActorText>
                </TitleLineContainer>
            </PressableContainer>
        );
    }    

    const renderItem = ({ item, index }) => {
        return <GuessOption titleObj={item} onGuessTitle={onGuessTitle} />
    }

    return <FlatList data={displayResults} renderItem={renderItem} />;
}

const GuessingGameBanner = ({ 
    clueIndex = 0,
    guessingGame,
    isPreview = false,
    isUnlocked = false,
    reelay=null, 
    titleObj,
    topic=null,
}) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);

    const allowExpand = (titleObj?.titleKey !== 'film-0');
    const gameDetails = guessingGame?.details;
    const gameOver = isUnlocked;
    const isGameCreator = (reelayDBUser?.sub === guessingGame?.creatorSub);
    const myGuesses = guessingGame?.myGuesses ?? [];

    // figure out how to do ellipses for displayTitle
    const guessesLeft = (gameDetails?.clueOrder?.length - myGuesses?.length);
    const guessesPlural = (guessesLeft > 1) ? 'es' : '';

    const onClickExpand = () => {
        if (!gameOver) return;
        animate(200);
    }

    const GamesIcon = () => {
        return (
            <GamesIconView>
                <GamesIconSVG />
            </GamesIconView>
        );
    }
    
    const GuessResult = () => {
        const fillEmptyGuessesCorrect = () => {
            const correctGuess = myGuesses[myGuesses.length - 1];
            const filledGuesses = [...myGuesses];
            for (let ii = 0; ii <= guessesLeft; ii++) {
                filledGuesses.push(correctGuess);
            }
            return filledGuesses;
        }
        const displayGuesses = (gameOver) ? fillEmptyGuessesCorrect() : myGuesses;
        const guessObj = displayGuesses[clueIndex];
        const guessedTitleObj = guessObj?.guessedTitleObj;
        const hasSkippedGuess = (guessedTitleObj?.titleKey === 'film-0');

        let guessIcon = guessObj?.isCorrect 
            ? faCheckCircle 
            : faXmarkCircle;
        let guessIconColor = guessObj?.isCorrect 
            ? ReelayColors.reelayGreen 
            : ReelayColors.reelayRed;

        return (
            <TitleBannerRow>
                { !hasSkippedGuess && <Poster guessedTitleObj={guessedTitleObj} /> }
                { hasSkippedGuess && <UnrevealedPoster />}
                <TitleInfo guessedTitleObj={guessedTitleObj} />
                <GuessIconView>
                    <FontAwesomeIcon icon={guessIcon} color={guessIconColor} size={27} />
                </GuessIconView>
            </TitleBannerRow>
        )
    }

    const Guesser = () => {
        const dispatch = useDispatch();
        const isSeries = false;
        const correctTitleKey = reelay?.titleKey;
        const [loading, setLoading] = useState(false);
        const [searchText, setSearchText] = useState('');
        const [searchResults, setSearchResults] = useState([]);
        const updateCounter = useRef(0);

        const updateSearch = async (newSearchText, counter) => {
            if (searchText.length === 0) {            
                setSearchResults([]);
                return;
            }
    
            try {
                setLoading(true);
                const annotatedResults = await searchTitles(newSearchText, isSeries);
                if (updateCounter.current === counter) {
                    setSearchResults(annotatedResults);
                }
            } catch (error) {
                console.log(error);
            }    
        }

        const onGuessTitle = async (guessedTitleObj) => {
            const guessedTitleKey = `${guessedTitleObj.titleType}-${guessedTitleObj?.id}`
            const isCorrect = (guessedTitleKey === correctTitleKey);
            const inviteCode = (clueIndex === 0)
                ? getRandomString()
                : guessingGame?.myGuesses?.[0]?.inviteCode;

            const nextGuess = {
                createdAt: moment().toISOString(),
                clueIndex,
                guessedTitleKey,
                guessedTitleObj,
                inviteCode,
                isCorrect,
                reelaySub: reelay?.sub,
                topicID: topic?.id,
                userSub: reelayDBUser?.sub,
                username: reelayDBUser?.username,
                visibility: 'draft',
            }

            guessingGame.stats[clueIndex].numGuesses += 1;
            const isLastClue = (clueIndex === guessingGame?.stats?.length - 1);

            if (isCorrect) {
                guessingGame.stats[clueIndex].guesserSubs?.push(reelayDBUser?.sub);
                guessingGame.stats[clueIndex].numCorrect += 1;
                guessingGame.hasWonGame = true;
            }

            if (isCorrect || isLastClue) {
                guessingGame.hasCompletedGame = true;
            }

            guessingGame.myGuesses = [...myGuesses, nextGuess];
            dispatch({ type: 'updateHomeGuessingGames', payload: guessingGame });

            if (isCorrect) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            if (!isPreview) {
                const postBody = {
                    authSession,
                    reqUserSub: reelayDBUser?.sub,
                    clueIndex,
                    guessedTitleKey,
                    inviteCode: inviteCode,
                    reelaySub: reelay?.sub,
                    topicID: guessingGame?.id,
                    username: reelayDBUser?.username,
                }
    
                const postGuessResult = await postGuessingGameGuess(postBody);
                console.log('post guess result: ', postGuessResult);
            }
        }

        const SkipButton = () => {
            const onSkipTitle = () => onGuessTitle(EmptyTitleObject);
            return (
                <SkipPressable onPress={onSkipTitle}>
                    <SkipText>{'Skip'}</SkipText>
                    {/* <FontAwesomeIcon icon={faForward} color='black' size={16} /> */}
                </SkipPressable>
            );
        }

        useEffect(() => {
            updateCounter.current += 1;
            const nextUpdateCounter = updateCounter.current;

            setTimeout(() => {
                updateSearch(searchText, nextUpdateCounter);
            }, 200);    
        }, [searchText]);

        return (
            <SearchView>
                <SearchField
                    backgroundColor="rgba(0,0,0,0.4)"
                    placeholderText={`You have ${guessesLeft} guess${guessesPlural} remaining`}
                    searchText={searchText}
                    updateSearchText={setSearchText}
                />
                { guessesLeft > 1 && <SkipButton /> }
                { searchResults.length > 1 && (
                    <SearchResults
                        searchResults={searchResults}
                        onGuessTitle={onGuessTitle}
                    />
                )}
            </SearchView>
        )
    }

    const GuessMarkers = () => {

        const getMarkerColor = (guess) => {
            if (guess?.isCorrect) return ReelayColors?.reelayGreen;
            return ReelayColors.reelayRed;
        } 

        const renderGuessMarker = (guess, index) => {
            const isCorrect = guess?.isCorrect;
            const icon = isCorrect ? faCheck : faXmark;
            const color = getMarkerColor(guess);
            return (
                <GuessMarkerView key={index} 
                    color={color}
                    isCorrect={isCorrect} 
                    isGuessed={true} 
                >
                    <FontAwesomeIcon icon={icon} color='white' size={18} />
                </GuessMarkerView>
            );
        };

        const unansweredColor = gameOver ? ReelayColors.reelayGreen : '#C8C8C8';

        return (
            <GuessMarkerRowView>
                { myGuesses.map(renderGuessMarker) }
                { (guessesLeft > 0 && !gameOver) && (
                    <GuessMarkerView 
                        key={'unanswered'} 
                        color={unansweredColor} 
                        isCorrect={false} 
                        isGuessed={false} 
                        unanswered={true}
                    >
                    </GuessMarkerView>
                )}
            </GuessMarkerRowView>
        )
    }

    const Poster = ({ guessedTitleObj }) => {
        return (
            <TitlePosterContainer>
                <TitlePoster title={guessedTitleObj} width={36} />
            </TitlePosterContainer>
        );
    }

    const TitleInfo = ({ guessedTitleObj }) => {
        const hasSkippedGuess = (guessedTitleObj?.titleKey === 'film-0');
        const displayTitle = hasSkippedGuess ? 'Skipped' : guessedTitleObj?.display;
        const hasDisplayYear = (!hasSkippedGuess 
            && guessedTitleObj?.releaseDate 
            && guessedTitleObj?.releaseDate.length >= 4);

        const displayYear = (hasDisplayYear) 
            ? guessedTitleObj.releaseDate.slice(0,4) 
            : '';

        return (
            <TitleInfoView>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <Underline 
                    displayYear={displayYear} 
                    runtime={hasSkippedGuess ? '' : guessedTitleObj?.runtime}
                />
            </TitleInfoView>
        );
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText numberOfLines={3}>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    const Underline = ({ displayYear, runtime }) => {
        const runtimeString = runtime ? getRuntimeString(runtime) : '';
        return (
            <UnderlineContainer>
                <YearVenueContainer>
                    { displayYear?.length > 0 && <YearText>{displayYear}</YearText> }
                    { runtimeString?.length > 0 && <RuntimeText>{runtimeString}</RuntimeText> }
                </YearVenueContainer>
            </UnderlineContainer>
        );
    };     
    
    const UnrevealedPoster = () => {
        return (
            <TitlePosterContainer>
                <UnrevealedPosterView>
                    <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
                </UnrevealedPosterView>
            </TitlePosterContainer>
        );    
    }    


    const showGuessResult = ((clueIndex < myGuesses?.length) || gameOver);

    return (
        <TopicBannerBackground>
            <BlurView intensity={25} tint='dark' style={{ alignItems: 'center', width: '100%'}}>
                <BannerTopSpacer allowExpand={allowExpand} />
                <TopicBannerRow onPress={onClickExpand}>
                    <GamesIcon />
                    <TopicTitle />
                </TopicBannerRow>   
                <GuessMarkers />
                { showGuessResult && !isGameCreator && <GuessResult /> }
                { showGuessResult && isGameCreator && <Spacer /> }
                { !showGuessResult && <Guesser /> }
            </BlurView>
        </TopicBannerBackground>
    );
}

export default GuessingGameBanner;