import React, { useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ContainerStyles } from '../styles';
import styled from 'styled-components/native';

import SearchField from '../components/create-reelay/SearchField';
import SearchResults from '../components/create-reelay/SearchResults';
import { searchMoviesAndSeries } from '../api/TMDbApi';


export default SelectTitleScreen = ({ navigation }) => {

    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const updateSearch = async (newSearchText) => {
        setSearchText(newSearchText);
        console.log('new search text', newSearchText);
        // const newSearchResults = await searchMoviesAndSeries(newSearchText);
        // setSearchResults(newSearchResults);;
        searchMoviesAndSeries(newSearchText).then((results) => {
            setSearchResults(results);
        }).catch((error) => {
            console.log(error);
        });
    }

    const MarginBelowLine = styled(View)`
        height: 30px
    `
    const HorizontalLine = styled(View)`
        margin: 0px 0px 0px 0px;
        height: 1px;
        width: 100%;
        background-color: #D3D3D3
    `;

    return (
        <SafeAreaView fullScreen={true} style={ContainerStyles.searchPageContainer}>
            <SearchField searchText={searchText} updateSearch={updateSearch} />
            <MarginBelowLine />
            <SearchResults navigation={navigation} searchResults={searchResults} />
        </SafeAreaView>
    );
};