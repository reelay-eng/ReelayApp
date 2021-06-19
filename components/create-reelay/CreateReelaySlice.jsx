import { createSlice } from '@reduxjs/toolkit';

export const createReelaySlice = createSlice({
    name: 'createReelay',
    initialState: {
        creationStage: 'SELECT_TITLE',
        overlayVisible: true,
        searchResults: [],
        titleObject: null,
        videoSource: null,
    },
    reducers: {
        reset: (state) => {
            // todo
            state.creationStage = 'SELECT_TITLE';
        },
        setSearchResults: (state, action) => {
            // action.payload contains an array of TMDbObjects
            state.searchResults = action.payload;
        },
        setStage: (state, action) => {
            // action.payload contains creationStage string
            state.creationStage = action.payload;
        },
        setVideoSource: (state, action) => {
            // action.payload contains videoSource string
            state.videoSource = action.payload;
        },
        tagTitle: (state, action) => {
            // action.payload contains a TMDbObject
            state.creationStage = 'CAMERA_PREVIEW';
            state.titleObject = action.payload;
            state.overlayVisible = false;
        },
        untagTitle: (state) => {
            state.creationStage = 'SELECT_TITLE';
            state.titleObject = null;
            state.overlayVisible = true;
        },
    }
});

export const { 
    reset, 
    setSearchResults, 
    setStage,
    setVideoSource,
    tagTitle, 
    untagTitle 
} = createReelaySlice.actions
export default createReelaySlice.reducer