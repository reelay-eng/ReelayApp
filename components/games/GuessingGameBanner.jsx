import React, { Fragment, memo, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import * as ReelayText from '../global/Text';
import { AuthContext } from "../../context/AuthContext";

import { logAmplitudeEventProd } from "../utils/EventLogger";
import styled from 'styled-components/native';
import TitlePoster from "../global/TitlePoster";
import AddToWatchlistButton from "../watchlist/AddToWatchlistButton";
import AddToStackButton from "../feed/AddToStackButton";
import VenueIcon from '../utils/VenueIcon';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { getRuntimeString } from "../utils/TitleRuntime";
import { animate } from "../../hooks/animations";
import { GamesIconSVG, TopicsBannerIconSVG, TopicsIconSVG } from "../global/SVGs";

import { BlurView } from 'expo-blur'
import SearchField from "../create-reelay/SearchField";
import { searchTitles } from "../../api/ReelayDBApi";
import TitleSearchResults from "../search/TitleSearchResults";

const { width } = Dimensions.get('window');

const BannerTopSpacer = styled(View)`
    height: ${props => props.allowExpand ? 22 : 12}px;
`
const ExpandArrowView = styled(Pressable)`
    align-items: center;
    padding-bottom: 6px;
    width: 100%;
`
const ExpandedInfoView = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 6px;
    margin-top: 0px;
    padding: 12px;
    padding-top: 10px;
    padding-bottom: 0px;
    width: ${width}px;
`
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const TopicBannerRow = styled(Pressable)`
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
    margin: 5px;
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

const GuessingGameBanner = ({ 
    club = null,
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

    const ExpandedInfo = () => {
        return (
            <Pressable onPress={onClickExpand}>
                <ExpandedInfoView>
                    <Poster />
                    <TitleInfo />
                    { !onCameraScreen && <AddToClubs /> }
                </ExpandedInfoView>
            </Pressable>
        );
    }

    const Poster = () => {
        return (
            <TitlePosterContainer>
                <TitlePoster title={titleObj} onPress={openTitleDetail} width={56} />
            </TitlePosterContainer>
        );
    }

    const TitleInfo = () => {
        return (
            <TitleInfoPressable onPress={onClickExpand}>
                <TitleTextContainer>
                    <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                        {displayTitle}
                    </TitleText>
                </TitleTextContainer>
                <Underline 
                    displayYear={displayYear} 
                    expanded={expanded}
                    runtime={titleObj?.runtime}
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
                clueIndex: 0,
                guessedTitleKey,
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
            <Fragment>
                <SearchField
                    backgroundColor="rgba(0,0,0,0.4)"
                    placeholderText="You have 6 guesses remaining"
                    searchText={searchText}
                    updateSearchText={setSearchText}
                />
                { searchResults.length > 1 && (
                    <TitleSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        isSeries={isSeries}
                        source={"guessTitle"}
                        onGuessTitle={onGuessTitle}
                    />
                )}
            </Fragment>
        )
    }

    const TopicTitle = () => {
        return (
            <TopicTitleView>
                <TopicTitleText numberOfLines={3}>{topic?.title}</TopicTitleText>
            </TopicTitleView>
        );
    }

    const Underline = () => {
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

    const VenueIndicator = () => {
        return (
            <VenueContainer>
                <VenueIcon venue={venue} size={20} border={1} />
            </VenueContainer>
        )
    }
        

    return (
        <TopicBannerBackground>
            <BlurView intensity={25} tint='dark' style={{ alignItems: 'center', width: '100%'}}>
                <BannerTopSpacer allowExpand={allowExpand} />
                <TopicBannerRow onPress={onClickExpand}>
                    <GamesIcon />
                    <TopicTitle />
                </TopicBannerRow>   
                <Guesser /> 
                {/* <SearchField
                    placeholderText="You have 6 guesses remaining"
                    searchText={'You have 6 guesses remaining'}
                    updateSearchText={updateSearchText}
                /> */}
                {/* { expanded && <ExpandedInfo /> } */}
                {/* <ExpandArrow /> */}
            </BlurView>
        </TopicBannerBackground>
    );
}

export default GuessingGameBanner;