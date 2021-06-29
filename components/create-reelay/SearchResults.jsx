import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ContainerStyles, TextStyles } from '../../styles';
import styled from 'styled-components/native';

import SearchResultItem from './SearchResultItem';

const SearchResults = ({ navigation }) => {

    const HorizontalLine = styled(View)`
        margin: 0px 0px 0px 0px;
        height: 1px;
        width: 100%;
        background-color: #D3D3D3
    `;

    const searchText = useSelector((state) => state.createReelay.searchText).trim();
    const TITLE_ACCURACY_WEIGHT = 50; // has not been tuned

    const compareSearchResults = (result1, result2) => {
        if (!result1.title) return 1;
        if (!result2.title) return -1;

        const result1Comparator = result1.title.length > searchText.length 
            ? result1.title.slice(0, searchText.length) : result1.title;
        const result2Comparator = result2.title.length > searchText.length 
            ? result2.title.slice(0, searchText.length) : result2.title;

        const result1Deviation = levenshteinDistance(result1Comparator, searchText) * TITLE_ACCURACY_WEIGHT;
        const result2Deviation = levenshteinDistance(result2Comparator, searchText) * TITLE_ACCURACY_WEIGHT;

        if (!result1.popularity) return result2Deviation - result1Deviation;
        if (!result2.popularity) return result2Deviation - result1Deviation;
        return (result2.popularity - result1.popularity) + (result1Deviation - result2Deviation);
    }

    const levenshteinDistance = (s, t) => {
        if (!s.length) return t.length;
        if (!t.length) return s.length;
    
        return Math.min(
            levenshteinDistance(s.substr(1), t) + 1,
            levenshteinDistance(t.substr(1), s) + 1,
            levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
        ) + 1;
    }

    const searchResults = { 
        movieSearchData, 
        movieSearchError, 
        movieSearchIsLoading,
        seriesSearchData, 
        seriesSearchError, 
        seriesSearchIsLoading,
    } = useSelector((state) => state.createReelay.searchResults);

    const shouldRenderResults = !(searchResults.movieSearchIsLoading || searchResults.seriesSearchIsLoading 
                                || searchResults.movieSearchError || searchResults.seriesSearchError);

    // tag all the movies as being movies
    const movieSearchResults = shouldRenderResults 
        ? searchResults.movieSearchData.results.map((result) => {
            return {
                ...result, 
                is_movie: true, 
                is_series: false,
            }})
        : [];

    // tag all the series as being series
    // overwrite title and release_date with the differently-named fields for TV series
    // this is a hack -- be careful when querying TMDb in other places:
    // it won't automatically return data in this form
    const seriesSearchResults = shouldRenderResults
        ? searchResults.seriesSearchData.results.map((result) => {
            return {
                ...result, 
                title: result.name,
                release_date: result.first_air_date,
                is_movie: false, 
                is_series: true,
            }})
        : [];

    // join the two lists together
    const searchResultsList = shouldRenderResults 
        ? ([...movieSearchResults, ...seriesSearchResults ]) 
        : [];

    // sort the list by vote count on TMDb, for lack of a better metric right now
    // vote count seems to track with popularity
    const searchResultsListSorted = shouldRenderResults 
        ? (searchResultsList.sort(compareSearchResults)) 
        : [];

    return (
        <View>
            { searchResultsListSorted.length < 1 && <Text style={TextStyles.darkTextCentered}>{'Awaiting search results...'}</Text> }
            { searchResultsListSorted.length >= 1 &&
                <FlatList 
                    data={searchResultsListSorted} 
                    initialNumToRender={searchResultsListSorted.length}
                    ItemSeparatorComponent={HorizontalLine}
                    renderItem={({ item, index, separators }) => {
                        return <SearchResultItem result={item} resultType={'movie'} navigation={navigation} />;
                    }}
                    keyExtractor={item => item.id.toString()}

                />
            }
        </View>
    );
}

export default SearchResults;