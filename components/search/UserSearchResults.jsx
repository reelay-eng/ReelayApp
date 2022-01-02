import React from "react";
import { ScrollView, View } from "react-native";
import UserSearchResultItem from "./UserSearchResultItem";

import styled from "styled-components/native";

const FollowItemContainer = styled(View)`
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
`;

const UserSearchResults = ({ navigation, searchResults, setCreatorFollowers, setDrawerFollowObj, setDrawerOpen }) => {
    const ROW_HEIGHT = 165;
	const SearchResultsScrollContainer = styled(ScrollView)`
		margin-bottom: ${ROW_HEIGHT + 105}px;
	`;
    return (
        <View>
            {searchResults.length >= 1 && (
                <SearchResultsScrollContainer>
                    {searchResults.map((result, index) => {
                        return (
                          <FollowItemContainer key={index}>
                            <UserSearchResultItem
                              result={result}
                              navigation={navigation}
                              setCreatorFollowers={setCreatorFollowers}
                              setDrawerFollowObj={setDrawerFollowObj}
                              setDrawerOpen={setDrawerOpen}
                            />
                          </FollowItemContainer>
                        );
                    })}
                </SearchResultsScrollContainer>
            )}
        </View>
    );
};

export default UserSearchResults;
