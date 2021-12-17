import React from 'react';
import { SafeAreaView } from 'react-native';
import { Input } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled(SafeAreaView)`
`

export default SearchField = ({ 
    searchText, 
    updateSearchText, 
    placeholderText = 'Search',
    borderRadius = 18,
}) => {

    return (
        <SearchFieldContainer>
            <Input 
                onChangeText={updateSearchText}
                placeholder={placeholderText}
                value={searchText}
                style={{
                    marginTop: 20,
                    marginRight: 5,
                    marginLeft: 5,
                    paddingLeft: 10,
                    paddingTop: 15,
                    paddingBottom: 15,
                    paddingRight: 10,
                    backgroundColor: '#2C2C2C',
                    borderRadius: borderRadius,
                    color: 'white',
                    fontFamily: 'System',
                }}
                inputContainerStyle={{
                    borderBottomWidth: 0
                }}
            />
        </SearchFieldContainer>
    );
};