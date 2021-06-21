import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ContainerStyles, TextStyles } from '../../styles';
import styled from 'styled-components/native';

import SearchResultItem from './SearchResultItem';

const SearchResults = ({ navigation }) => {

    const searchResultsWrapper = useSelector((state) => state.createReelay.searchResults);
    const searchResults = searchResultsWrapper.results;

const HorizontalLine = styled(View)`
    margin: 0px 0px 0px 0px;
    height: 1px;
    width: 100%;
    background-color: #D3D3D3
`;

    return (
        <View>
            { !searchResults && <Text style={TextStyles.darkTextCentered}>{'Awaiting search results...'}</Text> }
            { searchResults &&
                <FlatList 
                    data={searchResults} 
                    initialNumToRender={searchResults.length}
                    ItemSeparatorComponent={HorizontalLine}
                    renderItem={({ item, index, separators }) => {
                        return <SearchResultItem result={item} resultType={'movie'} navigation={navigation} />;
                    }}
                    keyExtractor={item => item.id.toString()}

                />      
            }
        </View>
    );
}

export default SearchResults;