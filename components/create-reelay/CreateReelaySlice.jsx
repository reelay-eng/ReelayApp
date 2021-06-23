import { createSlice } from '@reduxjs/toolkit';

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        overlayVisible: true,
        searchResults: [],
        titleObject: null,
        videoSource: null,
    },
    reducers: {
        setSearchResults: (state, action) => {
            // action.payload contains an array of TMDbObjects
            state.searchResults = action.payload;
        },
        setVideoSource: (state, action) => {
            // action.payload contains videoSource string
            state.videoSource = action.payload;
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

export const { 
    setSearchResults, 
    setVideoSource,
    tagTitle, 
    untagTitle 
} = createReelaySlice.actions
export default createReelaySlice.reducer