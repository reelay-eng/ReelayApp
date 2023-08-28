import React, { useContext, useEffect, useState, useRef, Fragment } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, View } from "react-native";
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
import { logAmplitudeEventProd, firebaseCrashlyticsError, firebaseCrashlyticsLog } from "../../components/utils/EventLogger";

// API
import { searchTitles, searchUsers } from "../../api/ReelayDBApi";
import { searchPublicClubs } from "../../api/ClubsApi";

// Styling
import styled from "styled-components/native";
import { useFocusEffect } from "@react-navigation/native";
import { addToMyCustomlist, getCustomItems } from "../../api/WatchlistApi";

const { width } = Dimensions.get('window');

const SearchScreenView = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SelectorBarView = styled(View)`
    height: 40px;
    width: ${width - 24}px;
`
const SearchBarView = styled(View)`
    align-items: center;
    justify-content: center;
    padding-left: 2px;
    padding-right: 2px;
    width: 100%;
`
const TopBarView = styled(View)`
    align-items: center;
    margin-bottom: 12px;
    width: 100%;
`

export default SearchScreen = ({ navigation, route }) => {
    try {
        firebaseCrashlyticsLog('Search screen mounted');
        const dispatch = useDispatch();
        const { reelayDBUser } = useContext(AuthContext);
        const addToWatchlist = route?.params?.addToWatchlist ?? false;
        const addCustomWatchlist = route?.params?.addCustomWatchlist ?? false;
        const checkMark = route?.params?.checkMark ?? false;
        const initialSearchType = route?.params?.initialSearchType ?? 'Film';
        const Redirect = route?.params?.Redirect ?? 0;

        const myWatchlistItems = useSelector(state => state.myWatchlistItems);
        const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);
        const addCustomProfile = useSelector(state => state.addCustomProfile);

        const goBack = () => {
            if (addToWatchlist) {
                if (Redirect == 0) {
                    navigation.navigate('MyWatchlistScreen', {
                        myWatchlistItems,
                        myWatchlistRecs,
                        Redirect
                    });
                } else {
                    navigation.navigate('WatchlistScreen', {
                        myWatchlistItems,
                        myWatchlistRecs,
                        Redirect
                    });
                }
            } else {
                navigation.goBack();
            }
        }

        const callMultiple = async () => {
            const addToMyCustomlists = await addToMyCustomlist({
                reqUserSub: reelayDBUser?.sub,
                titleData: addCustomProfile
            });
            goBack();
            const getItems = await getCustomItems(reelayDBUser?.sub);
            dispatch({ type: 'setCustomWatchData', payload: getItems });
        }

        return (
            <SearchScreenView>
                <HeaderWithBackButton
                    onPressOverride={goBack}
                    navigation={navigation}
                    checkMark={checkMark}
                    onDone={callMultiple}
                    text={addToWatchlist ? 'add to watchlist' : addCustomWatchlist ? 'add to custom' : 'search'}
                />
                <SearchBarWithResults navigation={navigation} initialSearchType={initialSearchType} addToWatchlist={addToWatchlist} addCustomWatchlist={addCustomWatchlist} />
            </SearchScreenView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
};

const SearchBarWithResults = ({ navigation, initialSearchType, addToWatchlist, addCustomWatchlist }) => {
    const dispatch = useDispatch();
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const myFollowing = useSelector(state => state.myFollowing);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const allSearchOptions = isGuestUser
        ? ['Film', 'TV', 'Users']
        // : ['Film', 'TV', 'Chats', 'Users']
        : ['Film', 'TV', 'Users']
    const tabOptions = addToWatchlist || addCustomWatchlist
        ? ['Film', 'TV']
        : allSearchOptions;

    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState(initialSearchType);

    const searchTextEmpty = (!searchText || searchText === undefined || searchText === '');
    const showSuggestions = ['Film', 'TV'].includes(selectedType) && searchTextEmpty;
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

    const sortUserResults = (userA, userB) => {
        if (userA.username === reelayDBUser.username) return -1;
        if (userB.username === reelayDBUser.username) return 1;

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
        if (searchTextEmpty) {
            setSearchResults([]);
            return;
        }

        try {
            firebaseCrashlyticsLog('Updated search screen')
            setLoading(true);
            let annotatedResults;
            if (searchType === "Film") {
                annotatedResults = await searchTitles(newSearchText, false);
            } else if (searchType === "TV") {
                annotatedResults = await searchTitles(newSearchText, true);
            } else if (searchType === "Users") {
                annotatedResults = await searchUsers(newSearchText);
                annotatedResults = annotatedResults.sort(sortUserResults);
            } else if (searchType === "Chats") {
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
            firebaseCrashlyticsError(error)
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
                {(selectedType === "Film" || selectedType === "TV") && (
                    <TitleSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        isSeries={(selectedType === 'TV')}
                        source={"search"}
                        addCustomWatchlist={addCustomWatchlist}
                    />
                )}
                {selectedType === "Chats" && (
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

    const TopBar = () => {
        return (
            <TopBarView>
                <SelectorBarView>
                    <ToggleSelector
                        displayOptions={tabOptions}
                        options={tabOptions}
                        selectedOption={selectedType}
                        onSelect={(type) => {
                            setSelectedType(type);
                            if (searchText.length) setLoading(true);
                        }}
                    />
                </SelectorBarView>
            </TopBarView>
        );
    }

    return (
        <React.Fragment>
            <TopBar />
            <SearchBarView>
                <SearchField
                    backgroundColor="#232425"
                    border={false}
                    borderRadius={4}
                    searchText={searchText}
                    updateSearchText={updateSearchText}
                    placeholderText={`Find ${selectedType === "Film"
                        ? "films"
                        : selectedType === "TV"
                            ? "TV shows"
                            : selectedType === "Chats"
                                ? "chats on Reelay"
                                : "people on Reelay"
                        }`}
                />
            </SearchBarView>
            {!loading && !showSuggestions && <SearchResults />}
            {!loading && showSuggestions && !addToWatchlist && (
                <SuggestedTitlesGrid
                    navigation={navigation}
                    selectedType={selectedType}
                    source='search'
                    addCustomWatchlist={addCustomWatchlist}
                />
            )}
            {loading && <ActivityIndicator />}
        </React.Fragment>
    )
}
