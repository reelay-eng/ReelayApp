import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Pressable, Text } from "react-native";

import BackButton from "../../components/utils/BackButton";
import SearchField from "../../components/create-reelay/SearchField";
import TitleSearchResults from "../../components/search/TitleSearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import {
    fetchAnnotatedTitle,
    searchMovies,
    searchSeries,
} from "../../api/TMDbApi";

import { searchTitles, searchUsers } from "../../api/ReelayDBApi";
import styled from "styled-components/native";

const MarginBelowLine = styled(View)`
    height: 30px;
`
const TopBarContainer = styled(View)`
    flex-direction: row;
`
const SearchScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SelectorBarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    position: absolute;
    width: 100%;
`

export default SearchScreen = ({ navigation }) => {

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedType, setSelectedType] = useState("Film");

    useEffect(() => {
        updateSearch(searchText, selectedType);
    }, [searchText, selectedType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    const updateSearch = async (newSearchText, type = selectedType) => {
        try {
            let annotatedResults;
            if (type === "Film") {
                annotatedResults = await searchTitles(newSearchText, false);
            } else if (type === "TV") {
                annotatedResults = await searchTitles(newSearchText, true);
            } else {
                annotatedResults = await searchUsers(newSearchText);
            }
            setSearchResults(annotatedResults);
        } catch (error) {
            console.log(error);
        }
    };

    const updateSearchText = async (newSearchText) => {
        if (newSearchText !== searchText) {
            setSearchText(newSearchText);
        }
    }

    const SearchTypeSelector = ({ type }) => {
        const selected = (selectedType === type);
        const textDecorationLine = selected ? "underline" : "none";

        const SelectorContainer = styled(Pressable)`
            height: 50px;
            margin-left: 10px;
            margin-right: 10px;
            padding: 10px;
        `;
        const SelectorText = styled(Text)`
            font-size: 22px;
            font-family: System;
            color: white;
            text-decoration-line: ${textDecorationLine};
        `;
    
        return (
            <SelectorContainer 
                style={{ textDecorationLine: textDecorationLine }} 
                onPress={() => {
                    setLoading(true);
                    setSelectedType(type);
            }}>
                <SelectorText>{type}</SelectorText>
            </SelectorContainer>
        );
    };


    return (
        <SearchScreenContainer>
            <TopBarContainer>
                <SelectorBarContainer>
                    <SearchTypeSelector type="Film" />
                    <SearchTypeSelector type="TV" />
                    <SearchTypeSelector type="Users" />
                </SelectorBarContainer>
                <BackButton navigation={navigation} />
            </TopBarContainer>
            <SearchField
                searchText={searchText}
                updateSearch={updateSearchText}
                placeholderText="Search for movies, TV shows, and users"
            />
            <MarginBelowLine />
            { selectedType !== "Users" && !loading && 
                <TitleSearchResults navigation={navigation} searchResults={searchResults} />
            }
            { selectedType === "Users" && !loading &&
                <UserSearchResults navigation={navigation} searchResults={searchResults} />
            }
        </SearchScreenContainer>
    );
};
