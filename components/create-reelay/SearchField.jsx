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
                    fontFamily: 'Outfit-Regular',
                    fontSize: 20,
                    fontStyle: "normal",
                    lineHeight: 24,
                    letterSpacing: 0.15,
                    textAlign: "left",
                }}
                inputContainerStyle={{
                    borderBottomWidth: 0
                }}
            />
        </SearchFieldContainer>
    );
};