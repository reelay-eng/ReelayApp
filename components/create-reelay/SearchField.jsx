import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled.View``

export default SearchField = ({ searchText, updateSearch }) => {

    return (
        <SearchFieldContainer>
            <SearchBar
                placeholder="Enter a movie title..."
                onChangeText={(newSearchText) => updateSearch(newSearchText)}
                value={searchText}
                platform={'default'}
                lightTheme
            />
        </SearchFieldContainer>
    );
};