import { createSlice } from '@reduxjs/toolkit';
import tmdbAPIStubSearch from '../../src/testdata/tmdb-api-stub';

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        titleTMDbObject: null,
        searchResults: []
    },
    reducers: {
        tagTitle: (state, action) => {
            // action.payload contains a TMDbObject
            state.titleTMDbObject = action.payload;
        },
        untagTitle: (state) => {
            state.titleTMDbObject = null;
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