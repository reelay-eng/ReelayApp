import React from 'react';
import { ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';

export default TitleSearchResults = ({ 
    navigation, 
    searchResults, 
    source, 
    clubID, 
    topicID,
}) => {

    const SearchResultContainer = styled(View)`
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
        padding-top: 5px;
        padding-bottom: 5px;
    `

    const SearchResultsScrollContainer = styled(ScrollView)`
        margin-bottom: ${270}px;
    `;

    return (
        <View>
            { searchResults?.length >= 1 &&
                <SearchResultsScrollContainer>
                    { searchResults.map(result => {
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
                    })}
                </SearchResultsScrollContainer>
            }
        </View>
    );
}