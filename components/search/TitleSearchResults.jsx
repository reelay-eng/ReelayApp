import React from 'react';
import { ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';

export default TitleSearchResults = ({ navigation, searchResults }) => {

    const RowHeight = 165
    const SearchResultContainer = styled(View)`
        height: ${RowHeight}px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `

    const SearchResultsScrollContainer = styled(ScrollView)`
        margin-bottom: ${RowHeight + 65}px;
    `;

    return (
        <View>
            { searchResults?.length >= 1 &&
                <SearchResultsScrollContainer>
                    { searchResults.map(result => {
                        return (
                          <SearchResultContainer key={result?.id}>
                            <TitleSearchResultItem result={result} navigation={navigation} />
                          </SearchResultContainer>
                        );
                    })}
                </SearchResultsScrollContainer>
            }
        </View>
    );
}