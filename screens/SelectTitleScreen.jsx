import React, { useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import styled from 'styled-components/native';

import BackButton from '../components/utils/BackButton';
import SearchField from '../components/create-reelay/SearchField';
import SearchResults from '../components/create-reelay/SearchResults';
import { searchMovies, searchSeries } from '../api/TMDbApi';

export default SelectTitleScreen = ({ navigation }) => {

    const MarginBelowLine = styled(View)`
        height: 30px;
    `
    const TopBarContainer = styled(View)`
        flex-direction: row;
    `
    const SelectorBarContainer = styled(View)`
        align-items: center;    
        flex-direction: row;
        justify-content: center;
        position: absolute;
        width: 100%;
    `
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Movies');

    const MovieSeriesSelector = ({ type }) => {

        const textDecorationLine = (searchType === type) ? 'underline' : 'none';

        const SelectorContainer = styled(Pressable)`
            height: 30px;
            margin: 10px;
        `
        const SelectorText = styled(Text)`
            font-size: 22px;
            font-family: System;
            color: white;
            text-decoration-line: ${textDecorationLine}
        `

        return (
            <SelectorContainer onPress={() => {
                setSearchType(type);
                updateSearch(searchText, type);
            }}>
                <SelectorText>{type}</SelectorText>
            </SelectorContainer>
        );
    }


    const updateSearch = async (newSearchText, type=searchType) => {
        setSearchText(newSearchText);
        try {
            if (type == 'Movies') {
                setSearchResults(await searchMovies(newSearchText)); 
            } else {
                setSearchResults(await searchSeries(newSearchText)); 
            }
        } catch (error) {
            console.log('its here');
        }
    }

    return (
        <SafeAreaView style={{ backgroundColor: 'black', height: '100%', width: '100%'}}>
            <TopBarContainer>
                <SelectorBarContainer>
                    <MovieSeriesSelector type='Movies' />
                    <MovieSeriesSelector type='Series' />
                </SelectorBarContainer>
                <BackButton navigation={navigation} />

            </TopBarContainer>
            <SearchField searchText={searchText} updateSearch={updateSearch} />
            <MarginBelowLine />
            <SearchResults navigation={navigation} searchResults={searchResults} />
        </SafeAreaView>
    );
};