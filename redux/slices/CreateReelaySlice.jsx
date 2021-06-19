import { createSlice } from '@reduxjs/toolkit';
import tmdbAPIStubSearch from '../../src/testdata/tmdb-api-stub';

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        overlayVisible: true,
        searchResults: [],
        titleObject: null,
    },
    reducers: {
        reset: (state) => {
            state = initialState;
        },
        setSearchResults: (state, action) => {
            // action.payload contains an array of TMDbObjects
            state.searchResults = action.payload;
        },
        tagTitle: (state, action) => {
            // action.payload contains a TMDbObject
            state.titleObject = action.payload;
            state.overlayVisible = false;
        },
        untagTitle: (state) => {
            state.titleObject = null;
            state.overlayVisible = true;
        },
    }
});

export const { reset, setSearchResults, tagTitle, untagTitle } = createReelaySlice.actions
export default createReelaySlice.reducer