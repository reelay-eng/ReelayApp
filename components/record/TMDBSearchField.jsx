import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled.View`
`

const TMDBSearchField = () => {
    const [searchText, setSearchText] = useState('');

    const updateSearch = (newSearchText) => {
        setSearchText(newSearchText);
        console.log("New search text: " + newSearchText);
    }

    console.log('render search field');

    return (
        <SearchFieldContainer>
            <SearchBar
                placeholder="Enter a movie title..."
                onChangeText={updateSearch}
                value={searchText}
                platform={'default'}
                lightTheme
            />
        </SearchFieldContainer>
    );
};

export default TMDBSearchField;