import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, View, Pressable, Text } from "react-native";

import BackButton from "../../components/utils/BackButton";
import SearchField from "../../components/create-reelay/SearchField";
import FollowResults from "../../components/profile/Follow/FollowResults";

import { ActionButton, PassiveButton } from "../../components/global/Buttons";

import { searchTitles, searchUsers } from "../../api/ReelayDBApi";
import styled from "styled-components/native";

const MarginBelowLine = styled(View)`
  height: 30px;
`;
const TopBarContainer = styled(View)`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
const SearchScreenContainer = styled(SafeAreaView)`
  background-color: black;
  height: 100%;
  width: 100%;
`;
const SelectorBarContainer = styled(View)`
  width: 60%;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  position: relative;
`;
const BackButtonContainer = styled(View)`
  position: relative;
  width: 20%;
  min-width: 30px;
  z-index: 3;
`;

export default SearchScreen = ({ navigation, route }) => {
  const {type, creator, followers, following} = route.params;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedType, setSelectedType] = useState(type);
  const updateCounter = useRef(0);

  useEffect(() => {
    updateCounter.current += 1;
    updateSearch(searchText, selectedType, updateCounter.current);
  }, [searchText, selectedType]);

  useEffect(() => {
    setLoading(false);
  }, [searchResults]);

  const updateSearch = async (newSearchText, searchType, counter) => {
    if (!newSearchText || newSearchText === undefined || newSearchText === "") {
      setSearchResults([]);
    }

    try {
      let results;
      if (searchType === "Followers") {
        results = followers;
      } else {
        results = following;
      } 
      console.log(results)
      if (updateCounter.current === counter) {
        setSearchResults(results);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateSearchText = async (newSearchText) => {
    if (newSearchText !== searchText) {
      setSearchText(newSearchText);
    }
  };

  const SearchTypeSelector = ({ type }) => {
    const selected = selectedType === type;

    const SelectorContainer = styled(View)`
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      height: 40px;
      flex: 0.4;
    `;

    return (
      <SelectorContainer>
        {selected && (
          <ActionButton
            onPress={() => {
              setLoading(true);
              setSelectedType(type);
            }}
            text={type}
            fontSize="18px"
            borderRadius="15px"
          />
        )}

        {!selected && (
          <PassiveButton
            onPress={() => {
              setLoading(true);
              setSelectedType(type);
            }}
            text={type}
            fontSize="18px"
            borderRadius="15px"
          />
        )}
      </SelectorContainer>
    );
  };

  return (
    <SearchScreenContainer>
      <TopBarContainer>
        <BackButtonContainer>
          <BackButton navigation={navigation} />
        </BackButtonContainer>
        <SelectorBarContainer>
          <SearchTypeSelector type="Followers" />
          <SearchTypeSelector type="Following" />
        </SelectorBarContainer>
      </TopBarContainer>
      <SearchField
        searchText={searchText}
        updateSearchText={updateSearchText}
        placeholderText={`Search ${
          selectedType === "Followers" ? "followers" : "following"
        }`}
      />
      <FollowResults navigation={navigation} searchResults={searchResults} />
    </SearchScreenContainer>
  );
};
