import React, { useContext, useEffect, useState, useRef } from "react";
import { SafeAreaView, View } from "react-native";

//Components
import { BaseHeader } from '../../components/global/Headers'
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import { ToggleSelector } from '../../components/global/Buttons';
import FollowButtonDrawer from "../../components/profile/Follow/FollowButtonDrawer";

// Context
import { AuthContext } from "../../context/AuthContext";

// Logging
import { logAmplitudeEventProd } from "../../components/utils/EventLogger";

// API
import { searchTitles, searchUsers } from "../../api/ReelayDBApi";

// Styling
import styled from "styled-components/native";

const MarginBelowLine = styled(View)`
    height: 30px;
`

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
    const { cognitoUser } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState("Film");
    const [creatorFollowers, setCreatorFollowers] = useState([]);
    const updateCounter = useRef(0);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerFollowObj, setDrawerFollowObj] = useState(null);

    useEffect(() => {
        updateCounter.current += 1;
        updateSearch(searchText, selectedType, updateCounter.current);
    }, [searchText, selectedType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    useEffect(() => {
        logAmplitudeEventProd('openSearchScreen', {
            username: cognitoUser.username,
            userSub: cognitoUser?.attributes?.sub,
            source: 'search',
        });
    }, [navigation]);

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {            
            setSearchResults([]);
            return;
        }
        logAmplitudeEventProd('search', {
            username: cognitoUser?.attributes?.sub,
            searchText: newSearchText,
            searchType: searchType,
            source: 'search',
        });
        try {
            let annotatedResults;
            if (searchType === "Film") {
                annotatedResults = await searchTitles(newSearchText, false);
            } else if (searchType === "TV") {
                annotatedResults = await searchTitles(newSearchText, true);
            } else {
                annotatedResults = await searchUsers(newSearchText);
            }
            if (updateCounter.current === counter) {
                setSearchResults(annotatedResults);
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
			<BaseHeader text={"Search"} />
			<TopBarContainer>
				<SelectorBarContainer>
					<ToggleSelector
						options={["Film", "TV", "Users"]}
						selectedOption={selectedType}
						onSelect={(type) => {
							setSelectedType(type);
							setLoading(true);
						}}
					/>
				</SelectorBarContainer>
			</TopBarContainer>
			<SearchBarContainer>
				<SearchField
					searchText={searchText}
					updateSearchText={updateSearchText}
					borderRadius={4}
					placeholderText={`Search for ${
						selectedType === "Film"
							? "films"
							: selectedType === "TV"
							? "TV shows"
							: "users"
					}`}
				/>
			</SearchBarContainer>
			{selectedType !== "Users" && !loading && (
				<TitleSearchResults
					navigation={navigation}
					searchResults={searchResults}
					source={"search"}
				/>
			)}
			{selectedType === "Users" && !loading && (
				<UserSearchResults
					navigation={navigation}
					searchResults={searchResults}
					source={"search"}
					setCreatorFollowers={setCreatorFollowers}
					setDrawerFollowObj={setDrawerFollowObj}
					setDrawerOpen={setDrawerOpen}
				/>
			)}
			{drawerOpen && (
				<FollowButtonDrawer
					creatorFollowers={creatorFollowers}
					setCreatorFollowers={setCreatorFollowers}
					drawerOpen={drawerOpen}
					setDrawerOpen={setDrawerOpen}
					followObj={drawerFollowObj}
					followType={"what to do"}
					sourceScreen={"UserFollowScreen"}
				/>
			)}
		</SearchScreenContainer>
	);
};
