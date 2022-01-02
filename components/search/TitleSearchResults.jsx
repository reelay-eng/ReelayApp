import React from 'react';
import { ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';

export default TitleSearchResults = ({ navigation, searchResults, source }) => {

    const ROW_HEIGHT = 165
    const SearchResultContainer = styled(View)`
        height: ${ROW_HEIGHT}px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `

    const SearchResultsScrollContainer = styled(ScrollView)`
        margin-bottom: ${ROW_HEIGHT + 105}px;
    `;

    return (
        <View>
            { searchResults?.length >= 1 &&
                <SearchResultsScrollContainer>
                    { searchResults.map(result => {
                        return (
                          <SearchResultContainer key={result?.id}>
                            <TitleSearchResultItem navigation={navigation} result={result} source={source} />
                          </SearchResultContainer>
                        );
                    })}
                </SearchResultsScrollContainer>
            }
        </View>
    );
}