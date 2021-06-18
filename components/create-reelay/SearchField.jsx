import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { setSearchResults } from '../../redux/slices/CreateReelaySlice';
import { useTitleSearchQuery } from '../../redux/services/TMDbApi';

const SearchFieldContainer = styled.View``

export default SearchField = () => {

    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();

    const { data, error, isLoading } = useTitleSearchQuery(searchText);

    const updateSearch = (newSearchText) => {
        setSearchText(newSearchText);

        // update search results
        if (!error && !isLoading) {
            dispatch(setSearchResults(data));
        } else if (error) {
            console.log(error);
        }
    }

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