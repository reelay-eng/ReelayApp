import React from 'react';
import { ScrollView, View } from 'react-native';
import TitleSearchResultItem from './TitleSearchResultItem';

import styled from 'styled-components/native';

export default TitleSearchResults = ({ navigation, searchResults }) => {

    const SearchResultContainer = styled(View)`
        height: 165px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;
    `

    return (
        <View>
            { searchResults?.length >= 1 &&
                <ScrollView>
                    { searchResults.map(result => {
                        return (
                          <SearchResultContainer key={result?.id}>
                            <TitleSearchResultItem result={result} navigation={navigation} />
                          </SearchResultContainer>
                        );
                    })}
                </ScrollView>
            }
        </View>
    );
}