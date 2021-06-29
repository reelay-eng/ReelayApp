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
    const seriesSearchResults = { data, error, isLoading } = useSeriesSearchQuery(searchText);

    // these are sorted on the SearchResults component for now
    const updateSearch = (newSearchText) => {
        setSearchText(newSearchText);
        if (!movieSearchResults.error && !seriesSearchResults.error) {
            dispatch(setSearchResults({
                searchText: newSearchText,
                movieSearchData: movieSearchResults.data,
                movieSearchError: movieSearchResults.error,
                movieSearchIsLoading: movieSearchResults.isLoading,
                seriesSearchData: seriesSearchResults.data,
                seriesSearchError: seriesSearchResults.error,
                seriesSearchIsLoading: seriesSearchResults.isLoading,
            }));
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