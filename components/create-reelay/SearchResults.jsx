import React from 'react';
import { ScrollView, View } from 'react-native';
import SearchResultItem from './SearchResultItem';

const SearchResults = ({ navigation, searchResults }) => {

    return (
        <View>
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