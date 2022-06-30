import React, { useContext, useEffect, useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

//Components
import { HeaderWithBackButton } from '../../components/global/Headers'
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import { ToggleSelector } from '../../components/global/Buttons';

// Context
import { AuthContext } from "../../context/AuthContext";

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { searchTitles, searchUsers } from "../../api/ReelayDBApi";

// Styling
import styled from "styled-components/native";
import { useFocusEffect } from "@react-navigation/native";

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

export default SearchScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState("Film");
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
            } else {
                annotatedResults = await searchUsers(newSearchText);
                annotatedResults = annotatedResults.sort(sortUserResults);
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


    return (
		<SearchScreenContainer>
			<HeaderWithBackButton navigation={navigation} text={"Search"} />
            <TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
                        displayOptions={["Film", "TV", "Users"]}
						options={["Film", "TV", "Users"]}
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
							: "people on Reelay"
					}`}
				/>
			</SearchBarContainer>
			{selectedType !== "Users" && !loading && (
				<TitleSearchResults
					navigation={navigation}
					searchResults={searchResults}
                    searchText={searchText}
                    isSeries={(selectedType === 'TV')}
					source={"search"}
				/>
			)}
			{selectedType === "Users" && !loading && (
				<UserSearchResults
					navigation={navigation}
					searchResults={searchResults}
                    searchText={searchText}
					source={"search"}
				/>
			)}
            { loading && <ActivityIndicator /> }
		</SearchScreenContainer>
	);
};
