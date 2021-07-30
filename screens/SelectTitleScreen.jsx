import React, { useState } from 'react';
import { SafeAreaView, View, Pressable } from 'react-native';
import styled from 'styled-components/native';

import BackButton from '../components/utils/BackButton';
import SearchField from '../components/create-reelay/SearchField';
import SearchResults from '../components/create-reelay/SearchResults';
import { searchMoviesAndSeries } from '../api/TMDbApi';

export default SelectTitleScreen = ({ navigation }) => {

    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const updateSearch = async (newSearchText) => {
        setSearchText(newSearchText);

        try {
            const results = await searchMoviesAndSeries(newSearchText);
            setSearchResults(results);    
        } catch (error) {
            console.log(error);
        }
    }

    const MarginBelowLine = styled(View)`
        height: 30px;
    `

    return (
        <SafeAreaView fullScreen={true}>
            <BackButton navigation={navigation} />
            <SearchField searchText={searchText} updateSearch={updateSearch} />
            <MarginBelowLine />
            <SearchResults navigation={navigation} searchResults={searchResults} />
        </SafeAreaView>
    );
};