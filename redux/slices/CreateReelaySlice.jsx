import { createSlice } from '@reduxjs/toolkit';
import tmdbAPIStubSearch from '../../src/testdata/tmdb-api-stub';

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        titleObject: null,
        searchResults: []
    },
    reducers: {
        tagTitle: (state, action) => {
            // action.payload contains a TMDbObject
            state.titleObject = action.payload;
        },
        untagTitle: (state) => {
            state.titleObject = null;
        },
        searchForTitles: (state, action) => {
            const searchText = action.payload;

            // TODO: search TMDb
            const results = tmdbAPIStubSearch(searchText);
            state.searchResults = results;
        }
    }
});

export const { tagTitle, untagTitle, searchForTitles } = createReelaySlice.actions
export default createReelaySlice.reducer