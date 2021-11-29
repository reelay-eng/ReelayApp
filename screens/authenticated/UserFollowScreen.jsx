import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, View, Pressable, Text } from "react-native";
import { UploadContext } from "../../context/UploadContext";

import BackButton from "../../components/utils/BackButton";
import SearchField from "../../components/create-reelay/SearchField"; // change it to stuff from search
import UserSearchResults from "../../components/search/UserSearchResults"; // change to stuff from search

import { getFollowers, getFollowing } from "../../api/ReelayDBApi";
import { AuthContext } from "../../context/AuthContext";

import styled from "styled-components/native";

export default UserFollowScreen = ({ navigation, type, creator, followers, following }) => {
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
  const [searchType, setSearchType] = useState(type);

  const FollowSelector = ({ type }) => {
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
          setSearchType(type);
          updateSearch(searchText, type);
        }}
      >
        <SelectorText>{type}</SelectorText>
      </SelectorContainer>
    );
  };

  const updateSearch = async (newSearchText, type = searchType) => {
    setSearchText(newSearchText);
    try {
      if (type == "Followers") {
        // get followers and display
        // display current user on top
        setSearchResults(await getFollowers(creator.sub));
      } else {
        // get following and display
        // display current user on top
        setSearchResults(await getFollowing(creator.sub));
      }
    } catch (error) {
      console.log("its here");
    }
  };

  // this makes the tab bar visible
  // useEffect(() => {
  //   setHasSelectedTitle(false);
  // }, []);

  return (
    <SafeAreaView
      style={{ backgroundColor: "black", height: "100%", width: "100%" }}
    >
      <TopBarContainer>
        <SelectorBarContainer>
          <FollowSelector type="Followers" />
          <FollowSelector type="Following" />
        </SelectorBarContainer>
        <BackButton navigation={navigation} />
      </TopBarContainer>
      <SearchField searchText={searchText} updateSearch={updateSearch} />
      <MarginBelowLine />
      {(searchResults) && <UserSearchResults navigation={navigation} searchResults={searchResults} />}
    </SafeAreaView>
  );
};
