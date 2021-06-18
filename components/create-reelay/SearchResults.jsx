import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import SearchResultItem from './SearchResultItem';

const Message = styled.Text``
const SearchResultsContainer = styled.SafeAreaView`
    flex: 1;
`
const FlatListContainer = styled.FlatList`
    flex: 1;
`

const SearchResults = () => {

    const searchResults = useSelector((state) => state.createReelay.searchResults);

    return (
        <View>
            { !searchResults && <Message>{'Awaiting search results...'}</Message> }
            { searchResults &&
                <FlatList 
                    initialNumToRender={searchResults.length}
                    data={searchResults} 
                    renderItem={({ item, index, separators }) => {
                        return <SearchResultItem result={item} resultType={'movie'} />;
                    }}
                    keyExtractor={item => item.id.toString()}

                />      
            }
        </View>
    );
}

export default SearchResults;