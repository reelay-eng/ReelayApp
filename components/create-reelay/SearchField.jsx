import React from 'react';
import { Input } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled.View``

export default SearchField = ({ searchText, updateSearch }) => {

    return (
        <SearchFieldContainer>
            <Input 
                onChangeText={(newSearchText) => updateSearch(newSearchText)}
                placeholder="What did you see?"
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