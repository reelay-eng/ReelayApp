import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { setSearchResults } from './CreateReelaySlice';
import { 
    useMovieSearchQuery,
    useMovieFetchQuery,
    useMovieCreditsFetchQuery,
    useSeriesSearchQuery,
    useSeriesFetchQuery,
    useSeriesFetchCreditsQuery,
} from '../../redux/services/TMDbApi';

const SearchFieldContainer = styled.View``

export default SearchField = () => {
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();

    const movieSearchResults = { data, error, isLoading } = useMovieSearchQuery(searchText);
    // const seriesSearchResults = { data, error, isLoading } = (searchText == '') ? useSeriesSearchQuery(searchText) : [];

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
        setSearchText(newSearchText);
        if (!movieSearchResults.error && !movieSearchResults.isLoading) {
            dispatch(setSearchResults(movieSearchResults.data));
        } else if (movieSearchResults.error) {
            console.log(movieSearchResults.error);
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