import React from 'react';
import { SafeAreaView } from 'react-native';
import { Input } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled(SafeAreaView)``

export default SearchField = ({ searchText, updateSearch, placeholderText="Search" }) => {

    return (
        <SearchFieldContainer>
            <Input 
                onChangeText={(newSearchText) => updateSearch(newSearchText)}
                placeholder={placeholderText}
                value={searchText}
                style={{
                    marginTop: 20,
                    textDecorationColor: 'white',
                    color: 'white',
                    fontFamily: 'System',
                }}
            />
        </SearchFieldContainer>
    );
};