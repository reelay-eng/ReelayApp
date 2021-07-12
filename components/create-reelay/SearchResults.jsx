import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { ContainerStyles, TextStyles } from '../../styles';
import styled from 'styled-components/native';

import SearchResultItem from './SearchResultItem';

const SearchResults = ({ navigation, searchResults }) => {

    const HorizontalLine = styled(View)`
        margin: 0px 0px 0px 0px;
        height: 1px;
        width: 100%;
        background-color: #D3D3D3
    `;

    return (
        <View>
            { searchResults.length < 1 && <Text style={TextStyles.darkTextCentered}>{'Awaiting search results...'}</Text> }
            { searchResults.length >= 1 &&
                <FlatList 
                    data={searchResults} 
                    initialNumToRender={searchResults.length}
                    renderItem={({ item, index, separators }) => {
                        return <SearchResultItem 
                            result={item} 
                            navigation={navigation}
                        />;
                    }}
                    keyExtractor={item => item.id.toString()}
                />
            }
        </View>
    );
}

export default SearchResults;