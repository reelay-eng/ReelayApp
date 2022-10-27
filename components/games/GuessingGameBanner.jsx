import React, { Fragment, memo, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import AddToWatchlistButton from "../watchlist/AddToWatchlistButton";
import AddToStackButton from "../feed/AddToStackButton";
import VenueIcon from '../utils/VenueIcon';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheckCircle, faChevronDown, faChevronUp, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import { GamesIconSVG, TopicsBannerIconSVG, TopicsIconSVG } from "../global/SVGs";

import { BlurView } from 'expo-blur'
import SearchField from "../create-reelay/SearchField";
import { searchTitles } from "../../api/ReelayDBApi";
import TitleSearchResults from "../search/TitleSearchResults";
import ReelayColors from "../../constants/ReelayColors";

const { width } = Dimensions.get('window');

const BannerTopSpacer = styled(View)`
    height: ${props => props.allowExpand ? 22 : 12}px;
`
const ExpandArrowView = styled(Pressable)`
    align-items: center;
    padding-bottom: 6px;
    width: 100%;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const TitleBannerRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
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
    background-color: ${props => props.isCorrect 
        ? ReelayColors.reelayGreen 
        : (props.isGuessed) 
            ? ReelayColors.reelayRed : 'gray'
    };
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
const TitleInfoPressable = styled(Pressable)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 5px;
`
const TitlePosterContainer = styled(View)`
    justify-content: center;
    margin: 8px;
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

const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
`
const PressableContainer = styled(Pressable)`
    flex-direction: row;
    margin: 5px;
    margin-left: 20px;
`
const TitleLineContainer = styled(View)`
    flex: 1;
    justify-content: center;
    margin-left: 12px;
    margin-right: 20px;
`;
const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
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
    myGuesses,
    setMyGuesses,
    navigation=null, 
    onCameraScreen=false,
    reelay=null, 
    titleObj,
    topic=null,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);

    const allowExpand = (titleObj?.titleKey !== 'film-0');
    // figure out how to do ellipses for displayTitle
    const displayTitle = (titleObj.display) ? titleObj.display : 'Title not found'; 
    const guessesLeft = (6 - myGuesses?.length);
    const guessesPlural = (guessesLeft > 1) ? 'es' : 0;
	const displayYear = (titleObj.releaseYear) ? titleObj.releaseYear : '';
    const runtime = titleObj?.runtime;
    const venue = reelay?.content?.venue;

    const onClickExpand = () => {
        if (!allowExpand) {
            return;
        }
        animate(200);
        setExpanded(!expanded);
    }
    
    const openTitleDetail = async () => {
        if (!titleObj || !navigation) return;
        navigation.push('TitleDetailScreen', { titleObj });

        logAmplitudeEventProd('openTitleScreen', {
            reelayID: reelay?.id,
            reelayTitle: titleObj?.display,
            username: reelayDBUser?.username,
            source: 'poster',
        });
    }

    const AddToClubs = () => {
        return (
            <AddToWatchlistButton
                navigation={navigation}
                titleObj={reelay?.title}
                reelay={reelay}
            />
        );
    }

    const ExpandArrow = () => {
        if (!allowExpand) return <ExpandArrowView />
        return (
            <ExpandArrowView onPress={onClickExpand}>
                <FontAwesomeIcon icon={expanded ?  faChevronUp : faChevronDown} color='white' size={16} />
            </ExpandArrowView>
        );
    }

    const GuessResult = () => {
        if (clueIndex >= myGuesses?.length) return <View />;
        console.log('clue index: ', clueIndex, myGuesses?.length);
        const guessObj = myGuesses[clueIndex];
        console.log('guess obj: ', guessObj);
        const guessedTitleObj = guessObj?.guessedTitleObj;

        console.log('guessed title obj: ', guessedTitleObj);

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

    const GamesIcon = () => {
        return (
            <GamesIconView>
                <GamesIconSVG />
            </GamesIconView>
        );
    }

    const Guesser = () => {
        const isSeries = false;
        const correctTitleKey = reelay?.titleKey;
        console.log('correct title key: ', correctTitleKey);
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

        const onGuessTitle = (guessedTitleObj) => {
            const guessedTitleKey = `${guessedTitleObj.titleType}-${guessedTitleObj?.id}`
            console.log('guessed title: ', guessedTitleKey);

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

        const renderGuessMarker = (guess, index) => {
            const isCorrect = guess?.isCorrect;
            const reelaySub = guess?.reelaySub;
            const viewable = (reelaySub === reelay?.sub);
            console.log('viewable?: ', viewable, reelaySub, reelay?.sub);
            return (
                <GuessMarkerView key={index} isCorrect={isCorrect} isGuessed={true} viewable={viewable} />
            );
        };
        // if (myGuesses?.length === 0) return <View />;
        console.log('guesses: ', myGuesses);
        return (
            <GuessMarkerRowView>
                { myGuesses.map(renderGuessMarker) }
                { guessesLeft > 0 && (
                    <GuessMarkerView isCorrect={false} isGuessed={false} viewable={true} />
                )}
            </GuessMarkerRowView>
        )
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
        

    const showGuessResult = (clueIndex < myGuesses?.length);
    return (
        <TopicBannerBackground>
            <BlurView intensity={25} tint='dark' style={{ alignItems: 'center', width: '100%'}}>
                <BannerTopSpacer allowExpand={allowExpand} />
                <TopicBannerRow onPress={onClickExpand}>
                    <GamesIcon />
                    <TopicTitle />
                </TopicBannerRow>   
                <GuessMarkers />
                { showGuessResult && <GuessResult /> }
                { !showGuessResult && <Guesser /> }
                {/* { expanded && <ExpandedInfo /> } */}
                {/* <ExpandArrow /> */}
            </BlurView>
        </TopicBannerBackground>
    );
}

export default GuessingGameBanner;