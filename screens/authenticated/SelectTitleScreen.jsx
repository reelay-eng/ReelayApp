import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import { FeedContext } from '../../context/FeedContext';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';
import { ActionButton, PassiveButton } from '../../components/global/Buttons';

import styled from 'styled-components/native';
import { searchTitles } from '../../api/ReelayDBApi';

export default SelectTitleScreen = ({ navigation }) => {

    const MarginBelowLine = styled(View)`
        height: 30px;
    `
    const TopBarContainer = styled(View)`
        width: 100%;
        display: flex;
        flex-direction: row;
    `
    const SelectorBarContainer = styled(View)`
        width: 75%;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        position: relative;
    `
    const BackButtonContainer = styled(View)`
        position: relative;
        width: 20%;
        min-width: 30px;
        z-index: 3;
    `
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');

    const { setTabBarVisible } = useContext(FeedContext);
    useEffect(() => {
        setTabBarVisible(true);
    }, []);

    const FilmTVSelector = ({ type }) => {

        const selected = (searchType === type);

        const SelectorContainer = styled(View)`
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            height: 40px;
            flex: 0.4;
        `;
    
        return (
            <SelectorContainer>
                {selected && (
                        <ActionButton
                        onPress={() => {
                            setSearchType(type);
                        }}
                        text={type}
                        fontSize='22px'
                        borderRadius='15px'
                        />
                )}

                {!selected && (
                        <PassiveButton 
                        onPress={() => {
                            setSearchType(type);
                        }}
                        text={type}
                        fontSize='22px'
                        borderRadius='15px'
                        />
                )}
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
                <BackButtonContainer>
                    <BackButton navigation={navigation} />
                </BackButtonContainer>
                <SelectorBarContainer>
                    <FilmTVSelector type='Film' />
                    <FilmTVSelector type='TV' />
                </SelectorBarContainer>
                
            </TopBarContainer>
            <SearchField searchText={searchText} updateSearch={updateSearch} placeholderText="What did you see?"/>
            <TitleSearchResults navigation={navigation} searchResults={searchResults} source={'create'} />
        </SafeAreaView>
    );
};