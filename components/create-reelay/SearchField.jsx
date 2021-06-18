import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';
import { searchForTitles, tagTitle } from '../../redux/slices/CreateReelaySlice';

const SearchFieldContainer = styled.View``

export default SearchField = () => {
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();

    const taggedTitle = useSelector((state) => state.createReelay.titleTMDbObject);

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