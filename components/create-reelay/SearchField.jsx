import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { setSearchResults } from './CreateReelaySlice';
import { useTitleSearchQuery, useCreditsFetchQuery } from '../../redux/services/TMDbApi';

const SearchFieldContainer = styled.View``

export default SearchField = () => {
    const [searchText, setSearchText] = useState('');
    const [lastUpdatedSearchText, setLastUpdatedSearchText] = useState('');
    const dispatch = useDispatch();

    const searchResults = { data, error, isLoading } = useTitleSearchQuery(searchText);

    const levenshteinDistance = (s, t) => {
        if (!s.length) return t.length;
        if (!t.length) return s.length;
    
        return Math.min(
            levenshteinDistance(s.substr(1), t) + 1,
            levenshteinDistance(t.substr(1), s) + 1,
            levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        ) + 1;
    }

    const updateSearch = (newSearchText) => {
        const shouldInstantSearch = levenshteinDistance(lastUpdatedSearchText, newSearchText) >= 2;
        setSearchText(newSearchText);

        if (shouldInstantSearch) {
            // triggers update to useTitleSearchQuery
            // update search results
            if (!searchResults.error && !searchResults.isLoading && shouldInstantSearch) {
                setLastUpdatedSearchText(newSearchText);
                dispatch(setSearchResults(searchResults.data));
            } else if (searchResults.error) {
                console.log(searchResults.error);
            }
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