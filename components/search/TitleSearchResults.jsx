import React from 'react';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';

const ScreenContainer = styled(Pressable)`
    display: flex;
    flex: 1;
    width: 100%;
`
const SearchResultContainer = styled(View)`
    border-bottom-color: #505050;
    border-bottom-width: 0.3px;
    padding-top: 5px;
    padding-bottom: 5px;
`
const SearchResultsScrollContainer = styled(ScrollView)`
    padding-bottom: ${270}px;
    margin-bottom: ${270}px;
`

export default TitleSearchResults = ({ 
    navigation, 
    searchResults, 
    source, 
    clubID, 
    topicID,
}) => {
    const renderSearchResult = (result) => {
        return (
            <SearchResultContainer key={result?.id}>
                <TitleSearchResultItem 
                    navigation={navigation} 
                    result={result} 
                    source={source} 
                    clubID={clubID}
                    topicID={topicID}
                />
            </SearchResultContainer>
        );
    }

    return (
        <ScreenContainer onPress={Keyboard.dismiss}>
            { (searchResults?.length > 0) &&
                <SearchResultsScrollContainer>
                    { searchResults.map(renderSearchResult)}
                </SearchResultsScrollContainer>
            }
        </ScreenContainer>
    );
}