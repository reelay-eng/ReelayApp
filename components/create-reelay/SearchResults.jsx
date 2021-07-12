import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { TextStyles } from '../../styles';
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
                <ScrollView>
                    { searchResults.map((result, index) => {
                        return (
                            <View key={index} style={{height: 160 }}>
                                <SearchResultItem result={result} navigation={navigation} />
                            </View>
                        );
                    })}
                </ScrollView>
            }
        </View>
    );
}

export default SearchResults;