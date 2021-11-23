import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import { FeedContext } from '../../context/FeedContext';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';

import styled from 'styled-components/native';
import { searchTitles } from '../../api/ReelayDBApi';

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
    const [searchType, setSearchType] = useState('Film');

    const { setTabBarVisible } = useContext(FeedContext);
    useEffect(() => {
        setTabBarVisible(true);
    }, []);

    const FilmTVSelector = ({ type }) => {

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
            }}>
                <SelectorText>{type}</SelectorText>
            </SelectorContainer>
        );
    }

    const updateSearch = async (newSearchText, type=searchType) => {
        setSearchText(newSearchText);
        try {
            if (type === 'Film') {
                annotatedResults = await searchTitles(newSearchText, false);
                setSearchResults(annotatedResults);
            } else {
                annotatedResults = await searchTitles(newSearchText, true);
                setSearchResults(annotatedResults);
            }
        } catch (error) {
            console.log('its here');
        }
    }

    useEffect(() => {
        updateSearch(searchText, searchType);
    }, [searchText, searchType]);

    return (
        <SafeAreaView style={{ backgroundColor: 'black', height: '100%', width: '100%'}}>
            <TopBarContainer>
                <SelectorBarContainer>
                    <FilmTVSelector type='Film' />
                    <FilmTVSelector type='TV' />
                </SelectorBarContainer>
                <BackButton navigation={navigation} />

            </TopBarContainer>
            <SearchField searchText={searchText} updateSearch={updateSearch} placeholderText="What did you see?"/>
            <MarginBelowLine />
            <TitleSearchResults navigation={navigation} searchResults={searchResults} source={'create'} />
        </SafeAreaView>
    );
};