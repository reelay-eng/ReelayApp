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

import { searchUsers } from "../../api/ReelayDBApi";
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
    }, [searchText, selectedType])

    const updateSearch = async (newSearchText, type = selectedType) => {
        if (searchText !== newSearchText) {
            setSearchText(newSearchText);
        }
        try {
            if (type === "Film") {
                const searchResults = await searchMovies(newSearchText);
                const annotatedResults = await Promise.all(
                    searchResults.map(async (result) => {
                        return await fetchAnnotatedTitle(result.id, false);
                    })
                );
                setSearchResults(annotatedResults);
            } else if (type === "TV") {
                const searchResults = await searchSeries(newSearchText);
                const annotatedResults = await Promise.all(
                    searchResults.map(async (result) => {
                        return await fetchAnnotatedTitle(result.id, true);
                    })
                );
                setSearchResults(annotatedResults);
            } else {
                // fetch users info
                const searchResults = await searchUsers(newSearchText);
                setSearchResults(searchResults);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

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
                updateSearch={updateSearch}
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
