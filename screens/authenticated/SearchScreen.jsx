import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Components
import { HeaderWithBackButton } from '../../components/global/Headers'
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import { ToggleSelector } from '../../components/global/Buttons';
import ClubSearchResults from "../../components/search/ClubSearchResults";
import SuggestedTitlesGrid from "../../components/search/SuggestedTitlesGrid";

// Context
import { AuthContext } from "../../context/AuthContext";

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { searchTitles, searchUsers } from "../../api/ReelayDBApi";
import { searchPublicClubs } from "../../api/ClubsApi";

// Styling
import styled from "styled-components/native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchPopularMovies, fetchPopularSeries } from "../../api/TMDbApi";

const SearchScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const TopBarContainer = styled(View)`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
`
const SelectorBarContainer = styled(View)`
    width: 90%;
    height: 40px;
`
const SearchBarContainer = styled(View)`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`
const MAX_SUGGESTION_PAGE = 9; // multiple of 3 gives us a full bottom row

export default SearchScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);

    const initialSearchType = route?.params?.initialSearchType ?? 'Film';
    const [loading, setLoading] = useState(false);
    const myFollowing = useSelector(state => state.myFollowing);

    
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState(initialSearchType);
    const showSuggestions = ['Film', 'TV'].includes(selectedType);

    const suggestedMovieResults = useSelector(state => state.suggestedMovieResults);
    const suggestedSeriesResults = useSelector(state => state.suggestedSeriesResults);
    
    const suggestedTitles = (selectedType === 'TV') 
        ? suggestedSeriesResults?.titles 
        : suggestedMovieResults?.titles;

    const updateCounter = useRef(0);

    useEffect(() => {
        updateCounter.current += 1;
        const nextUpdateCounter = updateCounter.current;
        setTimeout(() => {
            updateSearch(searchText, selectedType, nextUpdateCounter);
        }, 200);
    }, [searchText, selectedType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    useEffect(() => {
        logAmplitudeEventProd('openSearchScreen', {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            source: 'search',
        });
    }, [navigation]);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const extendSuggestedTitles = async () => {
        if (!['Film', 'TV'].includes(selectedType)) return;
        const { titles, nextPage } = (selectedType === 'TV') 
            ? suggestedSeriesResults 
            : suggestedMovieResults;

        if (nextPage > MAX_SUGGESTION_PAGE) return;

        switch (selectedType) {
            case 'Film':
                const nextMovieTitles = await fetchPopularMovies(nextPage);
                const nextSuggestedMovieResults = {
                    titles: [...titles, ...nextMovieTitles],
                    nextPage: nextPage + 1,
                }
                dispatch({ type: 'setSuggestedMovieResults', payload: nextSuggestedMovieResults });
                return;
            case 'TV':
                const nextSeriesTitles = await fetchPopularSeries(nextPage);
                const nextSuggestedSeriesResults = {
                    titles: [...titles, ...nextSeriesTitles],
                    nextPage: nextPage + 1,
                }
                dispatch({ type: 'setSuggestedSeriesResults', payload: nextSuggestedSeriesResults });
                return;
            default:
                return;
        }
    }

    const sortUserResults = (userA, userB) => {
        if (userA.username === reelayDBUser.username)   return -1;
        if (userB.username === reelayDBUser.username)   return 1;

        const matchUserA = (followObj) => (userA.username === followObj.creatorName);
        const matchUserB = (followObj) => (userB.username === followObj.creatorName);
        const followingUserA = myFollowing.find(matchUserA);
        const followingUserB = myFollowing.find(matchUserB);

        if (followingUserA === followingUserB) {
            return (userA.username > userB.username) ? 1 : -1;
        }
        return (followingUserA) ? -1 : 1;

    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {            
            setSearchResults([]);
            return;
        }
        try {
            setLoading(true);
            let annotatedResults;
            if (searchType === "Film") {
                annotatedResults = await searchTitles(newSearchText, false);
            } else if (searchType === "TV") {
                annotatedResults = await searchTitles(newSearchText, true);
            } else if (searchType === "Users") {
                annotatedResults = await searchUsers(newSearchText);
                annotatedResults = annotatedResults.sort(sortUserResults);
            } else if (searchType === "Clubs") {
                annotatedResults = await searchPublicClubs({ 
                    authSession,
                    page: 0,
                    reqUserSub: reelayDBUser?.sub, 
                    searchText: newSearchText 
                });
            }

            if (updateCounter.current === counter) {
                setSearchResults(annotatedResults);
                logAmplitudeEventProd('search', {
                    username: reelayDBUser?.sub,
                    searchText: newSearchText,
                    searchType: searchType,
                    source: 'search',
                });        
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateSearchText = async (newSearchText) => {
        if (newSearchText !== searchText) {
            setSearchText(newSearchText);
        }
    }

    const SearchResults = () => {
        return (
            <Fragment>
                { (selectedType === "Film" || selectedType === "TV") && (
                    <TitleSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        isSeries={(selectedType === 'TV')}
                        source={"search"}
                    />
                )}
                {selectedType === "Clubs" && (
                    <ClubSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        source={"search"}
                    />
                )}
                {selectedType === "Users" && (
                    <UserSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        source={"search"}
                    />
                )}
            </Fragment>
        );
    }


    return (
		<SearchScreenContainer>
			<HeaderWithBackButton navigation={navigation} text={"Search"} />
            <TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
                        displayOptions={["Film", "TV", "Clubs", "Users"]}
						options={["Film", "TV", "Clubs", "Users"]}
						selectedOption={selectedType}
						onSelect={(type) => {
							setSelectedType(type);
                            if (searchText.length) setLoading(true);
						}}
					/>
				</SelectorBarContainer>
			</TopBarContainer>
            <SearchBarContainer>
				<SearchField
					searchText={searchText}
					updateSearchText={updateSearchText}
					borderRadius={4}
					placeholderText={`Find ${
						selectedType === "Film"
							? "films"
                        : selectedType === "TV"
							? "TV shows"
                        : selectedType === "Clubs"
							? "clubs on Reelay"
                        : "people on Reelay"
					}`}
				/>
			</SearchBarContainer>
			{ !loading && !showSuggestions && <SearchResults /> }
            { !loading && showSuggestions && (
                <SuggestedTitlesGrid 
                    navigation={navigation} 
                    extendSuggestedTitles={extendSuggestedTitles} 
                    suggestedTitles={suggestedTitles} 
                /> 
            )}
            { loading && <ActivityIndicator /> }
		</SearchScreenContainer>
	);
};
