import React, { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import VenueIcon from '../utils/VenueIcon';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheckCircle, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import { GamesIconSVG } from "../global/SVGs";

import { BlurView } from 'expo-blur'
import SearchField from "../create-reelay/SearchField";
import { searchTitles } from "../../api/ReelayDBApi";
import ReelayColors from "../../constants/ReelayColors";
import { getGameDetails, postGuessingGameGuess } from "../../api/GuessingGameApi";
import { useSelector } from "react-redux";

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
    background-color: rgba(255,255,255,0.9);
    border-radius: 100px;
    justify-content: center;
    margin: 10px;
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
const Spacer = styled(View)`
    height: 16px;
`
const TitleBannerRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`
const TitleInfoPressable = styled(Pressable)`
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
const VenueContainer = styled(View)`
    margin-right: 5px;
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
    club = null,
    clueIndex = 0,
    guessingGame,
    isUnlocked = false,
    myGuesses,
    setMyGuesses,
    navigation=null, 
    reelay=null, 
    titleObj,
    topic=null,
}) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);

    const allowExpand = (titleObj?.titleKey !== 'film-0');
    const gameDetails = guessingGame?.details; // getGameDetails(guessingGame);
    const isGameCreator = (reelayDBUser?.sub === guessingGame?.creatorSub);
    // figure out how to do ellipses for displayTitle
    const guessesLeft = (gameDetails?.clueOrder?.length - myGuesses?.length);
    const guessesPlural = (guessesLeft > 1) ? 'es' : '';
    const venue = reelay?.content?.venue;

    const isGameComplete = () => {
        if (isUnlocked || guessesLeft === 0) return true;
        for (const guess of myGuesses) {
            if (guess.isCorrect) return true;
        }
        return false;
    }

    const gameOver = isGameComplete();

    const onClickExpand = () => {
        if (!gameOver) return;
        animate(200);
        setExpanded(!expanded);
    }

    // const ExpandedInfo = () => {
    //     return (
    //         <Pressable onPress={onClickExpand}>
    //             <ExpandedInfoView>
    //                 <Poster />
    //                 <TitleInfo />
    //                 { !onCameraScreen && <AddToClubs /> }
    //             </ExpandedInfoView>
    //         </Pressable>
    //     );
    // }

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
        const displayGuesses = gameOver ? fillEmptyGuessesCorrect() : myGuesses;
        console.log('display guesses: ', displayGuesses);
        const guessObj = displayGuesses[clueIndex];
        const guessedTitleObj = guessObj?.guessedTitleObj;

        const guessIcon = guessObj?.isCorrect 
            ? faCheckCircle 
            : faXmarkCircle;
        const guessIconColor = guessObj?.isCorrect 
            ? ReelayColors.reelayGreen 
            : ReelayColors.reelayRed;

        return (
            <TitleBannerRow>
                <Poster guessedTitleObj={guessedTitleObj} />
                <TitleInfo guessedTitleObj={guessedTitleObj} />
                <GuessIconView>
                    <FontAwesomeIcon icon={guessIcon} color={guessIconColor} size={27} />
                </GuessIconView>
            </TitleBannerRow>
        )
    }

    const Guesser = () => {
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
            const nextGuess = {
                clueIndex,
                guessedTitleKey,
                guessedTitleObj,
                isCorrect,
                reelaySub: reelay?.sub,
                topicID: topic?.id,
                userSub: reelayDBUser?.sub,
                visibility: 'draft',
            }

            setMyGuesses([...myGuesses, nextGuess]);

            const postBody = {
                authSession,
                reqUserSub: reelayDBUser?.sub,
                clueIndex,
                guessedTitleKey,
                reelaySub: reelay?.sub,
                topicID: guessingGame?.id,
            }
            console.log(postBody);

            const postGuessResult = await postGuessingGameGuess(postBody);
            console.log('guess result: ', postGuessResult);
        }

        useEffect(() => {
            updateCounter.current += 1;
            const nextUpdateCounter = updateCounter.current;

            setTimeout(() => {
                updateSearch(searchText, nextUpdateCounter);
            }, 200);    
        }, [searchText]);

        return (
            <View style={{ width: '100%'}}>
                <SearchField
                    backgroundColor="rgba(0,0,0,0.4)"
                    placeholderText={`You have ${guessesLeft} guess${guessesPlural} remaining`}
                    searchText={searchText}
                    updateSearchText={setSearchText}
                />
                { searchResults.length > 1 && (
                    <SearchResults
                        searchResults={searchResults}
                        onGuessTitle={onGuessTitle}
                    />
                )}
            </View>
        )
    }

    const GuessMarkers = () => {

        const getMarkerColor = (guess) => {
            if (guess?.isCorrect) return ReelayColors?.reelayGreen;
            return ReelayColors.reelayRed;
        } 

        const renderGuessMarker = (guess, index) => {
            const isCorrect = guess?.isCorrect;
            const color = getMarkerColor(guess);
            const reelaySub = guess?.reelaySub;
            const viewable = (reelaySub === reelay?.sub);
            return (
                <GuessMarkerView key={index} 
                    color={color}
                    isCorrect={isCorrect} 
                    isGuessed={true} 
                    viewable={viewable} 
                />
            );
        };

        const unansweredColor = gameOver ? ReelayColors.reelayGreen : 'gray';

        return (
            <GuessMarkerRowView>
                { myGuesses.map(renderGuessMarker) }
                { (guessesLeft > 0 && !gameOver) && (
                    <GuessMarkerView 
                        key={'unanswered'} 
                        color={unansweredColor} 
                        isCorrect={false} 
                        isGuessed={false} 
                        viewable={true} 
                    />
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
        const displayTitle = guessedTitleObj?.display;
        const displayYear = (guessedTitleObj?.releaseDate && guessedTitleObj?.releaseDate.length >= 4) 
            ? titleObj.releaseDate.slice(0,4) : '';

        return (
            <TitleInfoPressable>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <Underline 
                    displayYear={displayYear} 
                    expanded={expanded}
                    runtime={guessedTitleObj?.runtime}
                    venue={venue} 
                />
            </TitleInfoPressable>
        );
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText numberOfLines={3}>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    const Underline = ({ displayYear, runtime, venue }) => {
        const runtimeString = runtime ? getRuntimeString(runtime) : '';
        return (
            <UnderlineContainer>
                <YearVenueContainer>
                    { venue && <VenueIndicator venue={venue} /> }
                    { displayYear?.length > 0 && <YearText>{displayYear}</YearText> }
                    { runtimeString?.length > 0 && <RuntimeText>{runtimeString}</RuntimeText> }
                </YearVenueContainer>
            </UnderlineContainer>
        );
    };

    const VenueIndicator = ({ venue }) => {
        return (
            <VenueContainer>
                <VenueIcon venue={venue} size={20} border={1} />
            </VenueContainer>
        )
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