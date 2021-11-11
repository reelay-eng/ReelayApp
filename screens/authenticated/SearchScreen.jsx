import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Pressable, Text } from "react-native";
import { UploadContext } from "../../context/UploadContext";

import BackButton from "../../components/utils/BackButton";
import SearchField from "../../components/create-reelay/SearchField";
import SearchResults from "../../components/create-reelay/SearchResults";
import UserSearchResults from "../../components/search/UserSearchResults";
import {
  fetchAnnotatedTitle,
  searchMovies,
  searchSeries,
} from "../../api/TMDbApi";
import { searchUsers } from "../../api/ReelayDBApi";

import styled from "styled-components/native";

export default SearchScreen = ({ navigation }) => {
  const MarginBelowLine = styled(View)`
    height: 30px;
  `;
  const TopBarContainer = styled(View)`
    flex-direction: row;
  `;
  const SelectorBarContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    position: absolute;
    width: 100%;
  `;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("Film");
  const [loading, setLoading] = useState(false);

  const { setHasSelectedTitle } = useContext(UploadContext);

  const SearchTypeSelector = ({ type }) => {
    const textDecorationLine = searchType === type ? "underline" : "none";

    const SelectorContainer = styled(Pressable)`
      height: 30px;
      margin: 10px;
    `;
    const SelectorText = styled(Text)`
      font-size: 22px;
      font-family: System;
      color: white;
      text-decoration-line: ${textDecorationLine};
    `;

    return (
      <SelectorContainer
        onPress={() => {
          setLoading(true);
          setSearchType(type);
        }}
      >
        <SelectorText>{type}</SelectorText>
      </SelectorContainer>
    );
  };

  useEffect(() => {
    updateSearch(searchText, searchType);
  }, [searchText, searchType])

  const updateSearch = async (newSearchText, type = searchType) => {
    console.log(newSearchText);
    console.log(type);
    setSearchText(newSearchText);
    try {
      if (type == "Film") {
        const searchResults = await searchMovies(newSearchText);
        const annotatedResults = await Promise.all(
          searchResults.map(async (result) => {
            return await fetchAnnotatedTitle(result.id, false);
          })
        );
        setSearchResults(annotatedResults);
      } else if (type=="TV") {
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
          // console.log(searchResults)
      }
    } catch (error) {
      console.log("its here");
    }
    setLoading(false);
  };

  // this makes the tab bar visible
  useEffect(() => {
    setHasSelectedTitle(false);
  }, []);

  console.log("SEARCH TYPE: ")
  console.log(searchType)

  return (
    <SafeAreaView
      style={{ backgroundColor: "black", height: "100%", width: "100%" }}
    >
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
      {searchType !== "Users" && !loading && (
        <SearchResults navigation={navigation} searchResults={searchResults} />
      )}
      {searchType === "Users" && !loading &&
        (console.log("sad"),
        <UserSearchResults navigation={navigation} searchResults={searchResults} />)}
    </SafeAreaView>
  );
};
