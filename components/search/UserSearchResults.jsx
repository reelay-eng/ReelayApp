import React from "react";
import { ScrollView, View } from "react-native";
import UserSearchResultItem from "./UserSearchResultItem";

import styled from "styled-components/native";

const UserSearchResults = ({ navigation, searchResults }) => {
    const ROW_HEIGHT = 100;
    const SearchResultContainer = styled(View)`
        height: ${ROW_HEIGHT}px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `;

    const SearchResultsScrollContainer = styled(ScrollView)`
        margin-bottom: ${ROW_HEIGHT + 110}px;
    `;
    
    return (
        <View>
            {searchResults.length >= 1 && (
                <SearchResultsScrollContainer>
                    {searchResults.map((result) => {
                        return (
                            <SearchResultContainer key={result?.id}>
                                <UserSearchResultItem
                                    result={result}
                                    navigation={navigation}
                                />
                            </SearchResultContainer>
                        );
                    })}
                </SearchResultsScrollContainer>
            )}
        </View>
    );
};

export default UserSearchResults;
