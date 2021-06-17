import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { searchForTitles, tagTitle } from '../../redux/slices/CreateReelaySlice';

const SearchFieldContainer = styled.View``

const TMDBSearchField = () => {
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();

    const taggedTitle = useSelector((state) => state.createReelay.titleTMDbObject);
    const searchResults = useSelector((state) => state.createReelay.searchResults);

    const updateSearch = (newSearchText) => {
        setSearchText(newSearchText);
        dispatch(searchForTitles(newSearchText));
    }

    return (
        <SearchFieldContainer>
            <SearchBar
                placeholder="Enter a movie title..."
                onChangeText={updateSearch}
                value={searchText}
                platform={'default'}
                lightTheme
            />
        </SearchFieldContainer>
    );
};

export default TMDBSearchField;